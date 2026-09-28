/**
 * Onde a máscara "mostrar só uma obra" fica guardada (CTO-D599 §2.3, §2.7,
 * §2.8): no navegador, como o tema. Passado o fim, ela se desarma; sem
 * armazenamento, não liga — e nada quebra.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apagarMascara, gravarMascara, lerMascara, obraDaMascara } from '../../src/services/storage/umaObra';
import { janelaEscolhida, type MascaraDeObra } from '../../src/domain/umaObra';

const { inicio, fim } = janelaEscolhida('2026-11-16', '00:00', '2026-11-17', '23:59');
const auditoria: MascaraDeObra = { obraId: 'obra-a', obraNome: 'Obra Alfa (teste)', inicio: inicio.toISOString(), fim: fim.toISOString(), ensaio: false };
const DENTRO = new Date('2026-11-16T15:00:00Z');

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('D599 — a máscara no navegador', () => {
  it('armada, a busca pergunta e ouve a obra só dentro da janela', () => {
    expect(gravarMascara(auditoria)).toBe(true);
    expect(obraDaMascara(DENTRO)).toBe('obra-a');
    expect(obraDaMascara(new Date('2026-11-16T02:59:59Z'))).toBeNull();
    expect(lerMascara(new Date('2026-11-16T02:59:59Z'))).toEqual(auditoria);
  });

  it('passado o fim, ela se desarma sozinha (o navegador esquece)', () => {
    gravarMascara(auditoria);
    expect(lerMascara(new Date('2026-11-18T03:00:00Z'))).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('o que não é da forma é apagado, e vale "nada armado"', () => {
    localStorage.setItem('oc-mostrar-uma-obra', '{quebrado');
    expect(obraDaMascara(DENTRO)).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('desligar apaga', () => {
    gravarMascara(auditoria);
    apagarMascara();
    expect(obraDaMascara(DENTRO)).toBeNull();
  });

  it('sem armazenamento (janela anônima, bloqueado): não arma, não liga, e não quebra', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    expect(gravarMascara(auditoria)).toBe(false);
    expect(lerMascara(DENTRO)).toBeNull();
    expect(obraDaMascara(DENTRO)).toBeNull();
    expect(() => apagarMascara()).not.toThrow();
  });

  it('navegador que finge guardar e não guarda também conta como "não guarda"', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    expect(gravarMascara(auditoria)).toBe(false);
  });
});
