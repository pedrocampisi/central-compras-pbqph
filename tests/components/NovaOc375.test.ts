import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * A Nova OC a 375px (CTO-D555). O jsdom não mede tela, então a trava lê as
 * regras que causaram o defeito medido no navegador:
 *
 *   - o Totais tinha `min-width: 320px`, e a 375px o conteúdo tem 271px (medido:
 *     lateral de 64, respiro de 20 de cada lado). Alinhado à direita, passava
 *     49px para a esquerda, por baixo da lateral, e cortava os sete rótulos;
 *   - o rodapé (Cancelar, Visualizar PDF, Salvar Rascunho, Emitir) era uma fila
 *     alinhada à direita sem quebra: três botões ficavam fora da tela.
 *
 * Transbordo para a ESQUERDA não gera rolagem — some calado. Por isso a regra
 * é geral: fila alinhada à direita quebra linha.
 */

const CONTEUDO_A_375 = 271;
const css = readFileSync('src/features/ordens-compra/NovaOcPage.module.css', 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');

const regras = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({ seletor: m[1]!.trim(), corpo: m[2]! }));
const regra = (seletor: string) => {
  const r = regras.find((x) => x.seletor === seletor);
  if (!r) throw new Error(`regra ${seletor} não encontrada`);
  return r.corpo;
};
const valor = (corpo: string, prop: string) => corpo.match(new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;]+)`))?.[1]?.trim();

describe('D555 — o Totais cabe inteiro a 375px', () => {
  it('a grade não tem largura mínima fixa maior que o conteúdo a 375px', () => {
    const corpo = regra('.totalsGrid');
    for (const prop of ['min-width', 'width']) {
      const v = valor(corpo, prop);
      if (!v) continue;
      const px = v.match(/^(\d+(?:\.\d+)?)px$/);
      if (px) expect(Number(px[1]), `${prop}: ${v}`).toBeLessThanOrEqual(CONTEUDO_A_375);
    }
    expect(valor(corpo, 'min-width')).toMatch(/^min\(\s*\d+px\s*,\s*100%\s*\)$/);
  });

  it('a linha de campo (a caixa + o espaço entre colunas) deixa pelo menos 120px para o rótulo', () => {
    const entrada = Number(valor(regra('.totalsInput'), 'width')?.replace('px', ''));
    const gap = valor(regra('.totalsGrid'), 'gap')!.split(/\s+/);
    const entreColunas = Number((gap[1] ?? gap[0])!.replace('px', ''));
    expect(entrada + entreColunas).toBeLessThanOrEqual(CONTEUDO_A_375 - 120);
  });
});

describe('D555 — fila alinhada à direita quebra linha (transbordo à esquerda some calado)', () => {
  const alinhadasADireita = regras.filter(
    (r) => valor(r.corpo, 'display') === 'flex' && valor(r.corpo, 'justify-content') === 'flex-end',
  );

  it('o rodapé e o Totais estão entre elas', () => {
    const nomes = alinhadasADireita.map((r) => r.seletor);
    expect(nomes).toContain('.footerActions');
    expect(nomes).toContain('.totalsPanel');
  });

  it.each(['.footerActions', '.totalsPanel'])('%s quebra linha', (seletor) => {
    expect(valor(regra(seletor), 'flex-wrap')).toBe('wrap');
  });

  it('e qualquer outra que aparecer também', () => {
    for (const r of alinhadasADireita) expect(valor(r.corpo, 'flex-wrap'), r.seletor).toBe('wrap');
  });
});
