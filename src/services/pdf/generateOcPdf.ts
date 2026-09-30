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
import { temSinal } from '../../domain/letrasDoPdf';
import { celulasComSinais, escritaComSinais } from './textoComSinais';
import type { Data, Destinatario, OrdemCompra } from '../../domain/types';
import { computeOcTotals } from '../../domain/compute';
import { destinatarioParaImpressao, documentoRotulado, formatarDocumento } from '../../domain/destinatario';
import { formatBrl, formatDate } from '../../domain/format';
import { textoParaANotaFiscal } from '../../domain/notaFiscal';
import { drawBox, addrLine } from './helpers';
import { downloadBlob } from '../storage/download';
import { corpoDaTabelaDeItens } from './tabelaDeItens';

// ── Types internos ────────────────────────────────────────────────────────────

/** Acesso ao lastAutoTable injetado pelo plugin jspdf-autotable. */
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeStr(v: unknown): string {
  return v != null ? String(v) : '';
}

/** "CNPJ: 00.000.000/0000-00" ou "CPF: 000.000.000-00" — vazio sem destinatário. */
function destinatarioDoc(d: Destinatario | undefined): string {
  return d ? documentoRotulado(d).replace(/^(CNPJ|CPF) /, '$1: ') : '';
}

const LOGO_PATH = `${import.meta.env.BASE_URL}brazao1.png`;
let logoDataUrlPromise: Promise<string | null> | null = null;

// O item 1 nomeia o campo da nota (CTO-D655): "rodapé" não é campo de nota
// eletrônica; o texto livre dela é o INFORMAÇÕES COMPLEMENTARES, no quadro
// "Dados adicionais". O antigo item 5 (número da OC e obra/CNO) saiu: o quadro
// do alto da página já leva os dois, e o item 1 manda escrevê-lo.
const ITEM_1 =
  '1) Escrever no campo INFORMAÇÕES COMPLEMENTARES da Nota Fiscal o texto do quadro PARA A NOTA FISCAL, no alto ' +
  'da página 1: a obra, o endereço com o CEP, o CNO (quando houver) e o número desta OC. O local de entrega é o ' +
  'endereço da obra.';
const DEFAULT_CONDICOES_CONTRATACAO = [
  ITEM_1,
  '2) Caso o pagamento seja em carteira, incluir os dados bancários no corpo da NF.',
  '3) Informar que o emitente desta OC é consumidor final, quando aplicável.',
  '4) É proibida a negociação de títulos com terceiros sem autorização prévia.',
  '5) ESSA ORDEM DE COMPRA DEVE SER ENVIADA JUNTAMENTE À NF NA ENTREGA DO MATERIAL.',
].join('\n');

/** Azul da casa no PDF (o mesmo da linha do cabeçalho e da tabela). */
const AZUL: [number, number, number] = [11, 105, 183];

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao carregar logo.'));
    reader.readAsDataURL(blob);
  });
}

export async function loadCampisiLogo(): Promise<string | null> {
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
    .replace(/^1\) Constar o nome e endereço da obra no rodapé da Nota Fiscal\.$/m, ITEM_1)
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
  return desenhaPdfDaOc(oc, data, await loadCampisiLogo()).output('blob');
}

/**
 * Desenha o PDF e devolve o documento (o teste lê o texto dele sem baixar).
 * `logoDataUrl` é a marca em data URL, ou `null` (o PDF sai sem ela).
 */
