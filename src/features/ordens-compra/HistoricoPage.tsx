/**
 * Aba Histórico de OCs — filtros + ações: editar, duplicar, regerar PDF, excluir.
 * Portado de renderHistorico (CentralCompras-PBQPH.html).
 */

import { useMemo } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useOcEditingStore } from '../../stores/useOcEditingStore';
import { useUiStore } from '../../stores/useUiStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { podeEmitirOc } from '../../services/supabase/auth';
import { DataTable } from '../../components/DataTable/DataTable';
import { Pill } from '../../components/Pill/Pill';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Icon } from '../../components/Icon/Icon';
import { formatBrl, formatDate, nowIso, todayIso } from '../../domain/format';
import { computeOcTotals } from '../../domain/compute';
import { uid } from '../../domain/id';
import { generateOcPdfBlob, savePdfToFile } from '../../services/pdf/generateOcPdf';
import { buildPdfFilename } from '../../services/pdf/pdfFilename';
import { downloadBlob } from '../../services/storage/download';
import type { OrdemCompra } from '../../domain/types';
import type { Column } from '../../components/DataTable/DataTable';
import type { StatusOc } from '../../domain/constants';
import { salvarOrdemCompra } from '../../services/supabase/dados';
import { recarregarDados } from '../../services/supabase/sync';
import { ListToolbar, FilterSelect } from '../../components/ListToolbar/ListToolbar';

