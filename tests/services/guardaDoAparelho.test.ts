import { afterEach, describe, expect, it, vi } from 'vitest';
import { guardaDoAparelho, guardaDoDono, guardaNaMemoria } from '../../src/services/guardaDoAparelho';
import { indexedDbFalso } from '../fixtures/indexedDbFalso';

/**
 * A guarda do celular do mestre (CTO-D696 §5.1), contra um IndexedDB FALSO
 * cujo "disco" fica fora da guarda: recriar a guarda é fechar e abrir o app.
 * Perícia de 05/10: achado 6 (o "guardado" que era só memória, e a gravação
 * dada como feita antes de a transação fechar) e achado 3 (a guarda sem dono).
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a guarda do aparelho (perícia 05/10, achado 6)', () => {
  it('com o IndexedDB: é durável, e o gravado sobrevive a recriar a guarda', async () => {
    const idb = indexedDbFalso();
    vi.stubGlobal('indexedDB', idb.fabrica);
    const antes = guardaDoAparelho();
    await antes.gravar('fila:k1', { a: 1 });
    expect(await antes.duravel()).toBe(true);

    const depois = guardaDoAparelho();
    expect(await depois.ler('fila:k1')).toEqual({ a: 1 });
    expect(await depois.chaves('fila:')).toEqual(['fila:k1']);
  });

  it('o IndexedDB não abre: a guarda funciona, mas diz que NÃO é durável; recriada, não tem o gravado', async () => {
    const idb = indexedDbFalso();
    idb.controle.falharAoAbrir = true;
    vi.stubGlobal('indexedDB', idb.fabrica);
    const antes = guardaDoAparelho();
    await antes.gravar('fila:k1', { a: 1 });
    expect(await antes.ler('fila:k1')).toEqual({ a: 1 });
    expect(await antes.duravel()).toBe(false);
    expect(await guardaDoAparelho().ler('fila:k1')).toBeUndefined();
  });

  it('sem IndexedDB nenhum (o jsdom, a janela que não tem): não é durável', async () => {
    vi.stubGlobal('indexedDB', undefined);
    expect(await guardaDoAparelho().duravel()).toBe(false);
  });

  it('a gravação só é feita quando a transação fecha: pedido certo e transação desfeita = falhou', async () => {
    const idb = indexedDbFalso();
    vi.stubGlobal('indexedDB', idb.fabrica);
    const g = guardaDoAparelho();
    await g.gravar('fila:k0', { ok: true });
    idb.controle.abortarAProximaGravacao = true;
    await expect(g.gravar('fila:k1', { a: 1 })).rejects.toThrow();
    expect(await guardaDoAparelho().ler('fila:k1')).toBeUndefined();
    expect(await guardaDoAparelho().ler('fila:k0')).toEqual({ ok: true });
  });

  it('apagar também só vale quando a transação fecha', async () => {
    const idb = indexedDbFalso();
    vi.stubGlobal('indexedDB', idb.fabrica);
    const g = guardaDoAparelho();
    await g.gravar('fila:k1', { a: 1 });
    idb.controle.abortarAProximaGravacao = true;
    await expect(g.apagar('fila:k1')).rejects.toThrow();
    expect(await guardaDoAparelho().ler('fila:k1')).toEqual({ a: 1 });
  });

  it('a da memória diz o que é: durável só quando o teste finge o aparelho', async () => {
    expect(await guardaNaMemoria().duravel()).toBe(false);
    expect(await guardaNaMemoria(true).duravel()).toBe(true);
  });
});

describe('a gaveta de cada conta (perícia 05/10, achado 3)', () => {
  it('duas contas no mesmo celular: cada uma lê, lista e apaga só o que é dela', async () => {
    const celular = guardaNaMemoria(true);
    const a = guardaDoDono(celular, 'conta-a');
    const b = guardaDoDono(celular, 'conta-b');
    await a.gravar('fila:k1', 'da A');
    await a.gravar('lista:ultima', 'lista da A');
    await b.gravar('fila:k2', 'da B');

    expect(await a.chaves('fila:')).toEqual(['fila:k1']);
    expect(await b.chaves('fila:')).toEqual(['fila:k2']);
    expect(await b.ler('lista:ultima')).toBeUndefined();
    expect(await b.ler('fila:k1')).toBeUndefined();
    await b.apagar('fila:k1');
    expect(await a.ler('fila:k1')).toBe('da A');
  });

  it('a conta de uma, prefixo da outra, não vaza: "conta-a" não lê "conta-ab"', async () => {
    const celular = guardaNaMemoria(true);
    await guardaDoDono(celular, 'conta-ab').gravar('fila:k1', 'da AB');
    expect(await guardaDoDono(celular, 'conta-a').chaves('')).toEqual([]);
  });

  it('sem dono, não abre gaveta nenhuma', () => {
    expect(() => guardaDoDono(guardaNaMemoria(true), '')).toThrow();
  });
});