export function desenhaPdfDaOc(oc: OrdemCompra, data: Data, logoDataUrl: string | null): JsPDFWithAutoTable {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }) as JsPDFWithAutoTable;

  // Resolução de destinatário, fornecedor e obra. O destinatário da nota é
  // o da OBRA (a fotografia gravada na emissão, ou o que a obra aponta hoje)
  // — não há mais lista de emitentes (CTO-D390, 15/09/2026).
  const f = data.fornecedores.find((x) => x.id === oc.fornecedor_id);
  const ob = data.obras.find((x) => x.id === oc.obra_id);
  const d = destinatarioParaImpressao(oc, data.obras);
  const totals = computeOcTotals(oc);

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 10;
  const footerLineY = ph - 15;
  const footerTextY = ph - 7;
  const contentBottomY = footerLineY - 4;
  let y = 12;

  // O texto livre com sinal sai pelos trechos (CTO-D620 §2); sem sinal, a
  // chamada de sempre, e o PDF sai igual.
  const escrita = escritaComSinais(doc);
  /** As linhas uma embaixo da outra, no espaçamento que o `doc.text` daria a elas. */
  function escreveLinhas(linhas: string[], y0: number): void {
    const entre = doc.getLineHeight() / doc.internal.scaleFactor;
    linhas.forEach((l, k) => escrita.desenha(l, margin, y0 + k * entre, 'normal'));
  }

  function ensureSpace(requiredHeight: number): void {
    if (y + requiredHeight <= contentBottomY) return;
    doc.addPage();
    y = margin;
  }

  function drawFooter(): void {
    doc.setDrawColor(215);
    doc.setLineWidth(0.2);
    doc.line(margin, footerLineY, pw - margin, footerLineY);
    // A lembrança da nota em toda página (CTO-D655 §4.5), numa linha.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...AZUL);
    doc.text(
      'NA NOTA FISCAL: o endereço da obra vai no campo INFORMAÇÕES COMPLEMENTARES (quadro PARA A NOTA FISCAL, página 1)',
      pw / 2,
      footerLineY + 4,
      { align: 'center' },
    );
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
      // Comprimida ('FAST', CTO-D593 §3): sem isso, o jsPDF grava a marca crua
      // (1080 × 974 pontos, com transparência) e cada OC passava de 4 MB.
      doc.addImage(logoDataUrl, 'PNG', margin, 6, 14, 14, undefined, 'FAST');
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

  // ── Para a nota fiscal ─────────────────────────────────────────────────────
  // A coisa mais visível da página (CTO-D655): o vendedor tem de escrever o
  // endereço da obra na nota, e a Central_Financeiro acha a obra por ele. A
  // instrução nomeia o campo; o texto vem pronto para copiar; o local de
  // entrega é o mesmo endereço (o antigo ENTREGAR EM mora aqui agora).
  {
    const largura = pw - 2 * margin;
    const textoDaNota = textoParaANotaFiscal(ob, oc.numero);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    const comSinal = temSinal(textoDaNota);
    const linhasDaNota = comSinal
      ? escrita.quebra(textoDaNota, largura - 10)
      : (doc.splitTextToSize(textoDaNota, largura - 10) as string[]);
    const entre = 4.6;
    const telefone = ob?.telefone?.trim() ? ` Telefone da obra: ${ob.telefone.trim()}.` : '';
    const entrega = `Local de entrega: este mesmo endereço, o da obra.${telefone}`;
    // Empresa na nota: o endereço dela continua o do cadastro. A obra nunca
    // vai no lugar do endereço do destinatário (CTO-D655, o cuidado do texto).
    const cuidado =
      d?.tipo === 'pj'
        ? 'Não troque o endereço do destinatário pelo da obra: o da empresa, no quadro FATURAR PARA, continua o do ' +
          'cadastro dela. O endereço da obra vai só nas informações complementares e no local de entrega.'
        : '';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    const linhasDoCuidado = cuidado ? (doc.splitTextToSize(cuidado, largura - 6) as string[]) : [];
    const alturaDoTexto = linhasDaNota.length * entre + 4;
    const altura = 13 + alturaDoTexto + 6 + linhasDoCuidado.length * 3.4 + 1;

    doc.setFillColor(234, 242, 251);
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.8);
    doc.rect(margin, y, largura, altura, 'FD');
    doc.setTextColor(...AZUL);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('PARA A NOTA FISCAL', margin + 3, y + 5.5);
    doc.setFontSize(7.5);
    doc.text('LEIA ANTES DE EMITIR A NOTA', pw - margin - 3, y + 5.5, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Escreva no campo INFORMAÇÕES COMPLEMENTARES da nota fiscal o texto abaixo:', margin + 3, y + 10.5);

    const yTexto = y + 13;
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.rect(margin + 3, yTexto, largura - 6, alturaDoTexto, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    if (comSinal) {
      linhasDaNota.forEach((l, k) => escrita.desenha(l, margin + 5, yTexto + 4.8 + k * entre, 'bold'));
    } else {
      linhasDaNota.forEach((l, k) => doc.text(l, margin + 5, yTexto + 4.8 + k * entre));
    }

    let yDepois = yTexto + alturaDoTexto + 4.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(entrega, margin + 3, yDepois);
    if (linhasDoCuidado.length) {
      yDepois += 3.8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(60);
      doc.text(linhasDoCuidado, margin + 3, yDepois);
      doc.setTextColor(0, 0, 0);
    }
    y += altura + 3;
  }

  // ── Faturar para ───────────────────────────────────────────────────────────
  // Quem recebe a nota: o destinatário cadastrado na obra. Nome, documento e
  // o endereço que o cadastro tiver (pessoa física pode não ter). Menor que o
  // quadro da nota, e o título diz de quem é o endereço ("os dois, com
  // destaque na obra", palavra do Pedro, CTO-D655).
  doc.setDrawColor(180);
  doc.setLineWidth(0.2);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  drawBox(doc, margin, y, pw - 2 * margin, 19.6);
  const tituloDoDestinatario = 'FATURAR PARA — DESTINATÁRIO DA NOTA';
  doc.text(tituloDoDestinatario, margin + 2, y + 3.8);
  // A nota cinza começa onde o título acaba, medido, e não num ponto fixo.
  const fimDoTitulo = margin + 2 + doc.getTextWidth(tituloDoDestinatario) + 3;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(90);
  doc.text('(endereço do cadastro do destinatário, não o da obra)', fimDoTitulo, y + 3.8);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7.5);
  doc.text(`Razão Social / Nome: ${safeStr(d?.nome)}`, margin + 2, y + 7.4);
  doc.text(destinatarioDoc(d), margin + 2, y + 10.8);
  doc.text(`Data: ${formatDate(oc.data)}`, margin + 120, y + 10.8);
  doc.text(`Endereço do destinatário: ${addrLine(d?.endereco)}`, margin + 2, y + 14.2);
  doc.text(`Bairro: ${safeStr(d?.endereco?.bairro)}`, margin + 2, y + 17.6);
  doc.text(`Cidade: ${safeStr(d?.endereco?.cidade)}`, margin + 70, y + 17.6);
  doc.text(`UF: ${safeStr(d?.endereco?.uf)}`, margin + 120, y + 17.6);
  doc.text(`CEP: ${safeStr(d?.endereco?.cep)}`, margin + 140, y + 17.6);
  y += 21.6;

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
  // O banco guarda o CNPJ só em dígitos; no papel ele sai pontuado.
  doc.text(`CNPJ: ${f?.cnpj ? formatarDocumento(f.cnpj, 'pj') : ''}`, margin + 2, y + 12);
  doc.text(`IE: ${safeStr(f?.ie)}`, margin + 70, y + 12);
  doc.text(`Endereço: ${addrLine(f?.endereco)}`, margin + 2, y + 16);
  doc.text(`Bairro: ${safeStr(f?.endereco?.bairro)}`, margin + 2, y + 20);
  doc.text(`Cidade: ${safeStr(f?.endereco?.cidade)}`, margin + 70, y + 20);
  doc.text(`UF: ${safeStr(f?.endereco?.uf)}`, margin + 120, y + 20);
  doc.text(`CEP: ${safeStr(f?.endereco?.cep)}`, margin + 140, y + 20);
  doc.text(`Telefone: ${safeStr(f?.telefones?.[0])}`, margin + 2, y + 24);
  doc.text(`E-mail: ${safeStr(f?.email)}`, margin + 70, y + 24);
  y += 28;

  // (O antigo ENTREGAR EM, com o endereço da obra, se fundiu no quadro PARA A
  // NOTA FISCAL, no alto: o endereço da obra não aparece duas vezes
  // competindo, CTO-D655 §4.3.)

  // ── Tabela de itens ────────────────────────────────────────────────────────
  const head = [['Item', 'Descrição', 'Obs.', 'Qtd', 'Un', 'Preço Unit', 'IPI%', 'Desc%', 'Total', 'Prazo']];
  const body = corpoDaTabelaDeItens(oc.itens ?? []);

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
    // Descrição e observação com "≥" ou "≤" saem pelos trechos, os sinais na
    // Symbol; sem sinal, a célula é a de sempre (CTO-D620 §2).
    ...celulasComSinais(doc),
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
  const textoQualidade = data.config.texto_qualidade || 'CRITÉRIO DE QUALIFICAÇÃO CONFORME ECR';
  if (temSinal(textoQualidade)) escrita.desenha(textoQualidade, margin + 2, y + 5, 'bold');
  else doc.text(textoQualidade, margin + 2, y + 5);
  y += 12;

  // ── Observações ────────────────────────────────────────────────────────────
  if (oc.observacoes) {
    const comSinal = temSinal(oc.observacoes);
    const obsLines = comSinal
      ? oc.observacoes.split(/\r\n|\r|\n/).flatMap((p) => escrita.quebra(p, pw - 2 * margin))
      : (doc.splitTextToSize(oc.observacoes, pw - 2 * margin) as string[]);
    ensureSpace(6 + obsLines.length * 4);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES:', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    if (comSinal) escreveLinhas(obsLines, y);
    else doc.text(obsLines, margin, y);
    y += obsLines.length * 4 + 2;
  }

  // ── Condições de contratação ───────────────────────────────────────────────
  const textoCond = normalizeCondicoesContratacao(data.config.texto_condicoes_contratacao);
  const condComSinal = temSinal(textoCond);
  const cond = condComSinal
    ? textoCond.split(/\r\n|\r|\n/).flatMap((p) => escrita.quebra(p, pw - 2 * margin))
    : (doc.splitTextToSize(textoCond, pw - 2 * margin) as string[]);
  ensureSpace(8 + cond.length * 3.4);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES DE CONTRATAÇÃO:', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  if (condComSinal) escreveLinhas(cond, y);
  else doc.text(cond, margin, y);
  y += cond.length * 3.4 + 4;

  // ── Assinaturas ────────────────────────────────────────────────────────────
  const signatureHeight = 12;
  if (y + signatureHeight > contentBottomY) {
    doc.addPage();
    y = margin;
  }
  // Posição preferida: 20mm acima da linha do rodapé (perto do fim da página).
  // Nunca acima do conteúdo (y+8) nem além da zona segura (contentBottomY-12).
  const sigY = Math.min(
    Math.max(y + 8, footerLineY - 20),
    contentBottomY - signatureHeight,
  );
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

  return doc;
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
  downloadBlob(blob, filename);
  return 'downloaded';
}