export function HistoricoPage() {
  const data = useDataStore((s) => s.data);

  const startEditing = useOcEditingStore((s) => s.startEditing);

  // Espelho da permissão do banco: quem não pode gravar OC não deve ver botão
  // que só vai tomar erro do RLS depois do clique. A trava real é do banco.
  const perfil = useAuthStore((s) => s.perfil);
  const gravaOk = podeEmitirOc(perfil?.papel);
  const semPermissao = 'Seu acesso é somente leitura para ordens de compra';

  const histFilter = useUiStore((s) => s.histFilter);
  const setHistFilter = useUiStore((s) => s.setHistFilter);
  const setTab = useUiStore((s) => s.setActiveTab);
  const showToast = useUiStore((s) => s.showToast);

  // ── Lookups e filtros (memoizados — busca deixa de ser O(n×m) por tecla) ──
  const fornecedorNome = useMemo(
    () => new Map((data?.fornecedores ?? []).map((f) => [f.id, f.razao_social])),
    [data],
  );
  const obraNome = useMemo(
    () => new Map((data?.obras ?? []).map((o) => [o.id, o.nome])),
    [data],
  );

  const ocs = useMemo(() => {
    if (!data) return [];
    let list = [...data.ordens_compra].sort((a, b) => (b.criado_em > a.criado_em ? 1 : -1));
    if (histFilter.search) {
      const q = histFilter.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.numero.toLowerCase().includes(q) ||
          (fornecedorNome.get(o.fornecedor_id) ?? '').toLowerCase().includes(q),
      );
    }
    if (histFilter.status) list = list.filter((o) => o.status === histFilter.status);
    if (histFilter.fornecedor) list = list.filter((o) => o.fornecedor_id === histFilter.fornecedor);
    if (histFilter.obra) list = list.filter((o) => o.obra_id === histFilter.obra);
    return list;
  }, [data, histFilter, fornecedorNome]);

  if (!data) return null;

  // ── Ações ──────────────────────────────────────────────────────────────────

  function handleEdit(oc: OrdemCompra) {
    startEditing(oc);
    setTab('nova-oc');
  }

  function handleDuplicate(oc: OrdemCompra) {
    // Sem número: o banco numera ao salvar (reservarNumeroOc), nunca o navegador.
    const duplicated: OrdemCompra = {
      ...structuredClone(oc),
      id: uid('oc'),
      numero: '',
      sequencial: 0,
      ano: new Date().getFullYear(),
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
      // Grava o carimbo no banco — sem isso a data de geração se perdia no reload.
      // Quem é somente-leitura leva o PDF do mesmo jeito (é consulta, não edição),
      // mas não tenta gravar: o banco recusaria e a tela mostraria um erro à toa.
      if (gravaOk) {
        await salvarOrdemCompra({ ...oc, pdf_gerado_em: nowIso(), atualizado_em: nowIso() });
        await recarregarDados();
      }
      showToast('PDF regenerado.', 'success');
    } catch (err) {
      showToast(`Erro ao gerar PDF: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  }

  async function handleStatusChange(oc: OrdemCompra, status: StatusOc) {
    try {
      // Mudança de status é gravação de OC — a camada já suporta (salvarOrdemCompra).
      await salvarOrdemCompra({ ...oc, status, atualizado_em: nowIso() });
      await recarregarDados();
      showToast(`Status alterado para "${status}".`, 'success');
    } catch (err) {
      showToast(`Erro ao alterar status: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    }
  }

  /** Exporta as OCs visíveis (com filtros aplicados) em CSV compatível com Excel pt-BR. */
  function handleExportCsv() {
    const header = ['Número', 'Data', 'Fornecedor', 'Obra', 'Status', 'Qtd. Itens', 'Total (R$)'];
    const rows = ocs.map((o) => [
      o.numero,
      formatDate(o.data),
      fornecedorNome.get(o.fornecedor_id) ?? '',
      obraNome.get(o.obra_id) ?? '',
      o.status,
      String(o.itens.length),
      computeOcTotals(o).total_geral.toFixed(2).replace('.', ','),
    ]);
    const escape = (c: string) => `"${c.replace(/"/g, '""')}"`;
    // BOM + separador ';' → abre direto no Excel brasileiro com acentos corretos.
    const csv = '\ufeff' + [header, ...rows].map((r) => r.map(escape).join(';')).join('\r\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `historico-ocs-${todayIso()}.csv`);
    showToast(`${ocs.length} OC(s) exportada(s) para CSV.`, 'success');
  }

  // Excluir OC não existe nesta versão (a camada de dados não apaga no banco,
  // e o número da OC precisa continuar ocupado). Use "Cancelar" para
  // invalidar uma OC — ela permanece no histórico, como manda o PBQP-H.

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
      render: (o) => fornecedorNome.get(o.fornecedor_id) || '—',
    },
    {
      key: 'obra',
      label: 'Obra',
      render: (o) => obraNome.get(o.obra_id) || '—',
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
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={ocs.length === 0}>
            <Icon name="download" size={13} /> Exportar CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setTab('nova-oc')}
            disabled={!gravaOk}
            title={gravaOk ? undefined : semPermissao}
          >
            + Nova OC
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <ListToolbar
        searchValue={histFilter.search}
        searchPlaceholder="Buscar por número, fornecedor…"
        onSearchChange={(v) => setHistFilter({ search: v })}
      >
        <FilterSelect
          value={histFilter.status}
          onChange={(e) => setHistFilter({ status: e.target.value as StatusOc | '' })}
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="emitida">Emitida</option>
          <option value="entregue">Entregue</option>
          <option value="cancelada">Cancelada</option>
        </FilterSelect>
        <FilterSelect
          value={histFilter.fornecedor}
          onChange={(e) => setHistFilter({ fornecedor: e.target.value })}
        >
          <option value="">Todos fornecedores</option>
          {data.fornecedores.map((f) => (
            <option key={f.id} value={f.id}>{f.razao_social}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={histFilter.obra}
          onChange={(e) => setHistFilter({ obra: e.target.value })}
        >
          <option value="">Todas obras</option>
          {data.obras.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </FilterSelect>
      </ListToolbar>

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
            data.ordens_compra.length === 0 && gravaOk
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
              {o.status === 'rascunho' && gravaOk && (
                <Button variant="ghost" size="sm" onClick={() => handleEdit(o)}>Editar</Button>
              )}
              {gravaOk && (
                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(o)}>Duplicar</Button>
              )}
              {o.status !== 'rascunho' && (
                <Button variant="ghost" size="sm" onClick={() => void handleRegenPdf(o)}>PDF</Button>
              )}
              {o.status === 'emitida' && gravaOk && (
                <Button variant="ghost" size="sm" onClick={() => void handleStatusChange(o, 'entregue')}>
                  ✓ Entregue
                </Button>
              )}
              {o.status !== 'cancelada' && gravaOk && (
                <Button variant="ghost" size="sm" onClick={() => void handleStatusChange(o, 'cancelada')}>
                  Cancelar
                </Button>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}
