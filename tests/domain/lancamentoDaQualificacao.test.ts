import { describe, expect, it } from 'vitest';
import { textoDoLancamento } from '../../src/domain/qualificacao';

/**
 * CTO-D819: a qualificação lançada no sistema depois da data dela diz quando
 * foi lançada, no dia de São Paulo. Não trava nada.
 */

describe('quando a qualificação foi lançada no sistema', () => {
  it('lançada depois da data: diz o dia do lançamento', () => {
    expect(textoDoLancamento({ qualificadaEm: '2025-05-07', lancadaEm: '2026-09-28T13:00:00+00:00' }))
      .toBe('lançada no sistema em 28/09/2026');
  });

  it('lançada no mesmo dia: não diz nada', () => {
    expect(textoDoLancamento({ qualificadaEm: '2026-09-28', lancadaEm: '2026-09-28T13:00:00+00:00' })).toBe('');
  });

  it('o dia é o de São Paulo: 23h de lá, já 02h em Greenwich, ainda é o mesmo dia', () => {
    expect(textoDoLancamento({ qualificadaEm: '2026-09-27', lancadaEm: '2026-09-28T02:00:00+00:00' })).toBe('');
    expect(textoDoLancamento({ qualificadaEm: '2026-09-27', lancadaEm: '2026-09-28T03:30:00+00:00' }))
      .toBe('lançada no sistema em 28/09/2026');
  });

  it('sem o lançamento, ou com um que não é data: não diz nada', () => {
    expect(textoDoLancamento({ qualificadaEm: '2025-05-07' })).toBe('');
    expect(textoDoLancamento({ qualificadaEm: '2025-05-07', lancadaEm: '' })).toBe('');
    expect(textoDoLancamento({ qualificadaEm: '2025-05-07', lancadaEm: 'ontem' })).toBe('');
  });
});
