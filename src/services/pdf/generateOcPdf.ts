/**
 * Geração do PDF de Ordem de Compra via jsPDF + jspdf-autotable.
 * Portado de CentralCompras-PBQPH.html linhas 1637-1830.
 * Paridade visual com o legado: mesma fonte, mesmas dimensões, mesmos textos.
 */

import jsPDF from 'jspdf';
// IMPORTANTE: usar /es (ESM) — o entry default ('jspdf-autotable') resolve
// para CommonJS, e a interop falha no bundle minificado de produção
// com erro "(0, Et.default) is not a function".
import autoTable from 'jspdf-autotable/es';
import type { Data, Emitente, Endereco, OrdemCompra } from '../../domain/types';
import { computeItemTotal, computeOcTotals } from '../../domain/compute';
import { formatBrl, formatDate } from '../../domain/format';
import { drawBox, addrLine } from './helpers';

// ── Types internos ────────────────────────────────────────────────────────────

/** Acesso ao lastAutoTable injetado pelo plugin jspdf-autotable. */
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeStr(v: unknown): string {
  return v != null ? String(v) : '';
}

function emitenteDoc(e: Partial<Emitente> | undefined): string {
  if (!e) return '';
  return e.tipo === 'PF' ? `CPF: ${e.cpf ?? ''}` : `CNPJ: ${e.cnpj ?? ''}`;
}

function emitenteIE(e: Partial<Emitente> | undefined): string {
  if (!e || e.tipo === 'PF') return '';
  return `IE: ${e.ie ?? ''}`;
}

const LOGO_PATH = `${import.meta.env.BASE_URL}brazao1.png`;
let logoDataUrlPromise: Promise<string | null> | null = null;

const DEFAULT_CONDICOES_CONTRATACAO = [
  '1) Constar o nome e endereço da obra no rodapé da Nota Fiscal.',
  '2) Caso o pagamento seja em carteira, incluir os dados bancários no corpo da NF.',
  '3) Informar que o emitente desta OC é consumidor final, quando aplicável.',
  '4) É proibida a negociação de títulos com terceiros sem autorização prévia.',
  '5) Constar o número desta Ordem de Compra e o nome da obra/CNO no documento fiscal.',
  '6) ESSA ORDEM DE COMPRA DEVE SER ENVIADA JUNTAMENTE À NF NA ENTREGA DO MATERIAL.',
].join('\n');

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao carregar logo.'));
    reader.readAsDataURL(blob);
  });
}

async function loadCampisiLogo(): Promise<string | null> {
  if (typeof fetch !== 'function' || typeof FileReader === 'undefined') return null;

  logoDataUrlPromise ??= fetch(LOGO_PATH)
    .then((response) => (response.ok ? response.blob() : null))
    .then((blob) => (blob ? blobToDataUrl(blob) : null))
    .catch(() => null);

  return logoDataUrlPromise;
}

function normalizeCondicoesContratacao(texto: string | undefined): string {
  const base = texto?.trim() ? texto : DEFAULT_CONDICOES_CONTRATACAO;
  return base
    .replace(
      /Informar que a CONRAD DUARTE é consumidora final \(alíquota ICMS cheia\)\./gi,
      'Informar que o emitente desta OC é consumidor final, quando aplicável.',
    )
    .replace(
      /É proibido a negociação de títulos com terceiros sem autorização prévia\./gi,
      'É proibida a negociação de títulos com terceiros sem autorização prévia.',
    )
    .replace(/obra\/CEI/gi, 'obra/CNO')
    .replace(
      /ESSA ORDEM DE COMPRA DEVE SER ENVIADA JUNTAMENTE A NF/gi,
      'ESSA ORDEM DE COMPRA DEVE SER ENVIADA JUNTAMENTE À NF',
    );
}

// ── Geração principal ─────────────────────────────────────────────────────────

/**
 * Gera o PDF de uma OC e retorna um Blob.
 * Recebe `oc` (a OC) e `data` (o estado completo com config, fornecedores, obras).
 */
