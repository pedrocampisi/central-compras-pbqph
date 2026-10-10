/**
 * Aba Nova OC — criação e edição de Ordem de Compra.
 * Portado de renderNovaOC / renderItems / renderTotals / saveOcAndGeneratePdf
 * (CentralCompras-PBQPH.html linhas 1280-1722).
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useOcEditingStore } from '../../stores/useOcEditingStore';
import { useUiStore } from '../../stores/useUiStore';
import { Field, FieldShell } from '../../components/Field/Field';
import { CampoPesquisavel } from '../../components/CampoPesquisavel/CampoPesquisavel';
import { FieldGroup } from '../../components/FieldGroup/FieldGroup';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Icon } from '../../components/Icon/Icon';
import { computeItemTotal, computeOcTotals } from '../../domain/compute';
import { formatBrl, todayIso, nowIso } from '../../domain/format';
import { uid } from '../../domain/id';
import { UN_PADRAO } from '../../domain/constants';
import { generateOcPdfBlob } from '../../services/pdf/generateOcPdf';
import { buildPdfFilename } from '../../services/pdf/pdfFilename';
import { ErroDaImportacao, lerLista, lerPedido, statusDoErro } from '../../services/ai/lerPedido';
import { avisoDaLeitura, avisoDaTroca } from '../../domain/importacao';

/** A chave das mensagens de leitura: uma por vez na tela (D570). */
const CHAVE_DA_LEITURA = 'leitura-da-ia';
import {
  LEITOR_PADRAO,
  itensMexidos,
  leituraServe,
  outroLeitorPodeAjudar,
  quemLeu,
  totalLido,
  trocarItensDaLeitura,
  type Leitor,
} from '../../domain/leitor';
import { CampoDeImportacao } from './CampoDeImportacao';
import { AjudaDaEcr } from '../../components/Ajuda/AjudaDaEcr';
import { entregarPdfDaOc } from '../../services/supabase/pastaDaObra';
import { avisoDoPdf } from '../../domain/pastaDaObra';
import { salvarOrdemCompra, marcarPdfGerado, ConflitoDeVersao, TravaDoBanco } from '../../services/supabase/dados';
import type { QualificacaoGravada } from '../../services/supabase/qualificacao';
import { useQualificacaoStore, useQualificacoesDoDia } from '../../stores/useQualificacaoStore';
import {
  desempenhoDaFilial, ecrsDoQualificarAgora, nomeDasEcrs, seloDaFilial, textoDoDesempenho,
} from '../../domain/qualificacao';
import { qualificacaoParaEmitir } from './qualificacaoParaEmitir';
import { QualificarDialogo } from '../fornecedores/QualificarDialogo';
import { SeloDaQualificacao } from '../fornecedores/SeloDaQualificacao';
import { recarregarDados } from '../../services/supabase/sync';
import { podeEditar, podeEmitirOc } from '../../services/supabase/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import { confirmAsync } from '../../stores/useConfirmStore';
import type { OrdemCompra, Item } from '../../domain/types';
import { semLinhasEmBranco, travaDaQuantidade } from '../../domain/itensDaEmissao';
import styles from './NovaOcPage.module.css';
import tutorialStyles from './TutorialDaNovaOc.module.css';
import { TutorialDaNovaOc } from './TutorialDaNovaOc';
import {
  DICA_DA_ENTREGA, DICA_DA_IMPORTACAO, OFERTA_DO_TUTORIAL, VAZIO_DOS_ITENS,
} from '../../domain/tutorialDaNovaOc';
import { deveOferecerTutorial, marcarTutorialOferecido } from '../../services/storage/tutorial';
import {
  agruparPorEmpresa, apelidoDoFornecedor, chaveDaEmpresa, enderecoResumido, escolherEmpresa, fornecedoresParaOc,
  motivoForaDaOc, opcoesDeEmpresa, opcoesDeObra, travaDaFilial,
} from '../../domain/fornecedores';
import {
  MENSAGEM_OBRA_SEM_DESTINATARIO, destinatarioDaObra, rotuloFaturarPara,
} from '../../domain/destinatario';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * OC nova em edição. O número fica VAZIO de propósito: quem numera é o banco,
 * e só na EMISSÃO — rascunho aberto e descartado não pode queimar um número do
 * PBQP-H. Numerar no navegador produzia número repetido quando duas pessoas
 * emitiam ao mesmo tempo.
 */
