/**
 * O PDF de uma ECR (CTO-D589 §4.1, palavra do Pedro: "botão de PDF em cada
 * ECR"). Sem o Word, é por ele que a obra e o auditor leem a ECR.
 *
 * Parecido com o documento de antes, página por página:
 * - no alto de toda página, o cabeçalho: a marca, "ECR – ESPECIFICAÇÃO DE
 *   COMPRA E RECEBIMENTO", o nome, o código e "Rev.: 00";
 * - as cinco seções, "01. REFERÊNCIA"…, com o traço embaixo do título; as
 *   linhas da lista com o quadradinho, e as notas sem ele, em destaque;
 * - no pé de toda página, a tabela de revisões, e o número da página.
 *
 * A mesma biblioteca do PDF da OC (jsPDF), com a fonte padrão dela.
 */

import jsPDF from 'jspdf';
import type { Ecr, EcrItem } from '../../domain/types';
import {
  CABECALHO_DO_PDF,
  COLUNAS_DO_HISTORICO,
  NENHUMA_REVISAO,
  SEM_HISTORICO,
  SEM_TEXTO,
  blocosDaSecao,
  linhaDoHistorico,
  nomeDoPdfDaEcr,
  numeroDaSecao,
} from '../../domain/ecr';
import { loadCampisiLogo } from './generateOcPdf';
import { downloadBlob } from '../storage/download';

// ── Medidas (mm) ──────────────────────────────────────────────────────────────

const MARGEM = 18;
const TOPO_DO_TEXTO = 36;
const PE = 16; // do fim da tabela de revisões até a borda de baixo
const FONTE = 9.5;
const LINHA = 4.6;
const FONTE_DA_TABELA = 7.5;
const LINHA_DA_TABELA = 3.2;
/** As colunas da tabela de revisões, somando a largura útil (174). */
const LARGURAS = [15, 22, 69, 34, 34];

const AZUL: [number, number, number] = [11, 105, 183]; // o mesmo traço do PDF da OC
const VERMELHO: [number, number, number] = [255, 0, 0]; // o destaque das notas no documento

/**
 * A fonte padrão do PDF só desenha o que cabe na tabela do Windows (cp1252).
 * Medido nas 20 ECRs: um caractere só fica de fora, o "ᶟ" de "mᶟ", na ECR 03.
 * Ele sai como "³", que é como o documento o mostra. Qualquer outro de fora
 * vira "?", para ninguém ler um sinal trocado sem perceber.
 */
const TROCAS_DA_FONTE: Record<string, string> = { 'ᶟ': '³' };
/** Os 27 sinais da tabela do Windows que ficam fora do Latin-1 (aspas curvas, travessões…). */
const EXTRAS_DA_FONTE = new Set(
  [0x152, 0x153, 0x160, 0x161, 0x178, 0x17d, 0x17e, 0x192, 0x2c6, 0x2dc, 0x2013, 0x2014, 0x2018, 0x2019, 0x201a,
    0x201c, 0x201d, 0x201e, 0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2039, 0x203a, 0x20ac, 0x2122],
);

function cabeNaFonte(c: string): boolean {
  const n = c.codePointAt(0) ?? 0;
  return (n >= 0x20 && n <= 0x7e) || (n >= 0xa0 && n <= 0xff) || EXTRAS_DA_FONTE.has(n);
}

export function paraAFonteDoPdf(texto: string): string {
  return Array.from(texto, (c) => (cabeNaFonte(c) ? c : (TROCAS_DA_FONTE[c] ?? '?'))).join('');
}

interface Pedaco {
  texto: string;
  negrito: boolean;
}

/** As palavras de uma linha, com o rótulo em negrito ("Lote:" + o texto). */
function palavrasDoItem(item: EcrItem, tudoNegrito: boolean): Pedaco[] {
  const pedacos: Pedaco[] = [];
  if (item.rotulo) {
    for (const p of `${item.rotulo}:`.split(' ')) pedacos.push({ texto: p, negrito: true });
  }
  for (const p of item.texto.split(' ')) pedacos.push({ texto: p, negrito: tudoNegrito });
  return pedacos.map((p) => ({ ...p, texto: paraAFonteDoPdf(p.texto) }));
}

/**
 * Desenha o PDF e devolve o documento (o teste lê o texto dele sem baixar).
 * `logo` é a imagem da marca em data URL, ou `null` (o PDF sai sem ela).
 */
