import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * A moldura (o topo e o menu) na tela estreita (CTO-D579). O jsdom não mede
 * tela, então a trava lê as regras que causaram os dois defeitos medidos no
 * navegador, a 375 e a 768:
 *
 *   - o topo tinha altura presa de 68px. A 375, o título "Nova Ordem de Compra"
 *     quebrava em quatro linhas e passava por cima do título da página; no
 *     Dashboard, o selo "Banco conectado" saía cortado na borda direita;
 *   - o rodapé do menu punha o avatar e o botão do tema lado a lado (32 + 10 +
 *     34 = 76px) num menu de 44px por dentro. A fila centrada passava dos dois
 *     lados e o avatar saía cortado pela esquerda — sem rolagem, calado.
 *
 * O conserto mora só na regra da tela estreita: a 1280 e a 1920 nada muda.
 */

const semComentario = readFileSync('src/App.module.css', 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

/** O miolo de um `@media (...)`, pelas chaves. */
function bloco(css: string, cabeca: string) {
  const i = css.indexOf(cabeca);
  if (i < 0) throw new Error(`${cabeca} não encontrado`);
  const abre = css.indexOf('{', i);
  let fundo = 0;
  for (let j = abre; j < css.length; j++) {
    if (css[j] === '{') fundo++;
    else if (css[j] === '}' && --fundo === 0) return { de: i, ate: j + 1, miolo: css.slice(abre + 1, j) };
  }
  throw new Error(`${cabeca} sem fim`);
}

const estreita = bloco(semComentario, '@media (max-width: 900px)');
const maisEstreita = bloco(semComentario, '@media (max-width: 700px)');
const base = [estreita, maisEstreita]
  .sort((a, b) => b.de - a.de)
  .reduce((css, b) => css.slice(0, b.de) + css.slice(b.ate), semComentario);

type Regra = { seletores: string[]; corpo: string };
const regrasDe = (css: string): Regra[] =>
  [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({
    seletores: m[1]!.split(',').map((s) => s.trim()),
    corpo: m[2]!,
  }));
const valor = (corpo: string, prop: string) =>
  corpo.match(new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;]+)`))?.[1]?.trim();

/** O valor que vale para `seletor`: a última regra que o nomeia e diz a propriedade. */
function vale(regras: Regra[], seletor: string, prop: string) {
  let achado: string | undefined;
  for (const r of regras) if (r.seletores.includes(seletor)) achado = valor(r.corpo, prop) ?? achado;
  return achado;
}
const px = (v: string | undefined) => {
  const m = v?.match(/^(-?\d+(?:\.\d+)?)(px)?$/);
  if (!m) throw new Error(`não é medida em px: ${v}`);
  return Number(m[1]);
};

/** Respiro horizontal (esquerda + direita), com o atalho `padding` e os lados por cima. */
function respiroDeLado(regrasEmOrdem: Regra[], seletor: string) {
  let esq = 0;
  let dir = 0;
  for (const r of regrasEmOrdem) {
    if (!r.seletores.includes(seletor)) continue;
    const atalho = valor(r.corpo, 'padding')?.split(/\s+/);
    if (atalho) {
      const [, d = atalho[0], , e = d] = atalho;
      dir = px(d);
      esq = px(e);
    }
    const pe = valor(r.corpo, 'padding-left');
    const pd = valor(r.corpo, 'padding-right');
    if (pe) esq = px(pe);
    if (pd) dir = px(pd);
  }
  return esq + dir;
}

const naBase = regrasDe(base);
const naEstreita = [...naBase, ...regrasDe(estreita.miolo)];
const naMaisEstreita = [...naEstreita, ...regrasDe(maisEstreita.miolo)];

describe('D579 — o topo não prende a altura na tela estreita', () => {
  it('a 900px ou menos o topo cresce com o que tem dentro', () => {
    const altura = vale(naEstreita, '.topbar', 'height');
    expect(altura === undefined || altura === 'auto', `height: ${altura}`).toBe(true);
    expect(vale(naEstreita, '.topbar', 'min-height')).toBe('68px');
  });

  it('o selo desce para a linha de baixo quando não cabe', () => {
    expect(vale(naEstreita, '.topbar', 'flex-wrap')).toBe('wrap');
  });

  it('a 700px ou menos o título diminui', () => {
    expect(px(vale(naMaisEstreita, '.topbarTitle', 'font-size'))).toBeLessThan(
      px(vale(naBase, '.topbarTitle', 'font-size')),
    );
  });
});

describe('D579 — o avatar cabe no menu estreito', () => {
  const lateral = px(vale(naEstreita, '.sidebar', 'width'));
  const porDentro = lateral - respiroDeLado(naEstreita, '.sidebar') - respiroDeLado(naEstreita, '.sidebarFooter');
  const avatar = px(vale(naEstreita, '.avatar', 'width'));
  const tema = px(vale(naEstreita, '.temaBtn', 'width'));

  it('o avatar e o botão do tema cabem, um em cima do outro ou lado a lado', () => {
    const coluna = vale(naEstreita, '.sfIdentidade', 'flex-direction') === 'column';
    const precisa = coluna ? Math.max(avatar, tema) : avatar + px(vale(naEstreita, '.sfIdentidade', 'gap')) + tema;
    expect(precisa, `${coluna ? 'coluna' : 'fila'} de ${precisa}px num rodapé de ${porDentro}px`).toBeLessThanOrEqual(
      porDentro,
    );
  });
});

describe('D579 — a 1280 e a 1920 nada muda', () => {
  it('fora da tela estreita, o topo segue com 68px presos e o rodapé do menu em fila', () => {
    expect(vale(naBase, '.topbar', 'height')).toBe('68px');
    expect(vale(naBase, '.topbar', 'flex-wrap')).toBeUndefined();
    expect(vale(naBase, '.sfIdentidade', 'flex-direction')).toBeUndefined();
    expect(vale(naBase, '.topbarTitle', 'font-size')).toBe('26px');
  });
});
