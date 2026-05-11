/**
 * Aba Prestadores de Serviço — lista, filtros, CRUD via drawer.
 * Avaliação digital (CONFORME / NÃO CONFORME) substitui o carimbo físico
 * usado nas obras Campisi para atender a norma PBQP-H.
 *
 * Espelha o padrão de FornecedoresPage para manter consistência visual e código previsível.
 */

import { useMemo, useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { DataTable } from '../../components/DataTable/DataTable';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { PrestadorDrawer } from './PrestadorDrawer';
import { CATEGORIAS_SERVICO } from '../../domain/constants';
import type { Column } from '../../components/DataTable/DataTable';
import type { PrestadorServico } from '../../domain/types';
import styles from './PrestadoresPage.module.css';

interface IndicadoresPrestador {
  total: number;
  conforme: number;
  ultima: string;
}

export function PrestadoresPage() {
  const data = useDataStore((s) => s.data);
  const removePrestador = useDataStore((s) => s.removePrestador);
  const showToast = useUiStore((s) => s.showToast);
  const prestadorFilter = useUiStore((s) => s.prestadorFilter);
  const setPrestadorFilter = useUiStore((s) => s.setPrestadorFilter);

  const [showAtivos, setShowAtivos] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PrestadorServico | null>(null);

  // Indicadores agregados por prestador (memoizado para listas grandes).
  // Não persiste — derivado puro do array de avaliações.
  const indicadores = useMemo<Record<string, IndicadoresPrestador>>(() => {
    const out: Record<string, IndicadoresPrestador> = {};
    if (!data) return out;
    for (const a of data.avaliacoes_prestadores) {
      const ind = out[a.prestador_id] ?? { total: 0, conforme: 0, ultima: '' };
      ind.total += 1;
      // Conforme = TODOS os 3 critérios marcados como CONFORME.
      // Critério não-avaliado (null) faz a avaliação NÃO contar como totalmente conforme.
      if (
        a.atendeu_prazo === 'CONFORME' &&
        a.usou_epi === 'CONFORME' &&
        a.conforme_pes === 'CONFORME'
      ) {
        ind.conforme += 1;
      }
      if (!ind.ultima || a.data_avaliacao > ind.ultima) ind.ultima = a.data_avaliacao;
      out[a.prestador_id] = ind;
    }
    return out;
  }, [data]);

  if (!data) return null;

  // Filtros
  const filtered = data.prestadores_servico.filter((p) => {
    if (showAtivos === 'ativos' && !p.ativo) return false;
    if (showAtivos === 'inativos' && p.ativo) return false;
    if (prestadorFilter.categoria && p.categoria_servico !== prestadorFilter.categoria) return false;
    if (prestadorFilter.search.trim()) {
      const q = prestadorFilter.search.toLowerCase();
      return (
        p.razao_social.toLowerCase().includes(q) ||
        p.nome_fantasia.toLowerCase().includes(q) ||
        p.cnpj_cpf.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.endereco.cidade.toLowerCase().includes(q) ||
        p.categoria_servico.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function openNew() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(p: PrestadorServico) {
    setEditing(p);
    setDrawerOpen(true);
  }

  function handleDelete(p: PrestadorServico) {
    const n = indicadores[p.id]?.total ?? 0;
    const msg = n > 0
      ? `Excluir "${p.razao_social}"? Isso também removerá ${n} avaliação(ões) vinculada(s). Esta ação não pode ser desfeita.`
      : `Excluir "${p.razao_social}"? Esta ação não pode ser desfeita.`;
    if (!window.confirm(msg)) return;
    removePrestador(p.id);
    showToast('Prestador excluído.', 'success');
  }

  const columns: Column<PrestadorServico>[] = [
    {
      key: 'razao_social',
      label: 'Razão Social',
      render: (p) => (
        <div>
          <strong>{p.razao_social || '—'}</strong>
          {p.nome_fantasia && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{p.nome_fantasia}</div>
          )}
        </div>
      ),
    },
    {
      key: 'tipo_doc',
      label: 'Tipo · Doc',
      render: (p) => (
        <div style={{ fontSize: 12 }}>
          <span style={{ fontWeight: 600 }}>{p.tipo}</span>
          {p.cnpj_cpf && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.cnpj_cpf}</div>}
        </div>
      ),
    },
    {
      key: 'categoria',
      label: 'Categoria',
      render: (p) => p.categoria_servico || '—',
    },
    {
      key: 'cidade',
      label: 'Cidade',
      render: (p) =>
        p.endereco.cidade
          ? `${p.endereco.cidade}${p.endereco.uf ? `/${p.endereco.uf}` : ''}`
          : '—',
    },
    {
      key: 'avaliacoes',
      label: 'Avaliações',
      align: 'right',
      render: (p) => {
        const ind = indicadores[p.id];
        if (!ind || ind.total === 0) {
          return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>;
        }
        const pct = Math.round((ind.conforme / ind.total) * 100);
        const cor = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';
        return (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, color: cor, fontSize: 12 }}>
              {pct}% conforme
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {ind.conforme}/{ind.total}
            </div>
          </div>
        );
      },
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (p) => (
        <span
          style={{
            color: p.ativo ? 'var(--green)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {p.ativo ? '✓ Ativo' : '— Inativo'}
        </span>
      ),
    },
  ];

  return (
    <div className="section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Prestadores de Serviço</h2>
          <p className="section-sub">
            {filtered.length} de {data.prestadores_servico.length} cadastrado(s) ·
            {' '}{data.avaliacoes_prestadores.length} avaliação(ões) registrada(s)
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>
          + Novo Prestador
        </Button>
      </div>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Buscar por razão social, CNPJ/CPF, categoria, cidade…"
          value={prestadorFilter.search}
          onChange={(e) => setPrestadorFilter({ search: e.target.value })}
        />
        <select
          className={styles.filterSelect}
          value={prestadorFilter.categoria}
          onChange={(e) => setPrestadorFilter({ categoria: e.target.value })}
        >
          <option value="">Todas categorias</option>
          {CATEGORIAS_SERVICO.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className={styles.toggleGroup}>
          {(['todos', 'ativos', 'inativos'] as const).map((v) => (
            <button
              key={v}
              className={[styles.toggleBtn, showAtivos === v ? styles.toggleActive : ''].join(' ')}
              onClick={() => setShowAtivos(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔧"
          title="Nenhum prestador encontrado"
          description={
            data.prestadores_servico.length === 0
              ? 'Cadastre o primeiro prestador de serviço clicando em "+ Novo Prestador".'
              : 'Tente ajustar os filtros de busca.'
          }
          action={
            data.prestadores_servico.length === 0
              ? { label: '+ Novo Prestador', onClick: openNew }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          emptyTitle="Nenhum prestador encontrado"
          onRowClick={openEdit}
          rowActions={(p) => (
            <div style={{ display: 'flex', gap: 4 }}>
              <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Abrir</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(p)}>Excluir</Button>
            </div>
          )}
        />
      )}

      {/* Drawer */}
      <PrestadorDrawer
        open={drawerOpen}
        prestador={editing}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
