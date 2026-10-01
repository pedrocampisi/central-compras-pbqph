import { describe, expect, it } from 'vitest';
import { textoParaANotaFiscal } from '../../src/domain/notaFiscal';

/**
 * CTO-D655 §4: o texto que o vendedor copia para o campo INFORMAÇÕES
 * COMPLEMENTARES da nota. Obra e endereço INVENTADOS.
 */

const ENDERECO = {
  logradouro: 'Rua das Provas', numero: '100', complemento: 'Lote 7',
  bairro: 'Bairro de Teste', cidade: 'Cidade de Teste', uf: 'MG', cep: '38400000',
};

describe('CTO-D655 — o texto para a nota fiscal', () => {
  it('com tudo: a obra, o logradouro com número, o bairro, cidade/UF, o CEP, o CNO e a OC', () => {
    expect(textoParaANotaFiscal({ nome: 'Obra de Teste', cei: '90.000.00000/00', endereco: ENDERECO }, '2026/010')).toBe(
      'OBRA: Obra de Teste - ENDEREÇO: Rua das Provas, 100, Lote 7 - Bairro de Teste - Cidade de Teste/MG' +
        ' - CEP 38400-000 - CNO 90.000.00000/00 - OC nº 2026/010',
    );
  });

  it('sem CNO no cadastro, a palavra "CNO" não aparece', () => {
    const t = textoParaANotaFiscal({ nome: 'Obra de Teste', cei: '  ', endereco: ENDERECO }, '2026/010');
    expect(t).not.toMatch(/CNO/);
    expect(t).toContain('CEP 38400-000 - OC nº 2026/010');
  });

  it('rascunho sem número não leva "OC nº"; parte vazia some com o rótulo', () => {
    const t = textoParaANotaFiscal({ nome: 'Obra de Teste', cei: '', endereco: { ...ENDERECO, complemento: '', bairro: '' } }, '');
    expect(t).toBe('OBRA: Obra de Teste - ENDEREÇO: Rua das Provas, 100 - Cidade de Teste/MG - CEP 38400-000');
  });

  it('CEP fora do formato de 8 dígitos sai como veio', () => {
    expect(textoParaANotaFiscal({ nome: 'X', cei: '', endereco: { ...ENDERECO, cep: '3840' } }, '')).toContain('CEP 3840');
  });

  it('sem obra: vazio', () => {
    expect(textoParaANotaFiscal(undefined, '')).toBe('');
  });
});
