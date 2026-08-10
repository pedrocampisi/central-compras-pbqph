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
import { ListToolbar, ToggleGroup } from '../../components/ListToolbar/ListToolbar';
import type { Column } from '../../components/DataTable/DataTable';
import type { Obra } from '../../domain/types';

export function ObrasPage() {
  const data = useDataStore((s) => s.data);

  // Filtro no uiStore: persiste ao trocar de aba (mesmo padrão do Histórico).
  const { search, status: showAtivas } = useUiStore((s) => s.obraFilter);
  const setObraFilter = useUiStore((s) => s.setObraFilter);

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

  // Criar/excluir obra não existem nesta versão: a camada de dados não grava
  // obras no banco. O drawer abre só para consulta (e para conectar a pasta
  // de PDFs, que é local do navegador e funciona de verdade).
  function openEdit(o: Obra) {
    setEditing(o);
    setDrawerOpen(true);
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
      </div>

      {/* Filtros */}
      <ListToolbar
        searchValue={search}
        searchPlaceholder="Buscar por nome, CEI, responsável, cidade…"
        onSearchChange={(v) => setObraFilter({ search: v })}
      >
        <ToggleGroup
          options={['todas', 'ativas', 'inativas'] as const}
          value={showAtivas}
          onChange={(v) => setObraFilter({ status: v })}
        />
      </ListToolbar>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🏗"
          title="Nenhuma obra encontrada"
          description={
            data.obras.length === 0
              ? 'As obras são cadastradas no banco central.'
              : 'Tente ajustar os filtros de busca.'
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
              <Button variant="ghost" size="sm" onClick={() => openEdit(o)}>Ver / Pasta</Button>
            </div>
          )}
        />
      )}

      {/* Drawer */}
      {drawerOpen && (
        <ObraDrawer
          open
          obra={editing}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
