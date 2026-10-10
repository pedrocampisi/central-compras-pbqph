import { describe, expect, it } from 'vitest';
import { PASSOS_DA_NOVA_OC, passoSeguiu, rotuloDoAvancar } from '../../src/domain/tutorialDaNovaOc';
import { normalizeItem, normalizeOC } from '../../src/domain/normalize';

/** CTO-D763: os passos do tutorial "Fazer uma OC", como lógica pura. OC INVENTADA. */

const oc = (p = {}) => normalizeOC({ id: 'oc-teste', status: 'rascunho', ...p });
const passo = (alvo: string) => PASSOS_DA_NOVA_OC.find((p) => p.alvo === alvo)!;

describe('os passos', () => {
  it('de 4 a 7, um alvo por passo, e o último acende o "Emitir"', () => {
    expect(PASSOS_DA_NOVA_OC.length).toBeGreaterThanOrEqual(4);
    expect(PASSOS_DA_NOVA_OC.length).toBeLessThanOrEqual(7);
    expect(new Set(PASSOS_DA_NOVA_OC.map((p) => p.alvo)).size).toBe(PASSOS_DA_NOVA_OC.length);
    expect(PASSOS_DA_NOVA_OC.at(-1)!.alvo).toBe('emitir');
  });

  it('o último passo diz que quem aperta é a pessoa, e que sair não grava', () => {
    const t = PASSOS_DA_NOVA_OC.at(-1)!.texto;
    expect(t).toContain('o tutorial não aperta');
    expect(t).toContain('sair dele não grava nada');
  });

  it('todo passo que segue sozinho diz o que fazer; o de leitura não', () => {
    for (const p of PASSOS_DA_NOVA_OC) expect(!!p.fazer, p.alvo).toBe(!!p.retrato && !!p.cumprido);
  });
});

describe('o passo segue quando a pessoa age', () => {
  it('o fornecedor: escolheu, segue', () => {
    expect(passoSeguiu(passo('fornecedor'), '', oc({ fornecedor_id: 'f1' }))).toBe(true);
    expect(passoSeguiu(passo('fornecedor'), '', oc())).toBe(false);
  });

  it('quem volta a um passo já feito não é empurrado: o retrato é o mesmo da entrada', () => {
    expect(passoSeguiu(passo('fornecedor'), 'f1', oc({ fornecedor_id: 'f1' }))).toBe(false);
    expect(passoSeguiu(passo('fornecedor'), 'f1', oc({ fornecedor_id: 'f2' }))).toBe(true);
  });

  it('trocou por "Selecione…": mudou, mas não cumpriu — fica', () => {
    expect(passoSeguiu(passo('obra'), 'o1', oc({ obra_id: '' }))).toBe(false);
  });

  it('os itens: entrou o primeiro, segue; apagar o último não segue', () => {
    const umItem = [normalizeItem({ descricao: 'Cimento (teste)' })];
    expect(passoSeguiu(passo('itens'), '0', oc({ itens: umItem }))).toBe(true);
    expect(passoSeguiu(passo('itens'), '1', oc({ itens: [] }))).toBe(false);
  });

  it('o passo de leitura nunca segue sozinho', () => {
    expect(passoSeguiu(passo('totais'), '', oc({ frete: 10 }))).toBe(false);
  });
});

describe('o botão que vai para a frente', () => {
  it('"Pular" onde se age, "Próximo" onde se lê, "Terminar" no fim', () => {
    const n = PASSOS_DA_NOVA_OC.length;
    expect(rotuloDoAvancar(0, n, passo('fornecedor'))).toBe('Pular');
    expect(rotuloDoAvancar(2, n, passo('entrega'))).toBe('Próximo');
    expect(rotuloDoAvancar(n - 1, n, passo('emitir'))).toBe('Terminar');
  });
});
