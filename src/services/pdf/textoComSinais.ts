/**
 * O caminho do texto livre em todo PDF da casa (perícia de 27/09, achado 3;
 * perícia de 28/09, B4; CTO-D620 §2): o que não tem sinal é escrito como
 * sempre foi, e o PDF sai igual; o que tem "≥", "≤", as setas ou as letras
 * gregas é escrito em trechos, os sinais na fonte Symbol. Nasceu dentro do
 * PDF da ECR e saiu daqui para as folhas do auditor e o PDF da OC.
 */

import type jsPDF from 'jspdf';
import type { CellHookData, UserOptions } from 'jspdf-autotable';
import { LARGURA_NA_SYMBOL, paraAHelvetica, temSinal, trechosDoPdf, type Trecho } from '../../domain/letrasDoPdf';

export type Estilo = 'normal' | 'bold';

export interface EscritaComSinais {
  /** A largura de um texto no tamanho de agora, com os sinais na Symbol. */
  larguraDe: (texto: string, estilo: Estilo) => number;
  /** Escreve um texto. Sem sinal, é a mesma chamada de antes: o PDF sai igual. */
  desenha: (texto: string, x: number, y: number, estilo: Estilo, align?: 'center' | 'right') => void;
  /** As linhas de um texto. Sem sinal, a quebra de sempre; com sinal, palavra por palavra. */
  quebra: (texto: string, larguraUtil: number, estilo?: Estilo) => string[];
}

export function escritaComSinais(doc: jsPDF): EscritaComSinais {
  /** A largura de um trecho, no tamanho de agora. A Symbol, pela tabela da Adobe. */
  function larguraDoTrecho(t: Trecho, estilo: Estilo): number {
    if (!t.sinal) {
      doc.setFont('helvetica', estilo);
      return doc.getTextWidth(t.texto);
    }
    const milesimos = Array.from(t.texto).reduce((s, c) => s + (LARGURA_NA_SYMBOL[c.charCodeAt(0)] ?? 1000), 0);
    return ((milesimos / 1000) * doc.getFontSize()) / doc.internal.scaleFactor;
  }
  function larguraDe(texto: string, estilo: Estilo): number {
    if (!temSinal(texto)) {
      doc.setFont('helvetica', estilo);
      return doc.getTextWidth(paraAHelvetica(texto));
    }
    const w = trechosDoPdf(texto).reduce((s, t) => s + larguraDoTrecho(t, estilo), 0);
    doc.setFont('helvetica', estilo);
    return w;
  }
  function desenha(texto: string, x: number, y0: number, estilo: Estilo, align?: 'center' | 'right'): void {
    if (!temSinal(texto)) {
      doc.setFont('helvetica', estilo);
      doc.text(paraAHelvetica(texto), x, y0, align ? { align } : undefined);
      return;
    }
    const w = larguraDe(texto, estilo);
    let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    for (const t of trechosDoPdf(texto)) {
      const w = larguraDoTrecho(t, estilo);
      doc.setFont(t.sinal ? 'symbol' : 'helvetica', t.sinal ? 'normal' : estilo);
      doc.text(t.texto, cx, y0);
      cx += w;
    }
    doc.setFont('helvetica', estilo);
  }
  function quebra(texto: string, larguraUtil: number, estilo: Estilo = 'normal'): string[] {
    if (!temSinal(texto)) return doc.splitTextToSize(paraAHelvetica(texto), larguraUtil) as string[];
    const linhas: string[] = [];
    let atual = '';
    for (const palavra of texto.split(' ')) {
      const junto = atual ? `${atual} ${palavra}` : palavra;
      if (larguraDe(junto, estilo) <= larguraUtil) {
        atual = junto;
        continue;
      }
      if (atual) linhas.push(atual);
      // A palavra que sozinha passa da largura é cortada letra a letra.
      atual = '';
      for (const c of palavra) {
        if (atual && larguraDe(atual + c, estilo) > larguraUtil) {
          linhas.push(atual);
          atual = '';
        }
        atual += c;
      }
    }
    linhas.push(atual);
    return linhas;
  }
  return { larguraDe, desenha, quebra };
}

// ---------------------------------------------------------------------------
// As tabelas (jspdf-autotable)
// ---------------------------------------------------------------------------

/**
 * No lugar de cada sinal, enquanto a tabela mede: uma letra da Helvetica tão
 * larga quanto o sinal mais largo da Symbol (1.000 milésimos). A tabela quebra
 * as linhas e acha a altura com ela; o desenho troca de volta.
 */
const NO_LUGAR_DO_SINAL = 'Æ';

