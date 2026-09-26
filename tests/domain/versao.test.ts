import { describe, expect, it } from 'vitest';
import { decidirRecarga, versaoValida } from '../../src/domain/versao';

const TELA = '20260926130000-aaaaaaa';
const NOVA = '20260926140000-bbbbbbb';

describe('decidirRecarga — o cliente velho sai do velho (D541)', () => {
  it('versão nova no ar e ninguém editando: recarrega', () => {
    expect(decidirRecarga({ daTela: TELA, servida: NOVA, jaTentada: null, editando: false })).toBe('recarregar');
  });

  it('a mesma versão: fica', () => {
    expect(decidirRecarga({ daTela: TELA, servida: TELA, jaTentada: null, editando: false })).toBe('ficar');
  });

  it('OC em edição: avisa, não recarrega (a OC mora só na memória)', () => {
    expect(decidirRecarga({ daTela: TELA, servida: NOVA, jaTentada: null, editando: true })).toBe('avisar');
  });

  it('já recarregou por esta versão e ela não chegou: não recarrega de novo (sem laço)', () => {
    expect(decidirRecarga({ daTela: TELA, servida: NOVA, jaTentada: NOVA, editando: false })).toBe('ficar');
  });

  it('uma versão AINDA mais nova depois da tentada: recarrega de novo', () => {
    const maisNova = '20260926150000-ccccccc';
    expect(decidirRecarga({ daTela: TELA, servida: maisNova, jaTentada: NOVA, editando: false })).toBe('recarregar');
  });

  it('o que não é versão não recarrega — a página inicial no lugar do /versao.txt, a rede caída', () => {
    // O Cloudflare deste app responde arquivo inexistente com a página inicial
    // (modo "aplicativo de uma página"). Ler isso como versão nova = laço.
    for (const servida of ['<!doctype html><html>…', '', null, undefined, 'abc']) {
      expect(decidirRecarga({ daTela: TELA, servida, jaTentada: null, editando: false })).toBe('ficar');
    }
  });

  it('versaoValida: o formato do carimbo', () => {
    expect(versaoValida(NOVA)).toBe(true);
    expect(versaoValida(` ${NOVA}\n`)).toBe(true);
    expect(versaoValida('2026-09-26')).toBe(false);
  });
});
