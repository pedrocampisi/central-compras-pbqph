/**
 * O PDF do procedimento (CTO-D730 §3.2: "parecido com o documento, como o da
 * ECR"). Segue a impressão do próprio HTML do SGQ (resposta (c) do CTO): o
 * papel que o SGQ desenhou para o documento formal, sem o fluxo didático, sem
 * o sumário e sem os "?". A página mostra tudo; o PDF é o documento.
 *
 * - No alto de toda página: a marca, o título, o subtítulo, o código e "Rev.: 00".
 * - Na primeira: a linha de cima, os seis campos do cabeçalho e o "Como usar".
 * - As seções 1 a 7 com o selo, os blocos na ordem e o negrito do documento;
 *   o histórico de revisões é a tabela da seção 7.
 * - No pé de toda página: o rodapé do documento e "Página N de M".
 *
 * A mesma biblioteca e o mesmo caminho dos sinais ("≥") dos outros PDFs da casa.
 */

import jsPDF from 'jspdf';
import {
  CAMPOS_DO_CABECALHO,
  COLUNAS_DAS_REVISOES,
  NENHUMA_REVISAO,
  SEM_REVISOES,
  linhaDaRevisao,
  nomeDoPdfDoProcedimento,
  type Bloco,
  type Procedimento,
  type TextoRico,
} from '../../domain/procedimento';
import { formatDate } from '../../domain/format';
import { escritaComSinais } from './textoComSinais';
import { loadCampisiLogo } from './generateOcPdf';
import { downloadBlob } from '../storage/download';

// ── Medidas (mm) ──────────────────────────────────────────────────────────────

const MARGEM = 18;
const TOPO_DO_TEXTO = 36;
const FIM_DO_TEXTO = 297 - 20;
const FONTE = 9.5;
const LINHA = 4.6;
const FONTE_MIUDA = 8;
const LINHA_MIUDA = 3.9;
const FONTE_DA_TABELA = 8;
const LINHA_DA_TABELA = 3.6;

/** As colunas das tabelas de três colunas e a do histórico, somando a largura útil (174). */
const TRES_COLUNAS = [40, 58, 76];
const COLUNAS_DO_HISTORICO = [16, 22, 56, 40, 40];

const AZUL: [number, number, number] = [11, 105, 183]; // o mesmo traço dos outros PDFs da casa

interface Palavra {
  texto: string;
  negrito: boolean;
  /** Se há espaço antes dela no documento ("negrito" + "." encostam). */
  espaco: boolean;
}

/** A frase em palavras, guardando o negrito e onde o documento põe espaço. */
export function palavrasDe(texto: TextoRico): Palavra[] {
  const out: Palavra[] = [];
  let espacoPendente = false;
  for (const trecho of texto) {
    for (const parte of trecho.texto.split(/(\s+)/)) {
      if (parte === '') continue;
      if (/^\s+$/.test(parte)) {
        espacoPendente = true;
        continue;
      }
      out.push({ texto: parte, negrito: trecho.negrito, espaco: espacoPendente && out.length > 0 });
      espacoPendente = false;
    }
  }
  return out;
}

const simples = (texto: string, negrito = false): TextoRico => [{ texto, negrito }];

