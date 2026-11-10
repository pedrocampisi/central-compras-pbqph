import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * A moldura (o topo e o menu) na tela estreita. O jsdom não mede tela, então a
 * trava lê as regras.
 *
 * Os dois defeitos medidos no navegador em 2026, a 375 e a 768 (CTO-D579),
 * continuam travados:
 *   - o topo tinha altura presa de 68px. A 375, o título quebrava e passava por
 *     cima da página, e o selo "Banco conectado" saía cortado na borda direita;
 *   - o rodapé do menu estreito (64 px) não cabia o avatar e o botão do tema.
 *
 * Desde a pintura "Dia e noite" (D1034, lote a), o menu estreito de ícones saiu:
 * abaixo de 960 px o menu é a gaveta do pacote (cp-gaveta), que entra pela
 * esquerda com o véu atrás (DESIGN.md §9, peça MenuLateral). De 961 px para
 * cima, o mesmo <aside> é o menu fixo de 272 px, e a gaveta fica desligada.
 */

const semComentario = readFileSync('src/App.module.css', 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
const app = readFileSync('src/App.tsx', 'utf-8');

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

const estreita = bloco(semComentario, '@media (max-width: 960px)');
const larga = bloco(semComentario, '@media (min-width: 961px)');
// A base é o que fica fora dos @media de largura: o que vale em toda tela.
const [primeiro, segundo] = [larga, estreita].sort((a, b) => a.de - b.de) as [typeof larga, typeof estreita];
const base =
  semComentario.slice(0, primeiro.de) + semComentario.slice(primeiro.ate, segundo.de) + semComentario.slice(segundo.ate);
const naBase = regrasDe(base);
const naEstreita = [...naBase, ...regrasDe(estreita.miolo)];
const naLarga = [...naBase, ...regrasDe(larga.miolo)];

describe('D579 — o topo não prende a altura na tela estreita', () => {
  it('a 960px ou menos o topo cresce com o que tem dentro', () => {
    const altura = vale(naEstreita, '.topbar', 'height');
    expect(altura === undefined || altura === 'auto', `height: ${altura}`).toBe(true);
    expect(vale(naEstreita, '.topbar', 'min-height')).toBe('68px');
  });

  it('o selo desce para a linha de baixo quando não cabe', () => {
    expect(vale(naEstreita, '.topbar', 'flex-wrap')).toBe('wrap');
  });

  it('a barra não tem regra de título: o nome da tela saiu dela (CTO-D643)', () => {
    expect(semComentario).not.toContain('.topbarTitle');
  });

  it('fora da tela estreita, o topo segue com 68px presos', () => {
    expect(vale(naLarga, '.topbar', 'height')).toBe('68px');
    expect(vale(naLarga, '.topbar', 'flex-wrap')).toBeUndefined();
  });
});

describe('D1034 — abaixo de 960 px o menu é a gaveta do pacote', () => {
  it('o mesmo <aside> leva as duas peças: o menu (cp-lateral) e a gaveta (cp-gaveta)', () => {
    const aside = app.match(/<aside[\s\S]*?>/)?.[0] ?? '';
    expect(aside).toContain("'cp-lateral'");
    expect(aside).toContain("'cp-gaveta'");
    expect(aside).toContain('id="menu-lateral"');
  });

  it('o botão de três traços abre a gaveta, diz se está aberta e aponta para o menu', () => {
    expect(app).toMatch(/aria-label="Abrir o menu"[\s\S]{0,200}aria-expanded=\{menuAberto\}[\s\S]{0,80}aria-controls="menu-lateral"/);
    expect(vale(naBase, '.abrirMenu', 'display')).toBe('none');
    expect(vale(naEstreita, '.abrirMenu', 'display')).toBe('grid');
  });

  it('com a gaveta aberta, o resto da tela sai do alcance do teclado (DESIGN.md §14)', () => {
    expect(app).toContain('inert={menuAberto}');
  });

  it('de 961 px para cima a gaveta fica desligada: o menu fixo de 272 px, sempre à vista', () => {
    expect(vale(naLarga, '.sidebar', 'position')).toBe('relative');
    expect(vale(naLarga, '.sidebar', 'transform')).toBe('none');
    expect(vale(naLarga, '.sidebar', 'visibility')).toBe('visible');
    expect(vale(naLarga, '.sidebar', 'width')).toBe('272px');
  });

  it('a 375 a gaveta tem largura para o avatar, o nome e o botão de sair numa linha', () => {
    expect(vale(naEstreita, '.sidebar', 'width')).toBe('min(300px, 86vw)');
    const gaveta = Math.min(300, 0.86 * 375);
    const porDentro = gaveta - 2 * 16 - 2 * 10; // o respiro do cp-lateral e o do cp-usuario
    const precisa = 40 + 12 + 44 + 12 + 60; // iniciais, vão, sair, vão e o mínimo do nome
    expect(precisa).toBeLessThanOrEqual(porDentro);
  });
});

describe('D1034a — o selo do alto não diz "conectado" quando a carga falhou', () => {
  it('com erro nos dados o selo é o de erro; sem erro, o de pronto', () => {
    expect(app).toMatch(/erroDados \? \(\s*<span className="cp-selo cp-selo--erro">Dados não carregaram<\/span>\s*\) : \(\s*<span className="cp-selo cp-selo--pronto">Banco conectado<\/span>/);
  });
});
