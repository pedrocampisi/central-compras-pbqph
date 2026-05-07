/**
 * Aba Histórico de OCs — filtros + ações: editar, duplicar, regerar PDF, excluir.
 * Portado de renderHistorico (CentralCompras-PBQPH.html).
 */

import { useDataStore } from '../../stores/useDataStore';
import { useOcEditingStore } from '../../stores/useOcEditingStore';
import { useUiStore } from '../../stores/useUiStore';
import { DataTable } from '../../components/DataTable/DataTable';
import { Pill } from '../../components/Pill/Pill';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { formatBrl, formatDate, nowIso } from '../../domain/format';
import { computeOcTotals } from '../../domain/compute';
import { uid } from '../../domain/id';
import { generateOcPdfBlob, savePdfToFile } from '../../services/pdf/generateOcPdf';
import { buildPdfFilename } from '../../services/pdf/pdfFilename';
import type { OrdemCompra } from '../../domain/types';
import type { Column } from '../../components/DataTable/DataTable';
import type { StatusOc } from '../../domain/constants';
import styles from './HistoricoPage.module.css';

export function HistoricoPage() {
  const data = useDataStore((s) => s.data);
  const updateOrdemCompra = useDataStore((s) => s.updateOrdemCompra);
  const removeOrdemCompra = useDataStore((s) => s.removeOrdemCompra);
  const markDirty = useDataStore((s) => s.markDirty);

  const startEditing = useOcEditingStore((s) => s.startEditing);

  const histFilter = useUiStore((s) => s.histFilter);
  const setHistFilter = useUiStore((s) => s.setHistFilter);
  const setTab = useUiStore((s) => s.setActiveTab);
  const showToast = useUiStore((s) => s.showToast);

  if (!data) return null;

  // ── Filtros ────────────────────────────────────────────────────────────────
  let ocs = [...data.ordens_compra].sort((a, b) => (b.criado_em > a.criado_em ? 1 : -1));

  if (histFilter.search) {
    const q = histFilter.search.toLowerCase();
    ocs = ocs.filter(
      (o) =>
        o.numero.toLowerCase().includes(q) ||
        (data.fornecedores.find((f) => f.id === o.fornecedor_id)?.razao_social ?? '').toLowerCase().includes(q),
    );
  }
  if (histFilter.status) ocs = ocs.filter((o) => o.status === histFilter.status);
  if (histFilter.fornecedor) ocs = ocs.filter((o) => o.fornecedor_id === histFilter.fornecedor);
  if (histFilter.obra) ocs = ocs.filter((o) => o.obra_id === histFilter.obra);

  // ── Ações ──────────────────────────────────────────────────────────────────

  function handleEdit(oc: OrdemCompra) {
    startEditing(oc);
    setTab('nova-oc');
  }

  function handleDuplicate(oc: OrdemCompra) {
    const currentYear = new Date().getFullYear();
    const yearChanged = currentYear !== data!.config.ano_corrente;
    const nextNum = yearChanged ? 1 : data!.config.ultimo_numero_oc + 1;
    const duplicated: OrdemCompra = {
      ...structuredClone(oc),
      id: uid('oc'),
      numero: `${currentYear}/${String(nextNum).padStart(3, '0')}`,
      sequencial: nextNum,
      ano: currentYear,
      status: 'rascunho',
      data: new Date().toISOString().slice(0, 10),
      criado_em: nowIso(),
      atualizado_em: nowIso(),
      pdf_gerado_em: '',
    };
    startEditing(duplicated);
    setTab('nova-oc');
  }

  async function handleRegenPdf(oc: OrdemCompra) {
    try {
      const blob = await generateOcPdfBlob(oc, data!);
      const fornNome = data!.fornecedores.find((f) => f.id === oc.fornecedor_id)?.razao_social ?? '';
      const filename = buildPdfFilename(oc, fornNome);
      await savePdfToFile(blob, filename);
      updateOrdemCompra({ ...oc, pdf_gerado_em: nowIso(), atualizado_em: nowIso() });
      markDirty();
      showToast('PDF regenerado.', 'success');
    } catch (err) {
      showToast(`Erro ao gerar PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  }

  function handleStatusChange(oc: OrdemCompra, status: StatusOc) {
    updateOrdemCompra({ ...oc, status, atualizado_em: nowIso() });
    markDirty();
    showToast(`Status alterado para "${status}".`, 'success');
  }

  function handleDelete(oc: OrdemCompra) {
    if (!window.confirm(`Excluir OC ${oc.numero}? Esta ação não pode ser desfeita.`)) return;
    removeOrdemCompra(oc.id);
    markDirty();
    showToast('OC excluída.', 'success');
  }

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: Column<OrdemCompra>[] = [
    {
      key: 'numero',
      label: 'Número',
      render: (o) => <strong style={{ fontFamily: 'monospace' }}>{o.numero}</strong>,
    },
    { key: 'data', label: 'Data', render: (o) => formatDate(o.data) },
    {
      key: 'fornecedor',
      label: 'Fornecedor',
      render: (o) => data.fornecedores.find((f) => f.id === o.fornecedor_id)?.razao_social || '—',
    },
    {
      key: 'obra',
      label: 'Obra',
      render: (o) => data.obras.find((ob) => ob.id === o.obra_id)?.nome || '—',
    },
    {
      key: 'itens',
      label: 'Itens',
      render: (o) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{o.itens.length}</span>,
    },
    {
      key: 'total',
      label: 'Total',
      render: (o) => (
        <strong style={{ color: 'var(--navy)', fontFamily: 'inherit' }}>
          {formatBrl(computeOcTotals(o).total_geral)}
        </strong>
      ),
      align: 'right',
    },
    { key: 'status', label: 'Status', render: (o) => <Pill status={o.status} /> },
  ];

  return (
    <div className="section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2>Histórico de OCs</h2>
          <p className="section-sub">
            {ocs.length} de {data.ordens_compra.length} registro(s)
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setTab('nova-oc')}>
          + Nova OC
        </Button>
      </div>

      {/* Filtros */}
      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Buscar por número, fornecedor…"
          value={histFilter.search}
          onChange={(e) => setHistFilter({ search: e.target.value })}
        />
        <select
          className={styles.filterSelect}
          value={histFilter.status}
          onChange={(e) => setHistFilter({ status: e.target.value as StatusOc | '' })}
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="emitida">Emitida</option>
          <option value="entregue">Entregue</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <select
          className={styles.filterSelect}
          value={histFilter.fornecedor}
          onChange={(e) => setHistFilter({ fornecedor: e.target.value })}
        >
          <option value="">Todos fornecedores</option>
          {data.fornecedores.map((f) => (
            <option key={f.id} value={f.id}>{f.razao_social}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={histFilter.obra}
          onChange={(e) => setHistFilter({ obra: e.target.value })}
        >
          <option value="">Todas obras</option>
          {data.obras.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      {ocs.length === 0 ? (
        <EmptyState
          icon="↺"
          title="Nenhuma OC encontrada"
          description={
            data.ordens_compra.length === 0
              ? 'Crie a primeira OC clicando em "+ Nova OC".'
              : 'Tente ajustar os filtros de busca.'
          }
          action={
            data.ordens_compra.length === 0
              ? { label: '+ Nova OC', onClick: () => setTab('nova-oc') }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={ocs}
          rowKey={(o) => o.id}
          emptyTitle="Nenhuma OC encontrada"
          rowActions={(o) => (
            <div style={{ display: 'flex', gap: 4 }}>
              {o.status === 'rascunho' && (
                <Button variant="ghost" size="sm" onClick={() => handleEdit(o)}>Editar</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleDuplicate(o)}>Duplicar</Button>
              {o.status !== 'rascunho' && (
                <Button variant="ghost" size="sm" onClick={() => void handleRegenPdf(o)}>PDF</Button>
              )}
              {o.status === 'emitida' && (
                <Button variant="ghost" size="sm" onClick={() => handleStatusChange(o, 'entregue')}>
                  ✓ Entregue
                </Button>
              )}
              {o.status !== 'cancelada' && (
                <Button variant="ghost" size="sm" onClick={() => handleStatusChange(o, 'cancelada')}>
                  Cancelar
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => handleDelete(o)}>Excluir</Button>
            </div>
          )}
        />
      )}
    </div>
  );
}