function buildNewOc(
  ano: number,
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
    // Sem emitente desde 15/09/2026 (CTO-D390): quem fatura é o destinatário
    // da nota da obra, lido na hora e fotografado na emissão.
    emitente_id: '',
    fornecedor_id: defaultFornecedorId,
    obra_id: defaultObraId,
    condicao_pagamento: defaultCondicao,
    entrega_prevista: '',
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
  semVazio?: boolean;
  /** A dúvida da IA por item (D557) — da tela, nunca do item. */
  confira?: Record<string, string>;
}

function ItemsTable({ items, ecrs, onUpdate, onRemove, onAdd, semVazio, confira = {} }: ItemsTableProps) {
  if (items.length === 0) {
    // Com o campo de importação aberto, é ele que ocupa o lugar do vazio.
    if (semVazio) return null;
    return (
      <EmptyState
        title="Nenhum item adicionado"
        description={VAZIO_DOS_ITENS}
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
            const duvida = confira[it.id];
            return (
              <tr key={it.id} className={duvida ? styles.linhaConfira : undefined}>
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
                  {duvida && (
                    <span className={styles.confira} title={duvida} data-confira="">
                      <Icon name="alerta" size={12} /> Confira<span className={styles.confiraTexto}>: {duvida}</span>
                    </span>
                  )}
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
                    placeholder="0"
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
                    placeholder="0"
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

/** O que foi lido por último — o mesmo pedido pode ser lido de novo pelo outro leitor. */
type FonteDaLeitura = { tipo: 'arquivos'; arquivos: File[] } | { tipo: 'texto'; texto: string };

/** A mensagem de uma leitura que falhou: a da importação vai como está. */
function mensagemDaFalha(err: unknown): string {
  return err instanceof ErroDaImportacao
    ? err.message
    : `Erro na importação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`;
}

// ── NovaOcPage ────────────────────────────────────────────────────────────────

export function NovaOcPage() {
  const data = useDataStore((s) => s.data);
  const perfil = useAuthStore((s) => s.perfil);
  const qualificacoes = useQualificacoesDoDia();

  const ocEditing = useOcEditingStore((s) => s.ocEditing);
  const startNova = useOcEditingStore((s) => s.startNova);
  const stopEditing = useOcEditingStore((s) => s.stopEditing);
  const updateField = useOcEditingStore((s) => s.updateField);
  const mudarData = useOcEditingStore((s) => s.mudarData);
  const addItem = useOcEditingStore((s) => s.addItem);
  const updateItem = useOcEditingStore((s) => s.updateItem);
  const removeItem = useOcEditingStore((s) => s.removeItem);
  const appendItems = useOcEditingStore((s) => s.appendItems);
  const replaceItems = useOcEditingStore((s) => s.replaceItems);

  const showToast = useUiStore((s) => s.showToast);
  const setTab = useUiStore((s) => s.setActiveTab);

  // O botão "Importar Pedido (IA)" abre um campo, não a pasta (CTO-D554).
  const [importAberto, setImportAberto] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importErro, setImportErro] = useState('');
  // A lista em texto (CTO-D557). O texto é da PÁGINA: a leitura que falha não o apaga.
  const [importTexto, setImportTexto] = useState('');
  const [importOQue, setImportOQue] = useState<'arquivo' | 'texto'>('arquivo');
  const [importIgnoradas, setImportIgnoradas] = useState<string[]>([]);
  // Os dois leitores (CTO-D567). A tela começa no rápido; a escolha vale para
  // o arquivo e para o texto. `fonte` guarda o que foi lido por último, para
  // o "Ler de novo com o certeiro" e o "Ler com o certeiro" do erro.
  const [leitor, setLeitor] = useState<Leitor>(LEITOR_PADRAO);
  const [lendoCom, setLendoCom] = useState<Leitor>(LEITOR_PADRAO);
  const [fonte, setFonte] = useState<FonteDaLeitura | null>(null);
  // Os itens como ENTRARAM: é contra esta fotografia que se sabe se a pessoa
  // já mexeu neles antes de trocar pelos do certeiro.
  const [resultado, setResultado] = useState<{ leitor: Leitor; itens: Item[] } | null>(null);
  const [oferecerCerteiro, setOferecerCerteiro] = useState(false);
  const [certeiroIndisponivel, setCerteiroIndisponivel] = useState(false);
  // Depois da leitura, o campo encolhe para o resultado: os itens lidos e o
  // total cabem na mesma janela (CTO-D575). "Ler outro pedido" reabre as
  // portas; cada leitura que dá certo conta uma, e o campo rola até ela.
  const [portasAbertas, setPortasAbertas] = useState(false);
  const [leiturasFeitas, setLeiturasFeitas] = useState(0);
  // O "confira" da IA, por id do item. Fica AQUI, fora do item: o item vai ao
  // banco e ao PDF, a dúvida não. Some ao editar a linha e ao salvar.
  const [confira, setConfira] = useState<Record<string, string>>({});
  const [savingPdf, setSavingPdf] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  /** O "Qualificar agora" aberto pela trava da emissão (CTO-D605): a frase e as ECRs já marcadas. */
  const [qualificando, setQualificando] = useState<{ porque: string; ecrs: number[] } | null>(null);
  const initializedRef = useRef(false);
  // O tutorial (CTO-D763): o passo aberto, ou null. A oferta aparece uma vez por pessoa.
  const [passoDoTutorial, setPassoDoTutorial] = useState<number | null>(null);
  const [oferecerTutorial, setOferecerTutorial] = useState(() => deveOferecerTutorial(perfil?.user_id));
  const sairDoTutorial = useCallback(() => setPassoDoTutorial(null), []);
  const abrirTutorial = useCallback(() => {
    marcarTutorialOferecido(perfil?.user_id);
    setOferecerTutorial(false);
    setPassoDoTutorial(0);
  }, [perfil?.user_id]);
  const recusarTutorial = useCallback(() => {
    marcarTutorialOferecido(perfil?.user_id);
    setOferecerTutorial(false);
  }, [perfil?.user_id]);

  // ── Inicialização ───────────────────────────────────────────────────────────
  // Runs once on mount. If ocEditing already exists (navigated from Histórico),
  // skip creation — the user is editing an existing OC.
  // OC nova nasce SEM número: o banco numera na emissão.

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!data || ocEditing) return;

    const currentYear = new Date().getFullYear();
    // Fornecedor e obra nascem em "Selecione…", de propósito (CTO, 15/09/2026):
    // a tela velha marcava o primeiro da lista, e quem não reparasse emitia para
    // o fornecedor errado — e, desde a D390, faturava para o destinatário da obra
    // errada. Escolher é ato da pessoa; a validação já recusa emitir sem os dois.
    const defaultCondicao = data.config.condicoes_pagamento[0] ?? '';

    startNova(buildNewOc(currentYear, '', '', defaultCondicao));
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
      if (err instanceof ConflitoDeVersao || err instanceof TravaDoBanco) {
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
    {
      // A filial bloqueada SALVA: quem abriu uma OC antiga não perde o que digitou (D545).
      const trava = travaDaFilial(data.fornecedores.find((f) => f.id === ocEditing.fornecedor_id), 'salvar');
      if (trava) { showToast(trava, 'warning'); return; }
    }
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
      setConfira({}); // salvo: o "confira" era da tela, e some
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
    {
      // A filial bloqueada NÃO emite — o banco não recusa, a trava é aqui (D545).
      const trava = travaDaFilial(data.fornecedores.find((f) => f.id === ocEditing.fornecedor_id), 'emitir');
      if (trava) { showToast(trava, 'warning'); return; }
    }
    {
      // Material controlado só com empresa qualificada para as ECRs dele
      // (CTO-D605). Recusou: abre o "Qualificar agora" na mesma tela. Sem o
      // store carregado não há critério para mostrar — fica só o aviso.
      const q = qualificacaoParaEmitir(ocEditing, data.fornecedores);
      if (q.trava) {
        const material = useQualificacaoStore.getState().dados?.categorias.find((c) => c.categoria === 'material');
        if (q.selo && material) {
          setQualificando({ porque: q.porqueDoQualificarAgora, ecrs: ecrsDoQualificarAgora(q.ecrs, q.selo.ecrs) });
        } else showToast(q.trava, 'warning');
        return;
      }
    }
    if (!ocEditing.obra_id) { showToast('Selecione uma obra.', 'warning'); return; }
    // A linha em branco some; a linha com quantidade 0 não emite, e a mensagem diz qual (D680).
    const itens = semLinhasEmBranco(ocEditing.itens);
    if (itens.length === 0) { showToast('Adicione ao menos um item.', 'warning'); return; }
    const quantidade = travaDaQuantidade(ocEditing.itens, 'nova-oc');
    if (quantidade) { showToast(quantidade, 'warning'); return; }

    // Obra sem destinatário da nota não emite: não há para quem faturar, e a
    // OC não inventa — o cadastro é do Central (CTO-D390).
    const destinatario = destinatarioDaObra(data.obras.find((o) => o.id === ocEditing.obra_id));
    if (!destinatario) { showToast(MENSAGEM_OBRA_SEM_DESTINATARIO, 'warning'); return; }

    setSavingPdf(true);
    try {
      // Uma operação só no banco: cabeçalho, itens, a reserva do número e a
      // fotografia do destinatário (quem ERA no dia da emissão). Se qualquer
      // parte falhar, nada fica gravado pela metade.
      const gravada = await salvarOrdemCompra(
        { ...ocEditing, itens, status: 'emitida', destinatario, atualizado_em: nowIso() },
        idDaTentativa(),
      );
      tentativaRef.current = null;
      setConfira({}); // salvo: o "confira" era da tela, e some

      // O número e a versão vêm do banco — é lá que eles nascem.
      const emitida: OrdemCompra = {
        ...ocEditing,
        itens,
        destinatario,
        id: gravada.id,
        status: gravada.status,
        numero: gravada.numero,
        ano: gravada.ano,
        sequencial: gravada.sequencial,
        versao: gravada.versao,
        pdf_gerado_em: '',
      };

      const blob = await generateOcPdfBlob(emitida, data);
      const fornNome = apelidoDoFornecedor(data.fornecedores.find((f) => f.id === emitida.fornecedor_id));
      const filename = buildPdfFilename(emitida, fornNome);

      // A OC já está emitida no banco. O PDF vai para a pasta da obra pelo
      // servidor; só se ele falhar entra o caminho de hoje (a pasta ligada
      // neste navegador, ou o download). Com 200 não salva de novo (D685).
      const { resposta, caminho } = await entregarPdfDaOc(emitida, blob, filename);

      // Carimbo DEPOIS de o arquivo existir. Antes ele era gravado junto com a
      // OC, e o banco podia afirmar "PDF gerado" de um arquivo que nunca saiu.
      try {
        await marcarPdfGerado(gravada.id);
      } catch {
        /* o PDF saiu; só o carimbo falhou. Regenerar pelo Histórico resolve. */
      }

      await recarregarDados();
      stopEditing();
      const aviso = avisoDoPdf(emitida.numero, resposta, caminho, 'emissao');
      showToast(aviso.texto, aviso.tom);
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

  const fecharImportacao = useCallback(() => {
    setImportAberto(false);
    setImportErro('');
    setImportIgnoradas([]);
    setResultado(null);
    setFonte(null);
    setOferecerCerteiro(false);
    setCerteiroIndisponivel(false);
    setPortasAbertas(false);
  }, []);

  // UMA leitura, de arquivo ou de texto, por um dos dois leitores (D567).
  //   somar ... os itens entram SOMADOS ao que a OC já tem (D554/D557)
  //   trocar .. os itens da leitura anterior saem e os novos entram no lugar;
  //             `comoEstavam` é como eles estavam quando a releitura saiu
  // O fim é sempre o mesmo: o aviso diz quantos entraram e quantas linhas
  // ficaram de fora; o campo fica aberto com o resultado. Sem item, é falha.
  const ler = useCallback(async (
    f: FonteDaLeitura,
    com: Leitor,
    trocar: { ids: string[]; comoEstavam: Item[] } | null,
  ) => {
    if (!data || importing) return;
    setImporting(true);
    setLendoCom(com);
    setImportOQue(f.tipo === 'texto' ? 'texto' : 'arquivo');
    setImportErro('');
    setImportIgnoradas([]);
    setOferecerCerteiro(false);
    setCerteiroIndisponivel(false);
    setFonte(f);
    // Leitura nova apaga o resultado da anterior; a troca o mantém até dar certo.
    if (!trocar) setResultado(null);
    try {
      const r = f.tipo === 'texto'
        ? await lerLista(f.texto, undefined, com)
        : await lerPedido(f.arquivos, undefined, com);
      // A trava: escolheu o certeiro, só entra leitura que o servidor diz ser dele.
      if (!leituraServe(com, r.leitor)) {
        setCerteiroIndisponivel(true);
        return;
      }
      setImportIgnoradas(r.ignoradas);
      if (!r.itens.length) {
        setImportErro(f.tipo === 'texto'
          ? 'A IA não encontrou itens no texto.'
          : 'A IA não encontrou itens no arquivo. Tente uma imagem mais nítida.');
        setOferecerCerteiro(com === 'rapido');
        return;
      }
      if (trocar) {
        // A pessoa pode ter corrigido um item ENQUANTO o certeiro lia (perícia
        // de 27/09, achado 1): compara de novo com o que saiu e, se mudou,
        // pergunta antes de trocar. Os campos não travam durante a espera.
        const naEspera = itensMexidos(trocar.comoEstavam, useOcEditingStore.getState().ocEditing?.itens ?? []);
        if (naEspera > 0) {
          const ok = await confirmAsync({
            title: 'Trocar os itens desta leitura?',
            message:
              `Enquanto o certeiro lia, você mexeu em ${naEspera === 1 ? '1 item' : `${naEspera} itens`} desta leitura. ` +
              'Trocar pelos do certeiro perde essas mudanças. Os itens que você pôs à mão ficam.',
            confirmLabel: 'Trocar pelos do certeiro',
            cancelLabel: 'Manter os meus',
            tone: 'danger',
          });
          if (!ok) {
            showToast('Os seus itens ficaram como estão. A leitura do certeiro não entrou.', 'info', CHAVE_DA_LEITURA);
            return;
          }
        }
        const agora = useOcEditingStore.getState().ocEditing?.itens ?? [];
        replaceItems(trocarItensDaLeitura(agora, trocar.ids, r.itens));
        setConfira((antes) => {
          const resto = { ...antes };
          for (const id of trocar.ids) delete resto[id];
          return { ...resto, ...r.confira };
        });
      } else {
        appendItems(r.itens);
        setConfira((antes) => ({ ...antes, ...r.confira }));
      }
      setResultado({ leitor: quemLeu(r.leitor), itens: r.itens });
      setPortasAbertas(false);
      setLeiturasFeitas((n) => n + 1);
      if (f.tipo === 'texto') setImportTexto('');
      // Uma mensagem de leitura por vez: a da troca tira a da leitura anterior (D570).
      showToast(
        trocar
          ? avisoDaTroca(r.itens.length, r.ignoradas.length)
          : avisoDaLeitura(r.itens.length, r.ignoradas.length),
        'success',
        CHAVE_DA_LEITURA,
      );
    } catch (err) {
      setImportErro(mensagemDaFalha(err));
      setOferecerCerteiro(com === 'rapido' && outroLeitorPodeAjudar(statusDoErro(err)));
    } finally {
      setImporting(false);
    }
  }, [data, importing, appendItems, replaceItems, showToast]);

  // Os arquivos que entraram de uma vez viram UMA leitura (lerPedido): tipo
  // errado e página demais param antes do servidor, e o aviso fica no campo.
  const handleImportFiles = useCallback((arquivos: File[]) => {
    void ler({ tipo: 'arquivos', arquivos }, leitor, null);
  }, [ler, leitor]);

  // A lista colada em texto (D557): deu certo, a caixa esvazia; falhou, o
  // texto fica lá para tentar de novo.
  const handleOrganizarTexto = useCallback(() => {
    if (importTexto.trim() === '') return;
    void ler({ tipo: 'texto', texto: importTexto }, leitor, null);
  }, [ler, leitor, importTexto]);

  // "Ler de novo com o certeiro": troca os itens que o rápido leu. Se a pessoa
  // já mexeu em algum, pergunta antes — nada some calado.
  const lerDeNovoComCerteiro = useCallback(async () => {
    if (!resultado || !fonte || importing) return;
    const agora = useOcEditingStore.getState().ocEditing?.itens ?? [];
    const mexidos = itensMexidos(resultado.itens, agora);
    if (mexidos > 0) {
      const n = resultado.itens.length;
      const ok = await confirmAsync({
        title: 'Trocar os itens desta leitura?',
        message:
          `Você já mexeu em ${mexidos === 1 ? '1 item' : `${mexidos} itens`} desta leitura. ` +
          `O certeiro troca ${n === 1 ? 'o item' : `os ${n} itens`} que o rápido leu, e essas mudanças se perdem. ` +
          'Os itens que você pôs à mão ficam.',
        confirmLabel: 'Trocar pelos do certeiro',
        cancelLabel: 'Manter os meus',
        tone: 'danger',
      });
      if (!ok) return;
    }
    setLeitor('certeiro');
    // Como os itens estão AGORA, na saída: é com isto que a resposta se compara.
    const ids = resultado.itens.map((i) => i.id);
    const comoEstavam = (useOcEditingStore.getState().ocEditing?.itens ?? []).filter((i) => ids.includes(i.id));
    await ler(fonte, 'certeiro', { ids, comoEstavam });
  }, [resultado, fonte, importing, ler]);

  // O erro do rápido oferece o certeiro: o mesmo pedido, pelo outro leitor.
  const lerComCerteiro = useCallback(() => {
    if (!fonte) return;
    setLeitor('certeiro');
    void ler(fonte, 'certeiro', null);
  }, [fonte, ler]);

  // Editar a linha é conferir: o aviso some. Remover também.
  const tirarConfira = useCallback((id: string) => {
    setConfira((antes) => {
      if (!(id in antes)) return antes;
      const resto = { ...antes };
      delete resto[id];
      return resto;
    });
  }, []);
  const editarItem = useCallback((id: string, partial: Partial<Item>) => {
    updateItem(id, partial);
    tirarConfira(id);
  }, [updateItem, tirarConfira]);
  const removerItem = useCallback((id: string) => {
    removeItem(id);
    tirarConfira(id);
  }, [removeItem, tirarConfira]);

  // ── Render guard ────────────────────────────────────────────────────────────

  if (!data || !ocEditing) {
    return (
      <div className="section">
        <EmptyState title="Inicializando…" description="Preparando nova ordem de compra." />
      </div>
    );
  }

  // Por EMPRESA (D542), e a filial não se escolhe: a OC grava a principal
  // (D549) — regras em domain/fornecedores.ts. Entra quem fornece material,
  // ativo e não bloqueado; a filial já gravada na OC aberta entra também, para
  // o rascunho não trocar de fornecedor sozinho.
  const fornecedoresAtivos = fornecedoresParaOc(data.fornecedores, ocEditing.fornecedor_id);
  const empresas = agruparPorEmpresa(fornecedoresAtivos);
  const fornecedorEscolhido = fornecedoresAtivos.find((f) => f.id === ocEditing.fornecedor_id);
  const chaveEscolhida = fornecedorEscolhido ? chaveDaEmpresa(fornecedorEscolhido) : '';
  // A pista diz o que vai no PDF: razão social, endereço e CNPJ inteiro da
  // filial gravada. Fora da lista hoje (o rascunho antigo), diz o porquê.
  const pistaDoFornecedor = fornecedorEscolhido
    ? [
        `Na OC: ${fornecedorEscolhido.razao_social}`,
        enderecoResumido(fornecedorEscolhido),
        motivoForaDaOc(fornecedorEscolhido) ? `Atenção: ${motivoForaDaOc(fornecedorEscolhido)}` : '',
      ].filter(Boolean).join(' · ')
    : undefined;

  // O selo de material da empresa escolhida (D604 §3.4): o que a emissão vai conferir.
  const seloDoEscolhido = fornecedorEscolhido && qualificacoes ? seloDaFilial(fornecedorEscolhido, qualificacoes.linhas) : null;
  const ecrsNoSelo = !!seloDoEscolhido && seloDoEscolhido.ecrs.length > 0;

  function escolherEmpresaNaOc(chave: string) {
    if (!ocEditing) return;
    const id = escolherEmpresa(empresas.find((g) => g.chave === chave), ocEditing.fornecedor_id);
    if (id !== ocEditing.fornecedor_id) updateField('fornecedor_id', id);
  }
  const obrasAtivas = data.obras.filter((o) => o.ativa);
  // O destinatário da nota é da obra: a tela mostra em leitura, não escolhe.
  const obraEscolhida = data.obras.find((o) => o.id === ocEditing.obra_id);
  const destinatarioDaObraEscolhida = destinatarioDaObra(obraEscolhida);

  // Permissões: o banco (RLS) recusa de qualquer forma; aqui só evitamos que
  // a pessoa preencha o formulário inteiro para tomar o erro no fim.
  const editaOk = podeEditar(perfil?.papel);
  const emiteOk = podeEmitirOc(perfil?.papel);

  // O "Qualificar agora" gravou: com a nota no mínimo, a emissão segue sozinha
  // (D605 §1) — e passa de novo pelas duas travas, agora com o store novo.
  const filialDaOc = data.fornecedores.find((f) => f.id === ocEditing.fornecedor_id);
  const categoriaMaterial = qualificacoes?.categorias.find((c) => c.categoria === 'material');
  async function depoisDeQualificar(r: QualificacaoGravada) {
    setQualificando(null);
    try {
      await recarregarDados();
    } catch {
      showToast('A qualificação foi gravada, mas a tela não recarregou. Recarregue a página antes de emitir.', 'warning');
      return;
    }
    if (!r.qualificada) {
      showToast(
        `Qualificação gravada com nota ${r.nota} (o mínimo é ${r.minimo}): a empresa ficou desqualificada, e a OC não emite para ela.`,
        'warning',
      );
      return;
    }
    await handleEmitir();
  }

  return (
    <div className="section">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="section-header">
        <div className={styles.tituloDoTopo}>
          <h2>
            {ocEditing.status === 'rascunho' && ocEditing.criado_em !== ocEditing.atualizado_em
              ? 'Editar OC'
              : 'Nova Ordem de Compra'}
          </h2>
          <p className="section-sub">
            OC Nº {ocEditing.numero || '— (numera ao emitir)'}
          </p>
        </div>
        <div className={styles.acoesDoTopo}>
          <Button variant="ghost" size="sm" onClick={abrirTutorial} title="Mostra, campo por campo, como fazer uma OC">
            <Icon name="guia" size={13} /> Tutorial
          </Button>
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

      {oferecerTutorial && passoDoTutorial === null && (
        <div className={tutorialStyles.oferta} data-oferta-do-tutorial="">
          <span className={tutorialStyles.ofertaTexto}>
            <strong>{OFERTA_DO_TUTORIAL.titulo}</strong>
            {OFERTA_DO_TUTORIAL.texto}
          </span>
          <span className={tutorialStyles.ofertaAcoes}>
            <Button variant="ghost" size="sm" onClick={recusarTutorial}>Agora não</Button>
            <Button variant="navy" size="sm" onClick={abrirTutorial}>
              <Icon name="guia" size={13} /> Ver o tutorial
            </Button>
          </span>
        </div>
      )}

      {/* ── Identificação ────────────────────────────────────────────────── */}
      <FieldGroup title="Identificação da OC">
        {/* Fornecedor e Obra aceitam texto (CTO-D541): são as duas listas longas.
            O Fornecedor é a EMPRESA (D542); a filial não se escolhe — quem decide
            a loja é o vendedor, e a OC grava a principal (D549). */}
        <FieldShell label="Fornecedor" required htmlFor="oc-fornecedor" hint={pistaDoFornecedor} marca="fornecedor">
          <CampoPesquisavel
            id="oc-fornecedor"
            required
            rotuloVazio="Selecione…"
            opcoes={opcoesDeEmpresa(empresas)}
            valor={chaveEscolhida}
            onEscolher={escolherEmpresaNaOc}
          />
          {fornecedorEscolhido && (
            <span className={styles.seloDoFornecedor} data-selo-do-fornecedor="">
              <SeloDaQualificacao selo={seloDoEscolhido} rotulo="Material" />
              {ecrsNoSelo && (
                <>
                  <span className={styles.ecrsDoSelo}>{nomeDasEcrs(seloDoEscolhido.ecrs)}</span>
                  <AjudaDaEcr />
                </>
              )}
            </span>
          )}
        </FieldShell>

        <FieldShell
          label="Obra"
          required
          htmlFor="oc-obra"
          marca="obra"
          hint={
            obraEscolhida
              ? rotuloFaturarPara(destinatarioDaObraEscolhida) || MENSAGEM_OBRA_SEM_DESTINATARIO
              : undefined
          }
        >
          <CampoPesquisavel
            id="oc-obra"
            required
            rotuloVazio="Selecione…"
            opcoes={opcoesDeObra(obrasAtivas)}
            valor={ocEditing.obra_id}
            onEscolher={(v) => updateField('obra_id', v)}
          />
        </FieldShell>

        <Field
          label="Data"
          aria-label="Data"
          type="date"
          required
          value={ocEditing.data}
          onChange={(e) => mudarData(e.target.value)}
        />

        <Field
          label="Entrega prevista"
          aria-label="Entrega prevista"
          type="date"
          hint={DICA_DA_ENTREGA}
          marca="entrega"
          value={ocEditing.entrega_prevista ?? ''}
          onChange={(e) => updateField('entrega_prevista', e.target.value)}
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
          as="textarea"
          label="Observações"
          span2
          rows={2}
          value={ocEditing.observacoes}
          onChange={(e) => updateField('observacoes', e.target.value)}
        />
      </FieldGroup>

      {/* ── Itens ────────────────────────────────────────────────────────── */}
      {/* A sigla ECR tem o "?" na primeira vez que aparece (CTO-D728 §1): no selo
          do fornecedor, se ele mostra ECRs; senão, aqui, antes da coluna ECR. */}
      <FieldGroup title="Itens" ajuda={ecrsNoSelo ? undefined : <AjudaDaEcr />}>
        <div style={{ gridColumn: '1 / -1' }} data-tutorial="tabela">
          <ItemsTable
            items={ocEditing.itens}
            ecrs={data.ecrs}
            onUpdate={editarItem}
            onRemove={removerItem}
            onAdd={addItem}
            semVazio={importAberto}
            confira={confira}
          />
          {importAberto && (
            <div className={styles.campoImportacao}>
              <CampoDeImportacao
                lendo={importing}
                oQueLe={importOQue}
                erro={importErro}
                onArquivos={handleImportFiles}
                onFechar={fecharImportacao}
                texto={importTexto}
                onTexto={setImportTexto}
                onOrganizar={handleOrganizarTexto}
                ignoradas={importIgnoradas}
                leitor={leitor}
                onLeitor={setLeitor}
                lendoCom={lendoCom}
                resultado={resultado && {
                  leitor: resultado.leitor,
                  itens: resultado.itens.length,
                  total: totalLido(resultado.itens),
                }}
                onLerDeNovoComCerteiro={() => void lerDeNovoComCerteiro()}
                oferecerCerteiro={oferecerCerteiro}
                onLerComCerteiro={lerComCerteiro}
                certeiroIndisponivel={certeiroIndisponivel}
                recolhido={!!resultado && !portasAbertas}
                onLerOutro={() => setPortasAbertas(true)}
                leiturasFeitas={leiturasFeitas}
              />
            </div>
          )}
          <div className={styles.itemsActions} data-tutorial="itens">
            <Button variant="outline" size="sm" onClick={addItem}>+ Adicionar Item</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { fecharImportacao(); setImportAberto(true); }}
              disabled={importAberto}
              title={DICA_DA_IMPORTACAO}
            >
              <Icon name="sparkles" size={13} /> Importar Pedido (IA)
            </Button>
          </div>
        </div>
      </FieldGroup>

      {/* ── Totais ───────────────────────────────────────────────────────── */}
      <FieldGroup title="Totais">
        <div style={{ gridColumn: '1 / -1' }} data-tutorial="totais">
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
          data-tutorial="emitir"
          onClick={() => void handleEmitir()}
          loading={savingPdf}
          disabled={!emiteOk}
          title={emiteOk ? undefined : 'Seu acesso não permite emitir OCs'}
        >
          <Icon name="file-text" size={13} /> Emitir OC + Gerar PDF
        </Button>
      </div>

      {passoDoTutorial !== null && (
        <TutorialDaNovaOc oc={ocEditing} indice={passoDoTutorial} onIr={setPassoDoTutorial} onSair={sairDoTutorial} />
      )}

      {qualificando && filialDaOc && categoriaMaterial && (
        <QualificarDialogo
          filial={filialDaOc}
          categoria={categoriaMaterial}
          ecrs={data.ecrs}
          ecrsMarcadas={qualificando.ecrs}
          porque={qualificando.porque}
          desempenho={textoDoDesempenho(desempenhoDaFilial(filialDaOc, qualificacoes?.desempenho ?? []))}
          aoGravar={depoisDeQualificar}
          aoVoltar={() => setQualificando(null)}
        />
      )}
    </div>
  );
}