/** Desenha o PDF e devolve o documento (o teste lê o texto dele sem baixar). */
export function desenhaPdfDoProcedimento(p: Procedimento, logo: string | null): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const largura = pw - 2 * MARGEM;
  const { larguraDe, desenha } = escritaComSinais(doc);

  let y = TOPO_DO_TEXTO;
  function novaPagina(): void {
    doc.addPage();
    y = TOPO_DO_TEXTO;
  }
  function cabe(altura: number): void {
    if (y + altura > FIM_DO_TEXTO) novaPagina();
  }

  /** As linhas da frase na largura, palavra por palavra, com o negrito de cada uma. */
  function linhasDe(texto: TextoRico, larguraUtil: number, tamanho: number): Palavra[][] {
    doc.setFontSize(tamanho);
    doc.setFont('helvetica', 'normal');
    const espaco = doc.getTextWidth(' ');
    const linhas: Palavra[][] = [[]];
    let usada = 0;
    for (const w of palavrasDe(texto)) {
      const atual = linhas[linhas.length - 1]!;
      const lw = larguraDe(w.texto, w.negrito ? 'bold' : 'normal');
      const antes = atual.length > 0 && w.espaco ? espaco : 0;
      if (atual.length > 0 && usada + antes + lw > larguraUtil) {
        linhas.push([w]);
        usada = lw;
      } else {
        atual.push(w);
        usada += antes + lw;
      }
    }
    return linhas;
  }

  function desenhaLinha(linha: Palavra[], x: number, yy: number, tamanho: number): void {
    doc.setFontSize(tamanho);
    doc.setFont('helvetica', 'normal');
    const espaco = doc.getTextWidth(' ');
    let cx = x;
    linha.forEach((w, i) => {
      if (i > 0 && w.espaco) cx += espaco;
      desenha(w.texto, cx, yy, w.negrito ? 'bold' : 'normal');
      cx += larguraDe(w.texto, w.negrito ? 'bold' : 'normal');
    });
  }

  /** Um parágrafo; `barra` desenha o traço do destaque à esquerda de cada linha. */
  function paragrafo(texto: TextoRico, opcoes: { recuo?: number; tamanho?: number; barra?: boolean } = {}): void {
    const tamanho = opcoes.tamanho ?? FONTE;
    const entre = tamanho === FONTE ? LINHA : LINHA_MIUDA;
    const recuo = opcoes.recuo ?? 0;
    for (const linha of linhasDe(texto, largura - recuo, tamanho)) {
      cabe(entre);
      if (opcoes.barra) {
        doc.setFillColor(120, 120, 120);
        doc.rect(MARGEM, y - 3.4, 0.9, entre, 'F');
      }
      desenhaLinha(linha, MARGEM + recuo, y, tamanho);
      y += entre;
    }
    y += 2.4;
  }

  /** Uma tabela: a cabeça em cinza, que se repete no alto da página nova. */
  function tabela(colunas: readonly string[], linhas: TextoRico[][], larguras: readonly number[]): void {
    const celulas = (row: TextoRico[], negrito: boolean) =>
      row.map((c, i) =>
        linhasDe(negrito ? c.map((t) => ({ ...t, negrito: true })) : c, larguras[i]! - 3, FONTE_DA_TABELA),
      );
    const altura = (cs: Palavra[][][]) => Math.max(...cs.map((c) => c.length)) * LINHA_DA_TABELA + 2.4;
    const linhaDaTabela = (cs: Palavra[][][], fundo: boolean) => {
      const h = altura(cs);
      let x = MARGEM;
      doc.setDrawColor(120);
      doc.setLineWidth(0.2);
      cs.forEach((linhasDaCelula, i) => {
        const w = larguras[i]!;
        if (fundo) {
          doc.setFillColor(235, 235, 235);
          doc.rect(x, y, w, h, 'FD');
        } else {
          doc.rect(x, y, w, h);
        }
        linhasDaCelula.forEach((l, k) => desenhaLinha(l, x + 1.5, y + 3.4 + k * LINHA_DA_TABELA, FONTE_DA_TABELA));
        x += w;
      });
      y += h;
    };
    const cabeca = celulas(colunas.map((c) => simples(c)), true);
    cabe(altura(cabeca) + LINHA_DA_TABELA * 2);
    linhaDaTabela(cabeca, true);
    for (const row of linhas) {
      const cs = celulas(row, false);
      if (y + altura(cs) > FIM_DO_TEXTO) {
        novaPagina();
        linhaDaTabela(cabeca, true);
      }
      linhaDaTabela(cs, false);
    }
    y += 4.5; // o traço do destaque que vem depois não encosta na tabela
  }

  function bloco(b: Bloco): void {
    switch (b.tipo) {
      case 'paragrafo':
        if (b.destaque === 'miudo') paragrafo(b.texto, { tamanho: FONTE_MIUDA });
        else paragrafo(b.texto, { recuo: b.destaque ? 3.5 : 0, barra: !!b.destaque });
        return;
      case 'quadros':
        for (const q of b.quadros) {
          cabe(LINHA * 2);
          paragrafo(simples(q.titulo, true), { recuo: 3.5, barra: true });
          y -= 2.4;
          paragrafo(simples(q.texto), { recuo: 3.5, barra: true });
        }
        return;
      case 'lista':
        b.itens.forEach((it, i) => {
          const linhas = linhasDe(simples(it.texto), largura - 7, FONTE);
          linhas.forEach((l, k) => {
            cabe(LINHA);
            if (k === 0) desenha(`${i + 1}.`, MARGEM + 2, y, 'normal');
            desenhaLinha(l, MARGEM + 7, y, FONTE);
            y += LINHA;
          });
          y += 0.8;
        });
        y += 1.6;
        return;
      case 'tabela':
        tabela(b.colunas, b.linhas.map((l) => l.celulas), b.colunas.length === 3 ? TRES_COLUNAS : b.colunas.map(() => largura / b.colunas.length));
        return;
      case 'historico':
        if (!p.revisoes || p.revisoes.length === 0) paragrafo(simples(p.revisoes ? NENHUMA_REVISAO : SEM_REVISOES));
        else tabela(COLUNAS_DAS_REVISOES, p.revisoes.map((r) => linhaDaRevisao(r).map((c) => simples(c))), COLUNAS_DO_HISTORICO);
        return;
    }
  }

  // ── A primeira página: a linha de cima, os seis campos e o "Como usar" ──
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7.5);
  desenha(p.sobretitulo, MARGEM, y, 'bold');
  y += 4;
  const campos: [string, string][] = [
    [CAMPOS_DO_CABECALHO.codigo, p.codigo],
    [CAMPOS_DO_CABECALHO.revisao, p.situacao ? `Rev. ${p.revisao} · ${p.situacao}` : `Rev. ${p.revisao}`],
    [CAMPOS_DO_CABECALHO.data, formatDate(p.data)],
    [CAMPOS_DO_CABECALHO.responsavel, p.responsavel],
    [CAMPOS_DO_CABECALHO.referencia, p.referencia],
    [CAMPOS_DO_CABECALHO.escopo, p.escopo],
  ];
  const larguraDoCampo = largura / 3;
  for (let linha = 0; linha < 2; linha += 1) {
    const daLinha = campos.slice(linha * 3, linha * 3 + 3);
    const valores = daLinha.map(([, v]) => linhasDe(simples(v, true), larguraDoCampo - 4, FONTE));
    const h = 8 + Math.max(...valores.map((v) => v.length)) * LINHA;
    daLinha.forEach(([rotulo], i) => {
      const x = MARGEM + i * larguraDoCampo;
      doc.setDrawColor(120);
      doc.setLineWidth(0.2);
      doc.rect(x, y, larguraDoCampo, h);
      doc.setFontSize(7);
      desenha(rotulo, x + 2, y + 3.6, 'normal');
      valores[i]!.forEach((l, k) => desenhaLinha(l, x + 2, y + 8 + k * LINHA, FONTE));
    });
    y += h;
  }
  y += 5;
  paragrafo(p.comoUsar, { recuo: 3.5, barra: true });
  y += 2;

  // ── As seções ──
  for (const s of p.secoes) {
    cabe(LINHA * 4); // o título nunca fica sozinho no fim da página
    doc.setFontSize(11);
    desenha(`${s.numero}  ${s.titulo}`, MARGEM, y, 'bold');
    if (s.selo) {
      doc.setFontSize(7.5);
      desenha(s.selo, pw - MARGEM, y, 'normal', 'right');
    }
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(MARGEM, y + 1.8, pw - MARGEM, y + 1.8);
    y += 7.5;
    for (const b of s.blocos) bloco(b);
    y += 3;
  }

  // ── Cabeçalho, rodapé e número, em toda página ──
  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setTextColor(0, 0, 0);
    if (logo) {
      try {
        // Comprimida ('FAST'), como a da ECR: sem isso, a marca crua passa de 4 MB.
        doc.addImage(logo, 'PNG', MARGEM, 10, 16, 14.4, 'marca', 'FAST');
      } catch {
        /* a marca é enfeite; sem ela, o PDF sai do mesmo jeito */
      }
    }
    doc.setFontSize(10);
    desenha(p.titulo, pw / 2, 16, 'bold', 'center');
    doc.setFontSize(8);
    desenha(p.subtitulo, pw / 2, 21, 'normal', 'center');
    doc.setFontSize(9.5);
    desenha(p.codigo, pw - MARGEM, 15, 'bold', 'right');
    doc.setFontSize(8.5);
    desenha(`Rev.: ${p.revisao}`, pw - MARGEM, 19.5, 'normal', 'right');
    doc.setDrawColor(...AZUL);
    doc.setLineWidth(0.4);
    doc.line(MARGEM, 29, pw - MARGEM, 29);

    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    if (p.rodape) desenha(`${p.rodape.titulo} · ${p.rodape.texto}`, MARGEM, ph - 10, 'normal');
    desenha(`Página ${pagina} de ${paginas}`, pw - MARGEM, ph - 10, 'normal', 'right');
    doc.setTextColor(0, 0, 0);
  }

  return doc;
}

/** O PDF como arquivo. */
export async function generateProcedimentoPdfBlob(p: Procedimento): Promise<Blob> {
  return desenhaPdfDoProcedimento(p, await loadCampisiLogo()).output('blob');
}

/** Gera e baixa: "PS.02 - Aquisição & Qualificação de Fornecedores - Rev 00.pdf". */
export async function baixarPdfDoProcedimento(p: Procedimento): Promise<void> {
  downloadBlob(await generateProcedimentoPdfBlob(p), nomeDoPdfDoProcedimento(p));
}