export async function generateOcPdfBlob(oc: OrdemCompra, data: Data): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }) as JsPDFWithAutoTable;
  const logoDataUrl = await loadCampisiLogo();

  // Resolução de emitente, fornecedor e obra
  const emitentes = data.config.emitentes ?? [];
  const e: Partial<Emitente> | undefined =
    (oc.emitente_id ? emitentes.find((x) => x.id === oc.emitente_id) : undefined) ??
    emitentes[0] ??
    data.config.emitente;

  const cob: Partial<Endereco> = data.config.endereco_cobranca ?? {};
  const f = data.fornecedores.find((x) => x.id === oc.fornecedor_id);
  const ob = data.obras.find((x) => x.id === oc.obra_id);
  const totals = computeOcTotals(oc);

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 10;
  const footerLineY = ph - 15;
  const footerTextY = ph - 7;
  const contentBottomY = footerLineY - 4;
  let y = 12;

  function ensureSpace(requiredHeight: number): void {
    if (y + requiredHeight <= contentBottomY) return;
    doc.addPage();
    y = margin;
  }

  function drawFooter(): void {
    doc.setDrawColor(215);
    doc.setLineWidth(0.2);
    doc.line(margin, footerLineY, pw - margin, footerLineY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(70);
    doc.text(
      'ESSA ORDEM DE COMPRA DEVE SER ENVIADA JUNTAMENTE À NF NA ENTREGA DO MATERIAL',
      pw / 2,
      footerTextY,
      { align: 'center' },
    );
    doc.setTextColor(0, 0, 0);
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin, 6, 14, 14);
    } catch {
      /* logo é decorativa; se falhar, o PDF continua sendo gerado */
    }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ORDEM DE COMPRA', pw / 2, y + 1, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CAMPISI ENGENHARIA', margin + 18, y - 1);
  doc.setFontSize(7);
  doc.text('Cód. 01', margin + 18, y + 3);
  doc.setFontSize(9);
  doc.text(`Nº O.C.: ${oc.numero}`, pw - margin, y, { align: 'right' });
  doc.setDrawColor(11, 105, 183);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 8, pw - margin, y + 8);
  y += 13;

  // ── Dados para Faturamento ─────────────────────────────────────────────────
  doc.setDrawColor(180);
  doc.setLineWidth(0.2);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  drawBox(doc, margin, y, pw - 2 * margin, 32);
  doc.text('DADOS PARA FATURAMENTO', margin + 2, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`Razão Social: ${safeStr(e?.razao_social)}`, margin + 2, y + 8);
  doc.text(emitenteDoc(e), margin + 2, y + 12);
  doc.text(emitenteIE(e), margin + 70, y + 12);
  doc.text(`Endereço: ${addrLine(e?.endereco)}`, margin + 2, y + 16);
  doc.text(`Bairro: ${safeStr(e?.endereco?.bairro)}`, margin + 2, y + 20);
  doc.text(`Cidade: ${safeStr(e?.endereco?.cidade)}`, margin + 70, y + 20);
  doc.text(`UF: ${safeStr(e?.endereco?.uf)}`, margin + 120, y + 20);
  doc.text(`CEP: ${safeStr(e?.endereco?.cep)}`, margin + 140, y + 20);
  doc.text(`E-mail: ${safeStr(e?.email_envio_nf)}`, margin + 2, y + 24);
  doc.text(`Telefone: ${safeStr(e?.telefones?.[0])}`, margin + 2, y + 28);
  doc.text(`Celular: ${safeStr(e?.telefones?.[1])}`, margin + 70, y + 28);
  doc.text(`Data: ${formatDate(oc.data)}`, margin + 120, y + 28);
  y += 34;

  // ── Condição de Pagamento ──────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  drawBox(doc, margin, y, pw - 2 * margin, 7);
  doc.text(`CONDIÇÃO DE PAGAMENTO: ${oc.condicao_pagamento || '—'}`, margin + 2, y + 5);
  y += 9;

  // ── Fornecedor ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  drawBox(doc, margin, y, pw - 2 * margin, 26);
  doc.text('FORNECEDOR', margin + 2, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`Razão Social: ${safeStr(f?.razao_social)}`, margin + 2, y + 8);
  doc.text(`CNPJ: ${safeStr(f?.cnpj)}`, margin + 2, y + 12);
  doc.text(`IE: ${safeStr(f?.ie)}`, margin + 70, y + 12);
  doc.text(`Endereço: ${addrLine(f?.endereco)}`, margin + 2, y + 16);
  doc.text(`Bairro: ${safeStr(f?.endereco?.bairro)}`, margin + 2, y + 20);
  doc.text(`Cidade: ${safeStr(f?.endereco?.cidade)}`, margin + 70, y + 20);
  doc.text(`UF: ${safeStr(f?.endereco?.uf)}`, margin + 120, y + 20);
  doc.text(`CEP: ${safeStr(f?.endereco?.cep)}`, margin + 140, y + 20);
  doc.text(`Telefone: ${safeStr(f?.telefones?.[0])}`, margin + 2, y + 24);
  doc.text(`E-mail: ${safeStr(f?.email)}`, margin + 70, y + 24);
  y += 28;

  // ── Entrega + Cobrança (lado a lado) ──────────────────────────────────────
  const halfW = (pw - 2 * margin - 2) / 2;
  doc.setFont('helvetica', 'bold');
  drawBox(doc, margin, y, halfW, 26);
  doc.text('ENTREGA DO MATERIAL', margin + 2, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`Obra: ${safeStr(ob?.nome)}`, margin + 2, y + 8);
  doc.text(`CEI: ${safeStr(ob?.cei)}`, margin + 2, y + 12);
  doc.text(`End.: ${addrLine(ob?.endereco)}`, margin + 2, y + 16);
  doc.text(
    `${safeStr(ob?.endereco?.bairro)} · ${safeStr(ob?.endereco?.cidade)}/${safeStr(ob?.endereco?.uf)} · CEP ${safeStr(ob?.endereco?.cep)}`,
    margin + 2,
    y + 20,
  );
  doc.text(`Telefone: ${safeStr(ob?.telefone)}`, margin + 2, y + 24);

  doc.setFont('helvetica', 'bold');
  drawBox(doc, margin + halfW + 2, y, halfW, 26);
  doc.text('ENDEREÇO DE COBRANÇA', margin + halfW + 4, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(`End.: ${addrLine(cob)}`, margin + halfW + 4, y + 8);
  doc.text(`Bairro: ${safeStr(cob.bairro)}`, margin + halfW + 4, y + 12);
  doc.text(`Cidade: ${safeStr(cob.cidade)} · UF ${safeStr(cob.uf)}`, margin + halfW + 4, y + 16);
  doc.text(`CEP: ${safeStr(cob.cep)}`, margin + halfW + 4, y + 20);
  y += 28;

  // ── Linha de envio de NF ───────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  drawBox(doc, margin, y, pw - 2 * margin, 6);
  doc.text(
    `${data.config.texto_envio_nf ?? ''} ${safeStr(e?.email_envio_nf)}`,
    margin + 2,
    y + 4,
  );
  y += 8;

  // ── Tabela de itens ────────────────────────────────────────────────────────
  const head = [['Item', 'Descrição', 'Obs.', 'Qtd', 'Un', 'Preço Unit', 'IPI%', 'Desc%', 'Total', 'Prazo']];
  const body = (oc.itens ?? []).map((it, i) => {
    const tot = computeItemTotal(it);
    return [
      String(i + 1),
      it.descricao ?? '',
      it.observacao ?? '',
      (Number(it.quantidade) || 0).toLocaleString('pt-BR'),
      it.unidade ?? '',
      formatBrl(it.preco_unit),
      `${Number(it.ipi_pct) || 0}%`,
      `${Number(it.desc_pct) || 0}%`,
      formatBrl(tot.total),
      it.prazo_entrega ? formatDate(it.prazo_entrega) : '—',
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: y,
    margin: { left: margin, right: margin, bottom: ph - contentBottomY },
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: [11, 105, 183], textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center' },
      1: { cellWidth: 56 },
      2: { cellWidth: 24 },
      3: { cellWidth: 12, halign: 'right' },
      4: { cellWidth: 9, halign: 'center' },
      5: { cellWidth: 19, halign: 'right' },
      6: { cellWidth: 10, halign: 'right' },
      7: { cellWidth: 10, halign: 'right' },
      8: { cellWidth: 22, halign: 'right' },
      9: { cellWidth: 19, halign: 'center' },
    },
  });
  y = doc.lastAutoTable.finalY + 3;
  ensureSpace(34);

  // ── Totalizadores ──────────────────────────────────────────────────────────
  const colW = 50;
  const valW = 30;
  const totX = pw - margin - (colW + valW);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const lines: [string, string][] = [
    ['SUB-TOTAL', formatBrl(totals.sub_total)],
    ['(-) DESCONTO', formatBrl(totals.desc_itens)],
    ['(+) IPI', formatBrl(totals.total_ipi)],
    ['(+) FRETE', formatBrl(totals.total_frete)],
    ['(+) OUTRAS DESPESAS', formatBrl(totals.total_outras)],
    ['(-) DESC MATERIAL', formatBrl(totals.total_desc_mat)],
  ];
  for (const [k, v] of lines) {
    doc.text(k, totX, y);
    doc.text(v, totX + colW + valW, y, { align: 'right' });
    y += 4;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setDrawColor(11, 105, 183);
  doc.setLineWidth(0.4);
  doc.line(totX, y - 1, totX + colW + valW, y - 1);
  doc.setTextColor(11, 105, 183);
  doc.text('TOTAL GERAL', totX, y + 4);
  doc.text(formatBrl(totals.total_geral), totX + colW + valW, y + 4, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 8;
  ensureSpace(16);

  // ── Qualidade ──────────────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  drawBox(doc, margin, y, pw - 2 * margin, 7);
  doc.text(
    data.config.texto_qualidade || 'CRITÉRIO DE QUALIFICAÇÃO CONFORME ECR',
    margin + 2,
    y + 5,
  );
  y += 9;

  // ── Observações ────────────────────────────────────────────────────────────
  if (oc.observacoes) {
    const obsLines = doc.splitTextToSize(oc.observacoes, pw - 2 * margin) as string[];
    ensureSpace(6 + obsLines.length * 4);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(obsLines, margin, y);
    y += obsLines.length * 4 + 2;
  }

  // ── Condições de contratação ───────────────────────────────────────────────
  const cond = doc.splitTextToSize(
    normalizeCondicoesContratacao(data.config.texto_condicoes_contratacao),
    pw - 2 * margin,
  ) as string[];
  ensureSpace(8 + cond.length * 3.4);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES DE CONTRATAÇÃO:', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(cond, margin, y);
  y += cond.length * 3.4 + 4;

  // ── Assinaturas ────────────────────────────────────────────────────────────
  const signatureHeight = 12;
  if (y + signatureHeight > contentBottomY) {
    doc.addPage();
    y = margin;
  }
  const sigY = Math.min(y + 8, contentBottomY - signatureHeight);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.line(margin + 5, sigY, margin + 70, sigY);
  doc.text('CARIMBO DE RECEBIMENTO DO MATERIAL', margin + 5, sigY + 4);
  doc.line(pw - margin - 70, sigY, pw - margin - 5, sigY);
  doc.text('AUTORIZAÇÃO / CAMPISI', pw - margin - 65, sigY + 4);

  // ── Rodapé ─────────────────────────────────────────────────────────────────
  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    drawFooter();
  }

  return doc.output('blob');
}

/**
 * Salva o PDF no diretório da obra (pasta_oc_path) se um handle estiver disponível,
 * e também baixa via createObjectURL como fallback.
 */
export async function savePdfToFile(
  blob: Blob,
  filename: string,
  obraHandle?: FileSystemDirectoryHandle | null,
): Promise<'saved' | 'downloaded'> {
  if (obraHandle) {
    try {
      const fh = await obraHandle.getFileHandle(filename, { create: true });
      const w = await fh.createWritable();
      await w.write(blob);
      await w.close();
      return 'saved';
    } catch {
      /* cai para download */
    }
  }

  // Fallback: download via URL object
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
