/**
 * Aba Nova OC — criação e edição de Ordem de Compra.
 * Portado de renderNovaOC / renderItems / renderTotals / saveOcAndGeneratePdf
 * (CentralCompras-PBQPH.html linhas 1280-1722).
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useOcEditingStore } from '../../stores/useOcEditingStore';
import { useUiStore } from '../../stores/useUiStore';
import { Field } from '../../components/Field/Field';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Icon } from '../../components/Icon/Icon';
import { computeItemTotal, computeOcTotals } from '../../domain/compute';
import { formatBrl, todayIso, nowIso } from '../../domain/format';
import { uid } from '../../domain/id';
import { UN_PADRAO } from '../../domain/constants';
import { generateOcPdfBlob, savePdfToFile } from '../../services/pdf/generateOcPdf';
import { buildPdfFilename } from '../../services/pdf/pdfFilename';
import { fileToImagesBase64 } from '../../services/ai/pdfToImages';
import { extractItemsFromImages } from '../../services/ai/extractItems';
import { getObraDirHandle } from '../../services/storage/handles';
import { verifyHandlePermission } from '../../services/storage/permissions';
import { salvarOrdemCompra, marcarPdfGerado, ConflitoDeVersao } from '../../services/supabase/dados';
import { recarregarDados } from '../../services/supabase/sync';
import { podeEditar, podeEmitirOc } from '../../services/supabase/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { confirmAsync } from '../../stores/useConfirmStore';
import type { OrdemCompra, Item } from '../../domain/types';
import styles from './NovaOcPage.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * OC nova em edição. O número fica VAZIO de propósito: quem numera é o banco,
 * e só na EMISSÃO — rascunho aberto e descartado não pode queimar um número do
 * PBQP-H. Numerar no navegador produzia número repetido quando duas pessoas
 * emitiam ao mesmo tempo.
 */
function buildNewOc(
  ano: number,
  defaultEmitenteId: string,
  defaultFornecedorId: string,
  defaultObraId: string,
  defaultCondicao: string,
): OrdemCompra {
  return {
    id: uid('oc'),
    numero: '',
    sequencial: 0,
    versao: 0,
    ano,
    data: todayIso(),
    status: 'rascunho',
    emitente_id: defaultEmitenteId,
    fornecedor_id: defaultFornecedorId,
    obra_id: defaultObraId,
    condicao_pagamento: defaultCondicao,
    itens: [],
    frete: 0,
    outras_despesas: 0,
    desconto_material: 0,
    observacoes: '',
    criado_em: nowIso(),
    atualizado_em: nowIso(),
    pdf_gerado_em: '',
  };
}

// ── Items table ───────────────────────────────────────────────────────────────

