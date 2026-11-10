import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { CATEGORIAS } from '../../src/domain/qualificacao';
import { PERGUNTAS_DOS_CRITERIOS, TITULOS_DOS_CRITERIOS, tituloDoCriterio } from '../../src/domain/titulosDosCriterios';

/**
 * CTO-D1034n: no ar, os critérios de Materiais apareciam como "O", "Preço" e
 * "O". O título é escolhido à mão, critério por critério, e esta trava confere
 * as cinco categorias contra o texto de verdade do banco.
 */

const ARTIGOS = /^(o|a|os|as|um|uma|de|do|da)$/i;
const letras = (t: string) => t.replace(/[^\p{L}\p{N}]/gu, '').length;

describe('CTO-D1034n — o título de cada critério da Qualificação', () => {
  for (const c of CATEGORIAS) {
    it(`${c}: três títulos, com quatro letras ou mais, sem artigo, sem reticências e sem repetir`, () => {
      const t = TITULOS_DOS_CRITERIOS[c];
      expect(t).toHaveLength(3);
      for (const titulo of t) {
        expect(letras(titulo), titulo).toBeGreaterThanOrEqual(4);
        expect(titulo.split(/\s+/)[0], titulo).not.toMatch(ARTIGOS);
        expect(titulo).not.toMatch(/…|\.\.\./);
        expect(titulo.split(/\s+/).length, titulo).toBeLessThanOrEqual(3);
      }
      expect(new Set(t).size).toBe(3);
    });
  }

  it('o texto de verdade começa pelo artigo: a regra antiga da primeira palavra daria "O"', () => {
    const primeiras = CATEGORIAS.flatMap((c) => PERGUNTAS_DOS_CRITERIOS[c].map((p) => p.split(/\s+/)[0]));
    expect(primeiras.every((p) => p === 'O')).toBe(true);
  });

  it('a página usa a tabela, e não corta mais o texto por regra', () => {
    const tela = readFileSync('src/features/qualificacao/QualificacaoPage.tsx', 'utf-8');
    expect(tela).toContain('tituloDoCriterio(aba, i)');
    expect(tela).not.toContain('tituloCurtoDoCriterio');
    expect(tela).not.toContain('CURTOS');
  });

  it('categoria ou ordem fora da tabela: "Critério N"', () => {
    expect(tituloDoCriterio('material', 3)).toBe('Critério 4');
  });

  it('o cabeçalho tem a altura das outras listas e a tabela respira da linha da busca', () => {
    const css = readFileSync('src/features/qualificacao/QualificacaoPage.module.css', 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).toMatch(/\.tabela thead th \{\s*padding:\s*10px 6px;/);
    expect(css).not.toMatch(/letter-spacing/);
    expect(readFileSync('src/features/qualificacao/QualificacaoPage.tsx', 'utf-8')).toContain('<div role="tabpanel" data-categoria={aba} className="section">');
  });
});