const PARAGRAFOS = /\r\n|\r|\n/;

function textoDaCelula(raw: unknown): string | null {
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'content' in raw && typeof (raw as { content: unknown }).content === 'string') {
    return (raw as { content: string }).content;
  }
  return null;
}

/** O parágrafo em unidades: cada letra do texto e o que a tabela mede no lugar dela. */
function unidades(paragrafo: string, semSinal: (c: string) => string): { de: string; medida: string }[] {
  return Array.from(paragrafo, (c) => ({ de: c, medida: temSinal(c) ? NO_LUGAR_DO_SINAL : semSinal(c) }));
}

/**
 * As linhas que a tabela quebrou (com a letra no lugar do sinal), de volta
 * para o texto com os sinais. Cada linha é um pedaço do parágrafo medido, na
 * ordem; a célula que continua na página seguinte traz só as linhas dela.
 */
function linhasComOsSinais(original: string, quebradas: readonly string[], semSinal: (c: string) => string): string[] {
  const paragrafos = original.split(PARAGRAFOS).map((p) => unidades(p, semSinal));
  const voltas: string[] = [];
  let p = 0;
  let desde = 0;
  for (const linha of quebradas) {
    let achou = false;
    for (; p < paragrafos.length; p++, desde = 0) {
      const u = paragrafos[p]!;
      const medido = u.map((x) => x.medida).join('');
      const onde = medido.indexOf(linha, desde);
      if (onde < 0) continue;
      // A posição no texto medido → as unidades (a troca pode ter mais de uma letra).
      let pos = 0;
      let i = 0;
      while (i < u.length && pos < onde) pos += u[i++]!.medida.length;
      let j = i;
      let fim = pos;
      while (j < u.length && fim < onde + linha.length) fim += u[j++]!.medida.length;
      voltas.push(u.slice(i, j).map((x) => x.de).join(''));
      desde = onde + linha.length;
      achou = true;
      break;
    }
    if (!achou) voltas.push(linha);
  }
  return voltas;
}

/**
 * Os ganchos que fazem a tabela escrever pelo mesmo caminho: a célula sem
 * sinal fica como a tabela sempre desenhou (passando por `semSinal`); a com
 * sinal é medida com a letra no lugar e desenhada pelos trechos.
 *
 * `semSinal`: a troca das letras que a Helvetica não tem. As folhas do
 * auditor trocam (`paraAHelvetica`); o PDF da OC não troca nada, para sair
 * igual ao de sempre quando não há sinal.
 */
export function celulasComSinais(
  doc: jsPDF,
  semSinal: (texto: string) => string = (t) => t,
): Pick<UserOptions, 'didParseCell' | 'willDrawCell' | 'didDrawCell'> {
  const escrita = escritaComSinais(doc);
  const aDesenhar = new WeakMap<object, string[]>();
  return {
    didParseCell(data: CellHookData) {
      const original = textoDaCelula(data.cell.raw);
      if (original === null) return;
      data.cell.text = temSinal(original)
        ? original.split(PARAGRAFOS).map((p) => unidades(p, semSinal).map((u) => u.medida).join(''))
        : data.cell.text.map(semSinal);
    },
    willDrawCell(data: CellHookData) {
      const original = textoDaCelula(data.cell.raw);
      if (original === null || !temSinal(original)) return;
      aDesenhar.set(data.cell, linhasComOsSinais(original, data.cell.text, semSinal));
      data.cell.text = [];
    },
    didDrawCell(data: CellHookData) {
      const linhas = aDesenhar.get(data.cell);
      if (!linhas) return;
      const { styles } = data.cell;
      const k = doc.internal.scaleFactor;
      doc.setFontSize(styles.fontSize);
      const cor = styles.textColor;
      if (Array.isArray(cor)) doc.setTextColor(cor[0] as number, cor[1] as number, cor[2] as number);
      else if (typeof cor === 'number') doc.setTextColor(cor);
      const letra = styles.fontSize / k;
      const entre = letra * doc.getLineHeightFactor();
      const pos = data.cell.getTextPos();
      // O mesmo topo que a tabela usa para o texto dela.
      let y = pos.y + letra * (2 - 1.15);
      if (styles.valign === 'middle') y -= (linhas.length / 2) * entre;
      else if (styles.valign === 'bottom') y -= linhas.length * entre;
      const align = styles.halign === 'center' || styles.halign === 'right' ? styles.halign : undefined;
      const estilo: Estilo = styles.fontStyle === 'bold' ? 'bold' : 'normal';
      linhas.forEach((l, i) => escrita.desenha(l, pos.x, y + i * entre, estilo, align));
    },
  };
}