interface ItemsTableProps {
  items: Item[];
  ecrs: { id: number; codigo: string; nome: string }[];
  onUpdate: (id: string, partial: Partial<Item>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

function ItemsTable({ items, ecrs, onUpdate, onRemove, onAdd }: ItemsTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhum item adicionado"
        description={'Clique em "+ Adicionar Item" ou importe um pedido via IA.'}
        action={{ label: '+ Adicionar Item', onClick: onAdd }}
      />
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th style={{ width: 32 }}>#</th>
            <th style={{ width: 110 }}>ECR</th>
            <th>Descrição</th>
            <th style={{ width: 80 }}>Obs.</th>
            <th style={{ width: 70 }}>Qtd</th>
            <th style={{ width: 60 }}>Un</th>
            <th style={{ width: 90 }}>Preço Unit.</th>
            <th style={{ width: 60 }}>IPI%</th>
            <th style={{ width: 60 }}>Desc%</th>
            <th style={{ width: 80 }}>Prazo</th>
            <th style={{ width: 90, textAlign: 'right' }}>Total</th>
            <th style={{ width: 36 }} />
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => {
            const { total } = computeItemTotal(it);
            return (
              <tr key={it.id}>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>{idx + 1}</td>
                <td>
                  <select
                    className={styles.cellSelect}
                    value={it.ecr_id ?? ''}
                    onChange={(e) => onUpdate(it.id, { ecr_id: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">—</option>
                    {ecrs.map((ecr) => (
                      <option key={ecr.id} value={ecr.id}>{ecr.codigo}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    value={it.descricao}
                    placeholder="Descrição do item"
                    onChange={(e) => onUpdate(it.id, { descricao: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    value={it.observacao}
                    onChange={(e) => onUpdate(it.id, { observacao: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    type="number"
                    min={0}
                    step="any"
                    value={it.quantidade === 0 ? '' : it.quantidade}
                    onChange={(e) => onUpdate(it.id, { quantidade: Number(e.target.value) || 0 })}
                  />
                </td>
                <td>
                  <select
                    className={styles.cellSelect}
                    value={it.unidade}
                    onChange={(e) => onUpdate(it.id, { unidade: e.target.value })}
                  >
                    {UN_PADRAO.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    type="number"
                    min={0}
                    step="any"
                    value={it.preco_unit === 0 ? '' : it.preco_unit}
                    onChange={(e) => onUpdate(it.id, { preco_unit: Number(e.target.value) || 0 })}
                  />
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={it.ipi_pct === 0 ? '' : it.ipi_pct}
                    onChange={(e) => onUpdate(it.id, { ipi_pct: Number(e.target.value) || 0 })}
                  />
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    value={it.desc_pct === 0 ? '' : it.desc_pct}
                    onChange={(e) => onUpdate(it.id, { desc_pct: Number(e.target.value) || 0 })}
                  />
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    value={it.prazo_entrega}
                    placeholder="Ex: 7 dias"
                    onChange={(e) => onUpdate(it.id, { prazo_entrega: e.target.value })}
                  />
                </td>
                <td style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' }}>
                  {formatBrl(total)}
                </td>
                <td>
                  <button
                    className={styles.removeBtn}
                    onClick={() => onRemove(it.id)}
                    title="Remover item"
                    aria-label="Remover item"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Totals panel ──────────────────────────────────────────────────────────────

interface TotalsPanelProps {
  oc: OrdemCompra;
  onChangeField: (field: 'frete' | 'outras_despesas' | 'desconto_material', value: number) => void;
}

function TotalsPanel({ oc, onChangeField }: TotalsPanelProps) {
  const t = computeOcTotals(oc);
  return (
    <div className={styles.totalsPanel}>
      <div className={styles.totalsGrid}>
        <span>Subtotal bruto:</span>
        <span>{formatBrl(t.sub_total)}</span>
        <span>( − ) Desconto itens:</span>
        <span className={styles.totalNeg}>{formatBrl(t.desc_itens)}</span>
        <span>( + ) IPI total:</span>
        <span>{formatBrl(t.total_ipi)}</span>
        <div className={styles.totalsDivider} />
        <div className={styles.totalsDivider} />
        <label className={styles.totalsLabel}>( + ) Frete:</label>
        <input
          className={styles.totalsInput}
          type="number"
          min={0}
          step="any"
          value={oc.frete === 0 ? '' : oc.frete}
          onChange={(e) => onChangeField('frete', Number(e.target.value) || 0)}
        />
        <label className={styles.totalsLabel}>( + ) Outras despesas:</label>
        <input
          className={styles.totalsInput}
          type="number"
          min={0}
          step="any"
          value={oc.outras_despesas === 0 ? '' : oc.outras_despesas}
          onChange={(e) => onChangeField('outras_despesas', Number(e.target.value) || 0)}
        />
        <label className={styles.totalsLabel}>( − ) Desconto material:</label>
        <input
          className={styles.totalsInput}
          type="number"
          min={0}
          step="any"
          value={oc.desconto_material === 0 ? '' : oc.desconto_material}
          onChange={(e) => onChangeField('desconto_material', Number(e.target.value) || 0)}
        />
        <div className={styles.totalsDivider} />
        <div className={styles.totalsDivider} />
        <span className={styles.totalsGeralLabel}>TOTAL GERAL:</span>
        <span className={styles.totalsGeralValue}>{formatBrl(t.total_geral)}</span>
      </div>
    </div>
  );
}

// ── NovaOcPage ────────────────────────────────────────────────────────────────

export function NovaOcPage() {
  const data = useDataStore((s) => s.data);
  const perfil = useAuthStore((s) => s.perfil);

  const ocEditing = useOcEditingStore((s) => s.ocEditing);
  const startEditing = useOcEditingStore((s) => s.startEditing);
  const stopEditing = useOcEditingStore((s) => s.stopEditing);
  const updateField = useOcEditingStore((s) => s.updateField);
  const addItem = useOcEditingStore((s) => s.addItem);
  const updateItem = useOcEditingStore((s) => s.updateItem);
  const removeItem = useOcEditingStore((s) => s.removeItem);
  const appendItems = useOcEditingStore((s) => s.appendItems);

  const showToast = useUiStore((s) => s.showToast);
  const setTab = useUiStore((s) => s.setActiveTab);

  const [importing, setImporting] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // ── Inicialização ───────────────────────────────────────────────────────────
  // Runs once on mount. If ocEditing already exists (navigated from Histórico),
  // skip creation — the user is editing an existing OC.
  // OC nova nasce SEM número: o banco numera na emissão.

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!data || ocEditing) return;

    const currentYear = new Date().getFullYear();
    const defaultFornecedor = data.fornecedores.find((f) => f.ativo)?.id ?? '';
    const defaultObra = data.obras.find((o) => o.ativa)?.id ?? '';
    const defaultEmitente = data.config.emitentes[0]?.id ?? '';
    const defaultCondicao = data.config.condicoes_pagamento[0] ?? '';

    startEditing(
      buildNewOc(currentYear, defaultEmitente, defaultFornecedor, defaultObra, defaultCondicao),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────

  /**
   * Identidade da TENTATIVA de salvamento, não da OC.
   *
   * O banco usa isto para ser idempotente: repetir o mesmo identificador
   * devolve a mesma ordem de compra, sem criar outra e sem gastar outro
   * número. Por isso ele só é descartado quando a gravação dá certo — o
   * "tentar de novo" depois de uma falha precisa reaproveitar o mesmo.
   */
  const tentativaRef = useRef<string | null>(null);
  const idDaTentativa = useCallback(() => {
    tentativaRef.current ??= crypto.randomUUID();
    return tentativaRef.current;
  }, []);

  const avisarErro = useCallback(
    (verbo: string, err: unknown) => {
      // O banco já devolve a frase pronta quando outra pessoa alterou a OC —
      // reescrevê-la só tiraria a informação de qual versão está onde.
      if (err instanceof ConflitoDeVersao) {
        showToast(err.message, 'warning');
        return;
      }
      showToast(`Erro ao ${verbo}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    },
    [showToast],
  );

  const handleSaveDraft = useCallback(async () => {
    if (!ocEditing || !data) return;
    if (!ocEditing.fornecedor_id) { showToast('Selecione um fornecedor.', 'warning'); return; }
    if (!ocEditing.obra_id) { showToast('Selecione uma obra.', 'warning'); return; }
    if (ocEditing.itens.length === 0) { showToast('Adicione ao menos um item.', 'warning'); return; }

    setSavingDraft(true);
    try {
      // Rascunho não recebe número: ele nasce na emissão, para quem abre e
      // desiste não queimar um número do PBQP-H.
      const gravada = await salvarOrdemCompra(
        { ...ocEditing, status: 'rascunho', atualizado_em: nowIso() },
        idDaTentativa(),
      );
      tentativaRef.current = null;
      await recarregarDados();
      stopEditing();
      showToast(
        gravada.numero ? `Rascunho ${gravada.numero} salvo.` : 'Rascunho salvo — o número sai na emissão.',
        'success',
      );
      setTab('historico');
    } catch (err) {
      avisarErro('salvar', err);
    } finally {
      setSavingDraft(false);
    }
  }, [ocEditing, data, stopEditing, showToast, setTab, idDaTentativa, avisarErro]);

  const handleEmitir = useCallback(async () => {
    if (!ocEditing || !data) return;
    if (!ocEditing.fornecedor_id) { showToast('Selecione um fornecedor.', 'warning'); return; }
    if (!ocEditing.obra_id) { showToast('Selecione uma obra.', 'warning'); return; }
    if (ocEditing.itens.length === 0) { showToast('Adicione ao menos um item.', 'warning'); return; }

    setSavingPdf(true);
    try {
      // Uma operação só no banco: cabeçalho, itens e a reserva do número. Se
      // qualquer parte falhar, nada fica gravado pela metade.
      const gravada = await salvarOrdemCompra(
        { ...ocEditing, status: 'emitida', atualizado_em: nowIso() },
        idDaTentativa(),
      );
      tentativaRef.current = null;

      // O número e a versão vêm do banco — é lá que eles nascem.
      const emitida: OrdemCompra = {
        ...ocEditing,
        id: gravada.id,
        status: gravada.status,
        numero: gravada.numero,
        ano: gravada.ano,
        sequencial: gravada.sequencial,
        versao: gravada.versao,
        pdf_gerado_em: '',
      };

      const blob = await generateOcPdfBlob(emitida, data);
      const fornNome = data.fornecedores.find((f) => f.id === emitida.fornecedor_id)?.razao_social ?? '';
      const filename = buildPdfFilename(emitida, fornNome);

      // Tenta resolver o handle persistido para a pasta desta obra.
      // Se não houver, ou se o navegador revogou a permissão, cai em download.
      let obraHandle: FileSystemDirectoryHandle | undefined;
      const stored = await getObraDirHandle(emitida.obra_id);
      if (stored) {
        const ok = await verifyHandlePermission(stored, true);
        if (ok) {
          obraHandle = stored;
        } else {
          showToast(
            'Permissão da pasta da obra foi revogada. PDF será baixado pelo navegador. Reconecte em Obras.',
            'warning',
          );
        }
      }

      const result = await savePdfToFile(blob, filename, obraHandle);

      // Carimbo DEPOIS de o arquivo existir. Antes ele era gravado junto com a
      // OC, e o banco podia afirmar "PDF gerado" de um arquivo que nunca saiu.
      try {
        await marcarPdfGerado(gravada.id);
      } catch {
        /* o PDF saiu; só o carimbo falhou. Regenerar pelo Histórico resolve. */
      }

      await recarregarDados();
      stopEditing();
      if (result === 'saved') {
        showToast(`OC ${emitida.numero} emitida. PDF salvo na pasta da obra.`, 'success');
      } else {
        showToast(
          obraHandle
            ? `OC ${emitida.numero} emitida. Falha ao salvar na pasta — PDF baixado pelo navegador.`
            : `OC ${emitida.numero} emitida. PDF baixado (configure pasta da obra para salvar automaticamente).`,
          obraHandle ? 'warning' : 'info',
        );
      }
      setTab('historico');
    } catch (err) {
      avisarErro('emitir', err);
    } finally {
      setSavingPdf(false);
    }
  }, [ocEditing, data, stopEditing, showToast, setTab, idDaTentativa, avisarErro]);

  /**
   * Abre o PDF da OC em uma nova aba SEM emitir — para conferência antes
   * de gerar o documento definitivo. Não altera status nem numeração.
   */
  const handlePreviewPdf = useCallback(async () => {
    if (!ocEditing || !data) return;
    if (ocEditing.itens.length === 0) { showToast('Adicione ao menos um item para visualizar.', 'warning'); return; }
    setPreviewing(true);
    try {
      const blob = await generateOcPdfBlob(ocEditing, data);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      // Revoga depois de 1 min — tempo de sobra para a aba carregar o blob.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      showToast(`Erro ao gerar prévia: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    } finally {
      setPreviewing(false);
    }
  }, [ocEditing, data, showToast]);

  const handleCancelar = useCallback(async () => {
    if (ocEditing && ocEditing.itens.length > 0) {
      const ok = await confirmAsync({
        title: 'Descartar OC',
        message: 'Descartar esta ordem de compra? Os itens preenchidos serão perdidos.',
        confirmLabel: 'Descartar',
        tone: 'danger',
      });
      if (!ok) return;
    }
    stopEditing();
    setTab('dashboard');
  }, [ocEditing, stopEditing, setTab]);

  // ── AI Import ───────────────────────────────────────────────────────────────

  const handleImportFile = useCallback(async (file: File) => {
    if (!data) return;
    // A extração roda no servidor (Edge Function) — nenhuma chave no navegador.
    setImporting(true);
    try {
      const images = await fileToImagesBase64(file);
      if (!images.length) { showToast('Não foi possível extrair imagens do arquivo.', 'warning'); return; }
      const items = await extractItemsFromImages(images);
      if (!items.length) { showToast('A IA não encontrou itens no arquivo.', 'warning'); return; }
      appendItems(items);
      showToast(`${items.length} item(ns) importado(s) via IA.`, 'success');
    } catch (err) {
      showToast(`Erro na importação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
    } finally {
      setImporting(false);
    }
  }, [data, appendItems, showToast]);

  // ── Render guard ────────────────────────────────────────────────────────────

  if (!data || !ocEditing) {
    return (
      <div className="section">
        <EmptyState title="Inicializando…" description="Preparando nova ordem de compra." />
      </div>
    );
  }

  const fornecedoresAtivos = data.fornecedores.filter((f) => f.ativo);
  const obrasAtivas = data.obras.filter((o) => o.ativa);

  // Permissões: o banco (RLS) recusa de qualquer forma; aqui só evitamos que
  // a pessoa preencha o formulário inteiro para tomar o erro no fim.
  const editaOk = podeEditar(perfil?.papel);
  const emiteOk = podeEmitirOc(perfil?.papel);

  return (
    <div className="section">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="section-header">
        <div>
          <h2>
            {ocEditing.status === 'rascunho' && ocEditing.criado_em !== ocEditing.atualizado_em
              ? 'Editar OC'
              : 'Nova Ordem de Compra'}
          </h2>
          <p className="section-sub">
            OC Nº {ocEditing.numero || '— (numera ao emitir)'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" onClick={() => void handleCancelar()}>Cancelar</Button>
          <Button variant="ghost" size="sm" onClick={() => void handlePreviewPdf()} loading={previewing} title="Abre o PDF em nova aba sem emitir a OC">
            <Icon name="eye" size={13} /> Visualizar
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handleSaveDraft()}
            loading={savingDraft}
            disabled={!editaOk}
            title={editaOk ? undefined : 'Seu acesso não permite salvar OCs'}
          >
            <Icon name="save" size={13} /> Salvar Rascunho
          </Button>
          {/* Atalho do topo em secundário de propósito: o laranja desta tela
              é o "Emitir OC" do rodapé, depois dos totais. */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleEmitir()}
            loading={savingPdf}
            disabled={!emiteOk}
            title={emiteOk ? undefined : 'Seu acesso não permite emitir OCs'}
          >
            <Icon name="file-text" size={13} /> Emitir OC + PDF
          </Button>
        </div>
      </div>

      {/* ── Identificação ────────────────────────────────────────────────── */}
      <FieldGroup title="Identificação da OC">
        <Field
          as="select"
          label="Fornecedor"
          required
          value={ocEditing.fornecedor_id}
          onChange={(e) => updateField('fornecedor_id', e.target.value)}
        >
          <option value="">Selecione…</option>
          {fornecedoresAtivos.map((f) => (
            <option key={f.id} value={f.id}>{f.razao_social}</option>
          ))}
        </Field>

        <Field
          as="select"
          label="Obra"
          required
          value={ocEditing.obra_id}
          onChange={(e) => updateField('obra_id', e.target.value)}
        >
          <option value="">Selecione…</option>
          {obrasAtivas.map((o) => (
            <option key={o.id} value={o.id}>{o.nome}</option>
          ))}
        </Field>

        <Field
          label="Data"
          type="date"
          required
          value={ocEditing.data}
          onChange={(e) => updateField('data', e.target.value)}
        />

        <Field
          as="select"
          label="Condição de Pagamento"
          value={ocEditing.condicao_pagamento}
          onChange={(e) => updateField('condicao_pagamento', e.target.value)}
        >
          <option value="">Selecione…</option>
          {data.config.condicoes_pagamento.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Field>

        <Field
          as="select"
          label="Emitente"
          value={ocEditing.emitente_id}
          onChange={(e) => updateField('emitente_id', e.target.value)}
        >
          {data.config.emitentes.map((e) => (
            <option key={e.id} value={e.id}>{e.razao_social}</option>
          ))}
        </Field>

        <Field
          as="textarea"
          label="Observações"
          span2
          rows={2}
          value={ocEditing.observacoes}
          onChange={(e) => updateField('observacoes', e.target.value)}
        />
      </FieldGroup>

      {/* ── Itens ────────────────────────────────────────────────────────── */}
      <FieldGroup title="Itens">
        <div style={{ gridColumn: '1 / -1' }}>
          <ItemsTable
            items={ocEditing.itens}
            ecrs={data.ecrs}
            onUpdate={updateItem}
            onRemove={removeItem}
            onAdd={addItem}
          />
          <div className={styles.itemsActions}>
            <Button variant="outline" size="sm" onClick={addItem}>+ Adicionar Item</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={importing}
              title="Importar itens de um pedido PDF via IA"
            >
              <Icon name="sparkles" size={13} /> Importar Pedido (IA)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = ''; // reset so same file can be re-selected
              }}
            />
          </div>
        </div>
      </FieldGroup>

      {/* ── Totais ───────────────────────────────────────────────────────── */}
      <FieldGroup title="Totais">
        <div style={{ gridColumn: '1 / -1' }}>
          <TotalsPanel
            oc={ocEditing}
            onChangeField={(field, value) => updateField(field, value)}
          />
        </div>
      </FieldGroup>

      {/* ── Footer actions ───────────────────────────────────────────────── */}
      <div className={styles.footerActions}>
        <Button variant="outline" onClick={() => void handleCancelar()}>Cancelar</Button>
        <Button variant="ghost" onClick={() => void handlePreviewPdf()} loading={previewing} title="Abre o PDF em nova aba sem emitir a OC">
          <Icon name="eye" size={13} /> Visualizar PDF
        </Button>
        <Button
          variant="secondary"
          onClick={() => void handleSaveDraft()}
          loading={savingDraft}
          disabled={!editaOk}
          title={editaOk ? undefined : 'Seu acesso não permite salvar OCs'}
        >
          <Icon name="save" size={13} /> Salvar Rascunho
        </Button>
        <Button
          variant="primary"
          onClick={() => void handleEmitir()}
          loading={savingPdf}
          disabled={!emiteOk}
          title={emiteOk ? undefined : 'Seu acesso não permite emitir OCs'}
        >
          <Icon name="file-text" size={13} /> Emitir OC + Gerar PDF
        </Button>
      </div>
    </div>
  );
}
