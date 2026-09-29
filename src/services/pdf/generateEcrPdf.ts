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
 * A mesma biblioteca do PDF da OC (jsPDF), com as fontes padrão dela: a
 * Helvetica e, para os sinais (≥, ≤…), a Symbol (`domain/letrasDoPdf`).
 *
 * Quando o histórico passa do teto do rodapé (perícia de 27/09, achado 7), o
 * rodapé mostra as últimas revisões que cabem e diz onde estão as outras; o
 * histórico inteiro vai em páginas próprias, no fim.
 */

import jsPDF from 'jspdf';
import type { Ecr, EcrItem } from '../../domain/types';
import {
  CABECALHO_DO_PDF,
  COLUNAS_DO_HISTORICO,
  NENHUMA_REVISAO,
  SEM_HISTORICO,
  SEM_TEXTO,
  TITULO_DO_HISTORICO,
  blocosDaSecao,
  linhaDoHistorico,
  nomeDoPdfDaEcr,
  notaDoRodape,
  numeroDaSecao,
} from '../../domain/ecr';
import { LARGURA_NA_SYMBOL, paraAHelvetica, temSinal, trechosDoPdf, type Trecho } from '../../domain/letrasDoPdf';
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
/**
 * O teto da tabela de revisões no rodapé (achado 7). Cabem a cabeça e dez
 * revisões de uma linha, ou uma com a descrição no tamanho máximo (500).
 * Até aí, o PDF é o de sempre.
 */
const TETO_DO_RODAPE = 60;

const AZUL: [number, number, number] = [11, 105, 183]; // o mesmo traço do PDF da OC
const VERMELHO: [number, number, number] = [255, 0, 0]; // o destaque das notas no documento

interface Pedaco {
  texto: string;
  negrito: boolean;
}

type Estilo = 'normal' | 'bold';

