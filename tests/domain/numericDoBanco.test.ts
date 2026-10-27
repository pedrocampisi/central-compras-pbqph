import { describe, expect, it } from 'vitest';

/**
 * CTO-D960 (perícia de 26/10, achado 2): a conta decimal do banco na tela. O
 * `numeric` do Postgres arredonda com o empate para longe do zero, e a escala
 * da divisão é a do `select_div_scale`. Os casos de borda daqui; a conta inteira
 * contra o banco está em `contaDaTelaIgualAoBanco.test.ts`.
 */
import {
  arredondar, deNumero, dividido, emCentavos, emNumero, inteiro, naColuna,
} from '../../src/domain/numericDoBanco';
import { conferenciaDoTotal } from '../../src/domain/cabecalhoLido';

describe('D960 — o numeric do banco na tela', () => {
  it('lê o número como o JSON o escreve, inclusive com expoente', () => {
    expect(deNumero(100.01)).toEqual({ v: 10001n, escala: 2 });
    expect(deNumero(1e-7)).toEqual({ v: 1n, escala: 7 });
    expect(deNumero(-2.5e3)).toEqual({ v: -2500n, escala: 0 });
    expect(deNumero(Number.NaN)).toEqual({ v: 0n, escala: 0 });
  });

  it('o empate vai para longe do zero, nos dois sinais; e a coluna de 4 casas arredonda o que chega', () => {
    expect(emNumero(arredondar({ v: 2850150n, escala: 4 }, 2))).toBe(285.02);
    expect(emNumero(arredondar({ v: -2850150n, escala: 4 }, 2))).toBe(-285.02);
    expect(emNumero(arredondar({ v: 2850149n, escala: 4 }, 2))).toBe(285.01);
    expect(emNumero(naColuna(33.33335, 4))).toBe(33.3334);
    expect(emNumero(naColuna(0.00001, 4))).toBe(0);
  });

  it('a divisão por 100 na escala do Postgres: 16 dígitos, ou mais se o dividendo tiver', () => {
    expect(dividido(naColuna(5.0045, 4), inteiro(100))).toEqual({ v: 5004500000000000000n, escala: 20 });
    // q·p·d com 12 casas e acima de 10 milhões (peso 2 na base 10000): a escala é 12, e a 13ª e a 14ª casas arredondam.
    const grande = { v: 123456789012345678901n, escala: 12 };
    expect(dividido(grande, inteiro(100))).toEqual({ v: 1234567890123456789n, escala: 12 });
  });

  it('os centavos: 285,015 é 285,02 e 1,005 é 1,01, como o banco; Math.round(v * 100) erra o segundo', () => {
    expect(emCentavos(285.015)).toBe(28502);
    expect(emCentavos(1.005)).toBe(101);
    expect(Math.round(1.005 * 100)).toBe(100);
    expect(emCentavos(-285.015)).toBe(-28502);
    expect(emCentavos(456)).toBe(45600);
  });

  it('a conferência com o total do papel usa o centavo do banco', () => {
    expect(conferenciaDoTotal(285.02, 285.015)).toMatchObject({ bate: true, diferenca: 0 });
  });
});
