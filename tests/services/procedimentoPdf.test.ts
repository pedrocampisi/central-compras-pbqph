/**
 * CTO-D730 §3.2 — o PDF do procedimento, pela impressão do próprio HTML do SGQ
 * (resposta (c) do CTO): o cabeçalho, os seis campos, o "Como usar", as seções
 * 1 a 7 com o histórico; sem o fluxo didático, sem o sumário e sem os "?". O
 * teste lê o texto de dentro do PDF, página por página, sem baixar nada.
 */
import { describe, expect, it } from 'vitest';
import type jsPDF from 'jspdf';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { desenhaPdfDoProcedimento, palavrasDe } from '../../src/services/pdf/generateProcedimentoPdf';
import { textoSimples, type Procedimento } from '../../src/domain/procedimento';
import { ps02Rev00 } from '../fixtures/ps02Rev00';

/** Os textos desenhados numa página, na ordem, juntos por espaço. */
function textoDaPagina(doc: jsPDF, pagina: number): string {
  const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[pagina]!.join('\n');
  return [...conteudo.matchAll(/\(((?:\\.|[^\\)])*)\) Tj/g)].map((m) => m[1]!.replace(/\\(.)/g, '$1')).join(' ');
}

function textoTodo(doc: jsPDF): string {
  return Array.from({ length: doc.getNumberOfPages() }, (_, i) => textoDaPagina(doc, i + 1)).join(' ');
}

/** Como a Helvetica do PDF grava as letras de fora do Latin-1 (a tabela do Windows). */
const CP1252: Record<string, string> = { '—': '\x97', '–': '\x96', '“': '\x93', '”': '\x94' };
/** A frase como fica dentro do PDF, sem os espaços (cada palavra é desenhada à parte). */
const noPdf = (s: string) => s.replace(/[—–“”]/g, (c) => CP1252[c]!).replace(/\s+/g, '');

const p = ps02Rev00();
const doc = desenhaPdfDoProcedimento(p, null);
const todo = noPdf(textoTodo(doc));

/** O texto do corpo do documento: o que a impressão do HTML mostra. */
function textosDoCorpo(x: Procedimento): string[] {
  const out = [x.sobretitulo, x.responsavel, x.referencia, x.escopo, textoSimples(x.comoUsar)];
  for (const s of x.secoes) {
    out.push(s.titulo, s.selo);
    for (const b of s.blocos) {
      if (b.tipo === 'paragrafo') out.push(textoSimples(b.texto));
      if (b.tipo === 'quadros') for (const q of b.quadros) out.push(q.titulo, q.texto);
      if (b.tipo === 'lista') for (const i of b.itens) out.push(i.texto);
      if (b.tipo === 'tabela') {
        out.push(...b.colunas);
        for (const l of b.linhas) out.push(...l.celulas.map(textoSimples));
      }
    }
  }
  return out;
}

describe('D730 — o PDF do PS.02', () => {
  it('cada texto do corpo está no PDF, palavra por palavra (o "≥" sai pela Symbol)', () => {
    const faltam = textosDoCorpo(p)
      .map((t) => t.replace(/≥/g, ''))
      .filter((t) => !todo.includes(noPdf(t)));
    expect(faltam).toEqual([]);
  });

  it('no alto de toda página: o título, o subtítulo, o código e a revisão; no pé, o rodapé e o número', () => {
    const n = doc.getNumberOfPages();
    expect(n).toBeGreaterThan(1);
    for (let i = 1; i <= n; i += 1) {
      const pagina = noPdf(textoDaPagina(doc, i));
      expect(pagina).toContain(noPdf(p.titulo));
      expect(pagina).toContain(noPdf(p.subtitulo));
      expect(pagina).toContain('Rev.:00');
      expect(pagina).toContain(noPdf(`${p.rodape!.titulo} · ${p.rodape!.texto}`));
      expect(pagina).toContain(`Página${i}de${n}`);
    }
  });

  it('as 7 seções, na ordem, com o número', () => {
    const posicoes = p.secoes.map((s) => todo.indexOf(noPdf(`${s.numero} ${s.titulo}`)));
    expect(posicoes.every((x) => x >= 0)).toBe(true);
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
  });

  it('o histórico: as colunas do documento e a revisão', () => {
    for (const c of ['Revisão', 'Data', 'Descrição', 'Resp. revisão', 'Análise crítica / aprovação']) expect(todo).toContain(noPdf(c));
    expect(todo).toContain(noPdf('00 31/08/2026 Emissão inicial. Revisor de teste Aprovador de teste'));
  });

  it('a lista dos laboratórios numerada de 1 a 6, como o documento sai impresso', () => {
    p.secoes[4]!.blocos
      .flatMap((b) => (b.tipo === 'lista' ? b.itens : []))
      .forEach((it, i) => expect(todo).toContain(noPdf(`${i + 1}. ${it.texto}`)));
  });

  it('o que a impressão do HTML esconde não entra: o fluxo, o sumário e os "?"', () => {
    expect(todo).not.toContain(noPdf(p.fluxo.titulo));
    for (const c of p.fluxo.cartoes) expect(todo).not.toContain(noPdf(c.texto));
    expect(todo).not.toContain(noPdf(p.fluxo.sequencia[0]!.texto));
    expect(todo).not.toContain('Sumário');
    for (const s of p.secoes) expect(todo).not.toContain(noPdf(s.ajuda));
  });

  it('o "item 6" fica como o documento diz', () => {
    expect(todo).toContain(noPdf('Aplicar os critérios específicos do item 6 deste procedimento.'));
  });

  it('o negrito encosta onde o documento encosta: "adquirido" e o ponto', () => {
    const ws = palavrasDe(p.comoUsar);
    const i = ws.findIndex((w) => w.texto === 'adquirido');
    expect(ws[i]!.negrito).toBe(true);
    expect(ws[i + 1]).toEqual({ texto: '.', negrito: false, espaco: false });
    expect(ws[i - 1]).toMatchObject({ texto: 'sendo', negrito: true, espaco: true });
  });

  it('com a marca de verdade, o PDF fica leve (a marca vai comprimida)', () => {
    const png = readFileSync(join(__dirname, '../../public/brazao1.png'));
    const logo = `data:image/png;base64,${png.toString('base64')}`;
    const tamanho = desenhaPdfDoProcedimento(p, logo).output('arraybuffer').byteLength;
    expect(tamanho).toBeLessThan(300 * 1024);
  });
});