/** As palavras de uma linha, com o rótulo em negrito ("Lote:" + o texto). */
function palavrasDoItem(item: EcrItem, tudoNegrito: boolean): Pedaco[] {
  const pedacos: Pedaco[] = [];
  if (item.rotulo) {
    for (const p of `${item.rotulo}:`.split(' ')) pedacos.push({ texto: p, negrito: true });
  }
  for (const p of item.texto.split(' ')) pedacos.push({ texto: p, negrito: tudoNegrito });
  return pedacos;
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

  // ── Os sinais: o texto sem sinal é desenhado como sempre foi ──
  /** A largura de um trecho, no tamanho de agora. A Symbol, pela tabela da Adobe. */
  function larguraDoTrecho(t: Trecho, estilo: Estilo): number {
    if (!t.sinal) {
      doc.setFont('helvetica', estilo);
      return doc.getTextWidth(t.texto);
    }
    const milesimos = Array.from(t.texto).reduce((s, c) => s + (LARGURA_NA_SYMBOL[c.charCodeAt(0)] ?? 1000), 0);
    return ((milesimos / 1000) * doc.getFontSize()) / doc.internal.scaleFactor;
  }
  /** A largura de um texto no tamanho de agora, com os sinais na Symbol. */
  function larguraDe(texto: string, estilo: Estilo): number {
    if (!temSinal(texto)) {
      doc.setFont('helvetica', estilo);
      return doc.getTextWidth(paraAHelvetica(texto));
    }
    const w = trechosDoPdf(texto).reduce((s, t) => s + larguraDoTrecho(t, estilo), 0);
    doc.setFont('helvetica', estilo);
    return w;
  }
  /** Escreve um texto. Sem sinal, é a mesma chamada de antes: o PDF sai igual. */
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
  /** As linhas de uma célula. Sem sinal, a quebra de sempre; com sinal, palavra por palavra. */
  function quebra(texto: string, larguraUtil: number): string[] {
    if (!temSinal(texto)) return doc.splitTextToSize(paraAHelvetica(texto), larguraUtil) as string[];
    const linhas: string[] = [];
    let atual = '';
    for (const palavra of texto.split(' ')) {
      const junto = atual ? `${atual} ${palavra}` : palavra;
      if (larguraDe(junto, 'normal') <= larguraUtil) {
        atual = junto;
        continue;
      }
      if (atual) linhas.push(atual);
      // A palavra que sozinha passa da largura é cortada letra a letra.
      atual = '';
      for (const c of palavra) {
        if (atual && larguraDe(atual + c, 'normal') > larguraUtil) {
          linhas.push(atual);
          atual = '';
        }
        atual += c;
      }
    }
    linhas.push(atual);
    return linhas;
  }

  // ── A tabela de revisões: medida antes, porque ela marca o fim do texto ──
  doc.setFontSize(FONTE_DA_TABELA);
  const cabecaDaTabela = COLUNAS_DO_HISTORICO.map((c, i) => doc.splitTextToSize(c, LARGURAS[i]! - 2) as string[]);
  const revisoes = ecr.revisoes && ecr.revisoes.length > 0 ? ecr.revisoes : null;
  const linhasDaTabela: string[][][] = revisoes
    ? revisoes.map((r) => linhaDoHistorico(r).map((c, i) => quebra(c, LARGURAS[i]! - 2)))
    : [[doc.splitTextToSize(ecr.revisoes ? NENHUMA_REVISAO : SEM_HISTORICO, largura - 2) as string[]]];
  const alturaDaLinha = (celulas: string[][]) =>
    Math.max(...celulas.map((c) => c.length)) * LINHA_DA_TABELA + 2;
  const alturaDe = (linhas: string[][][]) =>
    alturaDaLinha(cabecaDaTabela) + linhas.reduce((s, l) => s + alturaDaLinha(l), 0);

  // O rodapé tem teto (achado 7): passou dele, ficam as últimas revisões que
  // cabem, com a linha que diz onde estão as outras.
  let noRodape = linhasDaTabela;
  let escondidas = 0;
  if (revisoes && alturaDe(linhasDaTabela) > TETO_DO_RODAPE) {
    const nota = (k: number) => [doc.splitTextToSize(notaDoRodape(revisoes, k), largura - 2) as string[]];
    escondidas = revisoes.length;
    for (let k = 1; k < revisoes.length; k += 1) {
      if (alturaDe([nota(k), ...linhasDaTabela.slice(k)]) <= TETO_DO_RODAPE) {
        escondidas = k;
        break;
      }
    }
    noRodape = [nota(escondidas), ...linhasDaTabela.slice(escondidas)];
  }
  const alturaDaTabela = alturaDe(noRodape);
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
    const larguraDoPedaco = (p: Pedaco) => larguraDe(p.texto, p.negrito ? 'bold' : 'normal');
    doc.setFont('helvetica', 'normal');
    const espaco = doc.getTextWidth(' ');
    const linhas: Pedaco[][] = [[]];
    let usada = 0;
    for (const p of pedacos) {
      const atual = linhas[linhas.length - 1]!;
      const w = larguraDoPedaco(p);
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
        desenha(p.texto, cx, y, p.negrito ? 'bold' : 'normal');
        cx += larguraDoPedaco(p);
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
      doc.setFontSize(10);
      desenha(`${numeroDaSecao(i)} ${secao.titulo}`, MARGEM, y, 'bold');
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

  // ── Uma linha da tabela de revisões, com o topo em `ty`; devolve a altura ──
  const desenhaLinha = (celulas: string[][], negrito: boolean, fundo: boolean, ty: number): number => {
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
      if (!linhas.some(temSinal)) {
        doc.text(linhas, tx + w / 2, ty + 3.4, { align: 'center' });
      } else {
        const entre = doc.getLineHeight() / doc.internal.scaleFactor;
        linhas.forEach((l, k) => desenha(l, tx + w / 2, ty + 3.4 + k * entre, negrito ? 'bold' : 'normal', 'center'));
      }
      tx += w;
    });
    return h;
  };

  // ── O histórico inteiro, em páginas próprias, quando não cabe no rodapé ──
  let primeiraDoHistorico = Number.POSITIVE_INFINITY;
  if (escondidas > 0) {
    doc.addPage();
    primeiraDoHistorico = doc.getNumberOfPages();
    y = TOPO_DO_TEXTO;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(TITULO_DO_HISTORICO, MARGEM, y);
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(MARGEM, y + 1.8, pw - MARGEM, y + 1.8);
    y += 7.5;
    doc.setDrawColor(120);
    doc.setLineWidth(0.2);
    doc.setFontSize(FONTE_DA_TABELA);
    y += desenhaLinha(cabecaDaTabela, true, true, y);
    for (const l of linhasDaTabela) {
      // A cabeça se repete no alto de cada página do histórico.
      if (y + alturaDaLinha(l) > ph - PE) {
        doc.addPage();
        y = TOPO_DO_TEXTO;
        y += desenhaLinha(cabecaDaTabela, true, true, y);
      }
      y += desenhaLinha(l, false, false, y);
    }
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
    desenha(ecr.codigo, pw - MARGEM, 15, 'bold', 'right');
    doc.setFontSize(8.5);
    desenha(ecr.nome.toUpperCase(), pw / 2, 20.5, 'normal', 'center');
    doc.text(`Rev.: ${ecr.revisao ?? '—'}`, pw - MARGEM, 19.5, { align: 'right' });
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.4);
    doc.line(MARGEM, 29, pw - MARGEM, 29);

    // A tabela: a cabeça em cinza, as linhas centradas, como no documento.
    // Nas páginas do histórico inteiro, ela não se repete no rodapé.
    if (pagina < primeiraDoHistorico) {
      doc.setDrawColor(120);
      doc.setLineWidth(0.2);
      doc.setFontSize(FONTE_DA_TABELA);
      let ty = topoDaTabela;
      ty += desenhaLinha(cabecaDaTabela, true, true, ty);
      for (const l of noRodape) ty += desenhaLinha(l, false, false, ty);
    }

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
