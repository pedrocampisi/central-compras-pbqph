/**
 * Aba Fornecedores — lista com busca + drawer CRUD.
 * Portado de renderFornecedores / openFornecedorDrawer (CentralCompras-PBQPH.html).
 */

import { useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { DataTable } from '../../components/DataTable/DataTable';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { FornecedorDrawer } from './FornecedorDrawer';
import { ListToolbar, ToggleGroup } from '../../components/ListToolbar/ListToolbar';
import type { Column } from '../../components/DataTable/DataTable';
import type { Fornecedor } from '../../domain/types';

export function FornecedoresPage() {
  const data = useDataStore((s) => s.data);
  // Filtro no uiStore: persiste ao trocar de aba (mesmo padrão do Histórico).
  const { search, status: showAtivos } = useUiStore((s) => s.fornFilter);
  const setFornFilter = useUiStore((s) => s.setFornFilter);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);

  if (!data) return null;

  // Filtros
  const filtered = data.fornecedores.filter((f) => {
    if (showAtivos === 'ativos' && !f.ativo) return false;
    if (showAtivos === 'inativos' && f.ativo) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.razao_social.toLowerCase().includes(q) ||
        f.nome_fantasia.toLowerCase().includes(q) ||
        f.cnpj.includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.endereco.cidade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function openNew() {
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEdit(f: Fornecedor) {
    setEditing(f);
    setDrawerOpen(true);
  }

  // Excluir fornecedor não existe nesta versão (a camada de dados não apaga
  // no banco). Para tirar um fornecedor de circulação, desative-o no drawer.

  const columns: Column<Fornecedor>[] = [
    {
      key: 'razao_social',
      label: 'Razão Social',
      render: (f) => (
        <div>
          <strong>{f.razao_social}</strong>
          {f.nome_fantasia && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{f.nome_fantasia}</div>
          )}
        </div>
      ),
    },
    { key: 'cnpj', label: 'CNPJ', render: (f) => f.cnpj || '—' },
    {
      key: 'email',
      label: 'E-mail / Telefone',
      render: (f) => (
        <div>
          {f.email && <div style={{ fontSize: 12 }}>{f.email}</div>}
          {f.telefones[0] && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.telefones[0]}</div>}
        </div>
      ),
    },
    {
      key: 'cidade',
      label: 'Cidade',
      render: (f) =>
        f.endereco.cidade
          ? `${f.endereco.cidade}${f.endereco.uf ? `/${f.endereco.uf}` : ''}`
          : '—',
    },
    {
      key: 'ativo',
      label: 'Ativo',
      render: (f) => (
        <span
          style={{
            color: f.ativo ? 'var(--green)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {f.ativo ? '✓ Ativo' : '— Inativo'}
        </span>
      ),
    },
  ];

  return (
    <div className="section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Fornecedores</h2>
          <p className="section-sub">
            {filtered.length} de {data.fornecedores.length} cadastrado(s)
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>
          + Novo Fornecedor
        </Button>
      </div>

      {/* Filtros */}
      <ListToolbar
        searchValue={search}
        searchPlaceholder="Buscar por razão social, CNPJ, e-mail, cidade…"
        onSearchChange={(v) => setFornFilter({ search: v })}
      >
        <ToggleGroup
          options={['todos', 'ativos', 'inativos'] as const}
          value={showAtivos}
          onChange={(v) => setFornFilter({ status: v })}
        />
      </ListToolbar>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Nenhum fornecedor encontrado"
          description={
            data.fornecedores.length === 0
              ? 'Cadastre o primeiro fornecedor clicando em "+ Novo Fornecedor".'
              : 'Tente ajustar os filtros de busca.'
          }
          action={
            data.fornecedores.length === 0
              ? { label: '+ Novo Fornecedor', onClick: openNew }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(f) => f.id}
          emptyTitle="Nenhum fornecedor encontrado"
          onRowClick={openEdit}
          rowActions={(f) => (
            <div style={{ display: 'flex', gap: 4 }}>
              <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>Editar</Button>
            </div>
          )}
        />
      )}

      {/* Drawer — montado só quando aberto, para reiniciar o form a cada abertura */}
      {drawerOpen && (
        <FornecedorDrawer
          open
          fornecedor={editing}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}