export function desenhaPdfDaEcr(ecr: Ecr, logo: string | null): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const largura = pw - 2 * MARGEM;

  // ── A tabela de revisões: medida antes, porque ela marca o fim do texto ──
  doc.setFontSize(FONTE_DA_TABELA);
  const cabecaDaTabela = COLUNAS_DO_HISTORICO.map((c, i) => doc.splitTextToSize(c, LARGURAS[i]! - 2) as string[]);
  const linhasDaTabela: string[][][] =
    ecr.revisoes && ecr.revisoes.length > 0
      ? ecr.revisoes.map((r) =>
          linhaDoHistorico(r).map((c, i) => doc.splitTextToSize(paraAFonteDoPdf(c), LARGURAS[i]! - 2) as string[]),
        )
      : [[doc.splitTextToSize(ecr.revisoes ? NENHUMA_REVISAO : SEM_HISTORICO, largura - 2) as string[]]];
  const alturaDaLinha = (celulas: string[][]) =>
    Math.max(...celulas.map((c) => c.length)) * LINHA_DA_TABELA + 2;
  const alturaDaTabela =
    alturaDaLinha(cabecaDaTabela) + linhasDaTabela.reduce((s, l) => s + alturaDaLinha(l), 0);
  const topoDaTabela = ph - PE - alturaDaTabela;
  const fimDoTexto = topoDaTabela - 5;

  let y = TOPO_DO_TEXTO;
  function cabe(altura: number): void {
    if (y + altura <= fimDoTexto) return;
    doc.addPage();
    y = TOPO_DO_TEXTO;
  }

  /** Escreve as palavras quebrando a linha na largura; o negrito vai palavra por palavra. */
  function escreve(pedacos: Pedaco[], x: number, larguraUtil: number, antesDaLinha?: () => void): void {
    doc.setFontSize(FONTE);
    const larguraDe = (p: Pedaco) => {
      doc.setFont('helvetica', p.negrito ? 'bold' : 'normal');
      return doc.getTextWidth(p.texto);
    };
    doc.setFont('helvetica', 'normal');
    const espaco = doc.getTextWidth(' ');
    const linhas: Pedaco[][] = [[]];
    let usada = 0;
    for (const p of pedacos) {
      const atual = linhas[linhas.length - 1]!;
      const w = larguraDe(p);
      if (atual.length > 0 && usada + espaco + w > larguraUtil) {
        linhas.push([p]);
        usada = w;
      } else {
        usada += (atual.length > 0 ? espaco : 0) + w;
        atual.push(p);
      }
    }
    linhas.forEach((linha, i) => {
      cabe(LINHA);
      if (i === 0) antesDaLinha?.();
      let cx = x;
      linha.forEach((p, j) => {
        if (j > 0) cx += espaco;
        doc.setFont('helvetica', p.negrito ? 'bold' : 'normal');
        doc.text(p.texto, cx, y);
        cx += doc.getTextWidth(p.texto);
      });
      y += LINHA;
    });
  }

  // ── O texto ──
  doc.setTextColor(0, 0, 0);
  if (!ecr.secoes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONTE);
    doc.text(SEM_TEXTO, MARGEM, y);
  } else {
    ecr.secoes.forEach((secao, i) => {
      cabe(LINHA * 3); // o título nunca fica sozinho no fim da página
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(paraAFonteDoPdf(`${numeroDaSecao(i)} ${secao.titulo}`), MARGEM, y);
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(MARGEM, y + 1.8, pw - MARGEM, y + 1.8);
      y += 7.5;

      for (const bloco of blocosDaSecao(secao.itens)) {
        if (bloco.tipo === 'lista') {
          for (const item of bloco.itens) {
            const yDoQuadrado = () => {
              doc.setFillColor(0, 0, 0);
              doc.rect(MARGEM + 2.5, y - 2.1, 1.3, 1.3, 'F');
            };
            escreve(palavrasDoItem(item, false), MARGEM + 7, largura - 7, yDoQuadrado);
            y += 0.6;
          }
        } else {
          doc.setTextColor(...VERMELHO);
          escreve(palavrasDoItem(bloco.item, true), MARGEM, largura);
          doc.setTextColor(0, 0, 0);
          y += 0.6;
        }
      }
      y += 3;
    });
  }

  // ── Cabeçalho, tabela de revisões e número, em toda página ──
  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setTextColor(0, 0, 0);

    if (logo) {
      try {
        // Comprimida ('FAST'): sem isso, o jsPDF grava a marca crua, e o PDF
        // de uma página passa de 4 MB. 1080 × 974 pontos: 16 × 14,4 mm.
        doc.addImage(logo, 'PNG', MARGEM, 10, 16, 14.4, 'marca', 'FAST');
      } catch {
        /* a marca é enfeite; sem ela, o PDF sai do mesmo jeito */
      }
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(CABECALHO_DO_PDF, pw / 2, 16, { align: 'center' });
    doc.text(paraAFonteDoPdf(ecr.codigo), pw - MARGEM, 15, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(paraAFonteDoPdf(ecr.nome.toUpperCase()), pw / 2, 20.5, { align: 'center' });
    doc.text(`Rev.: ${ecr.revisao ?? '—'}`, pw - MARGEM, 19.5, { align: 'right' });
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.4);
    doc.line(MARGEM, 29, pw - MARGEM, 29);

    // A tabela: a cabeça em cinza, as linhas centradas, como no documento.
    doc.setDrawColor(120);
    doc.setLineWidth(0.2);
    doc.setFontSize(FONTE_DA_TABELA);
    let ty = topoDaTabela;
    const desenhaLinha = (celulas: string[][], negrito: boolean, fundo: boolean) => {
      const h = alturaDaLinha(celulas);
      doc.setFont('helvetica', negrito ? 'bold' : 'normal');
      let tx = MARGEM;
      const larguras = celulas.length === 1 ? [largura] : LARGURAS;
      celulas.forEach((linhas, i) => {
        const w = larguras[i]!;
        if (fundo) {
          doc.setFillColor(235, 235, 235);
          doc.rect(tx, ty, w, h, 'FD');
        } else {
          doc.rect(tx, ty, w, h);
        }
        doc.text(linhas, tx + w / 2, ty + 3.4, { align: 'center' });
        tx += w;
      });
      ty += h;
    };
    desenhaLinha(cabecaDaTabela, true, true);
    for (const l of linhasDaTabela) desenhaLinha(l, false, false);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    doc.text(`Página ${pagina} de ${paginas}`, pw - MARGEM, ph - 8, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  return doc;
}

/** O PDF da ECR como arquivo. */
export async function generateEcrPdfBlob(ecr: Ecr): Promise<Blob> {
  return desenhaPdfDaEcr(ecr, await loadCampisiLogo()).output('blob');
}

/** Gera e baixa: "ECR 03 - Concreto Usinado - Rev 00.pdf". */
export async function baixarPdfDaEcr(ecr: Ecr): Promise<void> {
  downloadBlob(await generateEcrPdfBlob(ecr), nomeDoPdfDaEcr(ecr));
}
