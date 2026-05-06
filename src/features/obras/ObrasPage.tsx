/**
 * Aba Obras — lista com busca + drawer CRUD.
 * Portado de renderObras (CentralCompras-PBQPH.html).
 */

import { useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { DataTable } from '../../components/DataTable/DataTable';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { ObraDrawer } from './ObraDrawer';
import type { Column } from '../../components/DataTable/DataTable';
import type { Obra } from '../../domain/types';
import styles from './ObrasPage.module.css';

export function ObrasPage() {
  const data = useDataStore((s) => s.data);
  const removeObra = useDataStore((s) => s.removeObra);
  const showToast = useUiStore((s) => s.showToast);

  const [search, setSearch] = useState('');
  const [showAtivas, setShowAtivas] = useState<'todas' | 'ativas' | 'inativas'>('todas');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Obra | null>(null);

  if (!data) return null;

  const filtered = data.obras.filter((o) => {
    if (showAtivas === 'ativas' && !o.ativa) return false;
    if (showAtivas === 'inativas' && o.ativa) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.nome.toLowerCase().includes(q) ||
        o.cei.toLowerCase().includes(q) ||
        o.responsavel.toLowerCase().includes(q) ||
        o.endereco.cidade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function openNew() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(o: Obra) {
    setEditing(o);
    setDrawerOpen(true);
  }

  function handleDelete(o: Obra) {
    if (!window.confirm(`Excluir "${o.nome}"? Esta ação não pode ser desfeita.`)) return;
    removeObra(o.id);
    showToast('Obra excluída.', 'success');
  }

  const columns: Column<Obra>[] = [
    {
      key: 'nome',
      label: 'Nome',
      render: (o) => (
        <div>
          <strong>{o.nome}</strong>
          {o.cei && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>CEI: {o.cei}</div>
          )}
        </div>
      ),
    },
    {
      key: 'responsavel',
      label: 'Responsável / Telefone',
      render: (o) => (
        <div>
          {o.responsavel && <div style={{ fontSize: 12 }}>{o.responsavel}</div>}
          {o.telefone && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.telefone}</div>}
        </div>
      ),
    },
    {
      key: 'cidade',
      label: 'Cidade',
      render: (o) =>
        o.endereco.cidade
          ? `${o.endereco.cidade}${o.endereco.uf ? `/${o.endereco.uf}` : ''}`
          : '—',
    },
    {
      key: 'pasta_oc_path',
      label: 'Pasta OCs',
      render: (o) => (
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: o.pasta_oc_path ? 'var(--text)' : 'var(--text-muted)' }}>
          {o.pasta_oc_path || '—'}
        </span>
      ),
    },
    {
      key: 'ativa',
      label: 'Ativa',
      render: (o) => (
        <span style={{ color: o.ativa ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>
          {o.ativa ? '✓ Ativa' : '— Inativa'}
        </span>
      ),
    },
  ];

  return (
    <div className="section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Obras</h2>
          <p className="section-sub">
            {filtered.length} de {data.obras.length} cadastrada(s)
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>
          + Nova Obra
        </Button>
      </div>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Buscar por nome, CEI, responsável, cidade…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.toggleGroup}>
          {(['todas', 'ativas', 'inativas'] as const).map((v) => (
            <button
              key={v}
              className={[styles.toggleBtn, showAtivas === v ? styles.toggleActive : ''].join(' ')}
              onClick={() => setShowAtivas(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🏗"
          title="Nenhuma obra encontrada"
          description={
            data.obras.length === 0
              ? 'Cadastre a primeira obra clicando em "+ Nova Obra".'
              : 'Tente ajustar os filtros de busca.'
          }
          action={
            data.obras.length === 0
              ? { label: '+ Nova Obra', onClick: openNew }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(o) => o.id}
          emptyTitle="Nenhuma obra encontrada"
          onRowClick={openEdit}
          rowActions={(o) => (
            <div style={{ display: 'flex', gap: 4 }}>
              <Button variant="ghost" size="sm" onClick={() => openEdit(o)}>Editar</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(o)}>Excluir</Button>
            </div>
          )}
        />
      )}

      {/* Drawer */}
      <ObraDrawer
        open={drawerOpen}
        obra={editing}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
