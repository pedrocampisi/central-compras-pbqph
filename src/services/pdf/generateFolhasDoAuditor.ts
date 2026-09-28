/**
 * As duas folhas do auditor em PDF (CTO-D604 §3.5): a lista de qualificados
 * (o que a FO 8.4.1.1 é hoje) e as avaliações de entrega. O que vai em cada
 * célula mora em `domain/folhasDoAuditor` — aqui é só o desenho.
 *
 * Paisagem, a mesma biblioteca e o mesmo azul do PDF da OC. O texto passa
 * pela Helvetica (`paraAHelvetica`): letra que ela não desenha vira a troca
 * conhecida, nunca um quadrado em branco.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable/es';
import { paraAHelvetica } from '../../domain/letrasDoPdf';
import type { SecaoDosQualificados } from '../../domain/folhasDoAuditor';
import { dataBr } from '../../domain/qualificacao';
import { loadCampisiLogo } from './generateOcPdf';
import { downloadBlob } from '../storage/download';

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

const MARGEM = 10;
const AZUL: [number, number, number] = [11, 105, 183];

function novoDocumento(): JsPDFWithAutoTable {
  return new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' }) as JsPDFWithAutoTable;
}

/** O cabeçalho de toda página: a marca, o título, o subtítulo e a data da emissão. */
function cabecalho(doc: jsPDF, logo: string | null, titulo: string, subtitulo: string, hoje: string): void {
  const pw = doc.internal.pageSize.getWidth();
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', MARGEM, 6, 12, 12, undefined, 'FAST');
    } catch {
      /* a marca é decorativa */
    }
  }
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(paraAHelvetica(titulo), pw / 2, 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(paraAHelvetica(subtitulo), pw / 2, 16, { align: 'center' });
  doc.text('CAMPISI ENGENHARIA', MARGEM + 15, 11);
  doc.text(`Emitida em ${dataBr(hoje)}`, pw - MARGEM, 11, { align: 'right' });
  doc.setDrawColor(...AZUL);
  doc.setLineWidth(0.4);
  doc.line(MARGEM, 20, pw - MARGEM, 20);
}

function numerarPaginas(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(90);
    doc.text(`Página ${i} de ${total}`, pw - MARGEM, ph - 5, { align: 'right' });
  }
}

const H = (linhas: string[][]) => linhas.map((l) => l.map(paraAHelvetica));

/**
 * A lista de qualificados: uma seção por aba da FO 8.4.1.1, com o nome dos
 * três critérios no cabeçalho de cada uma. Seção sem ninguém diz isso, em
 * vez de sumir: o auditor vê que a aba existe e está vazia.
 */
export function pdfDosQualificados(
  secoes: readonly SecaoDosQualificados[],
  hoje: string,
  logo: string | null,
): JsPDFWithAutoTable {
  const doc = novoDocumento();
  const titulo = 'FO 8.4.1.1 — QUALIFICAÇÃO DE FORNECEDORES';
  const subtitulo = 'Situação calculada pelo sistema; só a qualificação que vale de cada empresa';
  let y = 25;
  secoes.forEach((s) => {
    const material = s.categoria === 'material';
    autoTable(doc, {
      head: [
        [{ content: paraAHelvetica(s.nome.toUpperCase()), colSpan: material ? 10 : 9, styles: { halign: 'left', fillColor: [230, 238, 247], textColor: 20 } }],
        H([[
          'Fornecedor', 'Tipo', 'Qualificada em', 'Requalificar em',
          ...s.criterios, 'Nota', 'Situação', ...(material ? ['Permissão p/ material controlado'] : []),
        ]])[0]!,
      ],
      body: s.linhas.length > 0 ? H(s.linhas) : [[{ content: 'Nenhuma empresa qualificada nesta categoria.', colSpan: material ? 10 : 9 }]],
      startY: y,
      margin: { top: 25, left: MARGEM, right: MARGEM, bottom: 12 },
      styles: { fontSize: 7.5, cellPadding: 1.4, overflow: 'linebreak' },
      headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: material ? 52 : 62 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center', cellWidth: 11 },
        8: { cellWidth: 24 },
      },
      didDrawPage: () => cabecalho(doc, logo, titulo, subtitulo, hoje),
    });
    y = doc.lastAutoTable.finalY + 6;
  });
  numerarPaginas(doc);
  return doc;
}

/** As avaliações de entrega (PS.02, 8.4.1.2). `obra` é o nome da obra da máscara, ou `null` (todas). */
export function pdfDasAvaliacoes(
  linhas: readonly string[][],
  obra: string | null,
  hoje: string,
  logo: string | null,
): JsPDFWithAutoTable {
  const doc = novoDocumento();
  const titulo = 'AVALIAÇÃO NO RECEBIMENTO — PS.02, 8.4.1.2';
  const subtitulo = obra ? `Obra: ${obra}` : 'Todas as obras';
  autoTable(doc, {
    head: H([[
      'OC', 'Fornecedor', 'Obra', 'NF', 'Recebida em', 'Prazo', 'Integridade', 'OC / ECR',
      'Observação e tratativa', 'Avaliada por', 'Ciência',
    ]]),
    body: linhas.length > 0 ? H(linhas.map((l) => [...l])) : [[{ content: 'Nenhuma entrega avaliada.', colSpan: 11 }]],
    startY: 25,
    margin: { top: 25, left: MARGEM, right: MARGEM, bottom: 12 },
    styles: { fontSize: 7.5, cellPadding: 1.4, overflow: 'linebreak' },
    headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 40 },
      2: { cellWidth: 32 },
      3: { cellWidth: 16 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 13, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 14, halign: 'center' },
      9: { cellWidth: 26 },
      10: { cellWidth: 28 },
    },
    didDrawPage: () => cabecalho(doc, logo, titulo, subtitulo, hoje),
  });
  numerarPaginas(doc);
  return doc;
}

/** Desenha e baixa a lista de qualificados. */
export async function baixarPdfDosQualificados(secoes: readonly SecaoDosQualificados[], hoje: string): Promise<void> {
  const doc = pdfDosQualificados(secoes, hoje, await loadCampisiLogo());
  downloadBlob(doc.output('blob'), `qualificacao-de-fornecedores ${hoje}.pdf`);
}

/** Desenha e baixa as avaliações de entrega. */
export async function baixarPdfDasAvaliacoes(linhas: readonly string[][], obra: string | null, hoje: string): Promise<void> {
  const doc = pdfDasAvaliacoes(linhas, obra, hoje, await loadCampisiLogo());
  downloadBlob(doc.output('blob'), `avaliacoes-de-entrega ${hoje}.pdf`);
}
