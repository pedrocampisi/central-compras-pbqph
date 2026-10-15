/**
 * CTO-D805 §2 — a IA monta o alto da OC: o contrato do `cabecalho`, o
 * fornecedor pelo CNPJ, o prazo em dias e a diferença do total. Empresas e
 * números INVENTADOS.
 */
import { describe, expect, it, vi } from 'vitest';

// O contrato passa pelo extractItems, que importa o cliente; aqui ele é falso.
vi.mock('../../src/services/supabase/client', () => ({ supabase: {}, core: () => ({}), compras: () => ({}) }));

import {
  DOIS_CADASTROS,
  SEM_CADASTRO,
  SEM_CNPJ,
  cabecalhoDoServidor,
  conferenciaDoTotal,
  entregaDoPapel,
  fornecedorDoCnpj,
  preencherDoCabecalho,
  somaDiasUteis,
  type CabecalhoLido,
} from '../../src/domain/cabecalhoLido';
import { paraResultado } from '../../src/services/ai/extractItems';
import { normalizeFornecedor } from '../../src/domain/normalize';
import type { Fornecedor } from '../../src/domain/types';

const filial = (id: string, cnpj: string, empresa?: string, extra: Partial<Fornecedor> = {}): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: `Empresa ${id} (teste)`, cnpj }),
  ativo: true,
  fornece_material: true,
  empresa_id: empresa,
  ...extra,
});
const ALFA_MATRIZ = filial('a1', '11111111000100', 'alfa');
const ALFA_FILIAL = filial('a2', '11111111000281', 'alfa');
const BETA = filial('b1', '22222222000100');
const TODOS = [ALFA_MATRIZ, ALFA_FILIAL, BETA];

const cab = (c: Partial<CabecalhoLido> = {}): CabecalhoLido => ({
  ...cabecalhoDoServidor({})!,
  ...c,
});

describe('o contrato do cabeçalho', () => {
  it('a v4 não manda cabeçalho: nada muda', () => {
    expect(paraResultado({ itens: [] })).not.toHaveProperty('cabecalho');
  });

  it('lê os campos, e vazio quer dizer que o papel não diz', () => {
    const c = paraResultado({
      itens: [],
      cabecalho: {
        cnpj_emitente: '22.222.222/0001-00', condicao_pagamento: ' 28/35 dias ', entrega_texto: '5 dias úteis',
        entrega_dias: 5, entrega_data: '', frete: 80, outras_despesas: null, desconto: 12.5, total: 1067.5, confira: '',
      },
    }).cabecalho!;
    expect(c).toEqual({
      cnpj_emitente: '22222222000100', condicao_pagamento: '28/35 dias', entrega_texto: '5 dias úteis',
      entrega_dias: 5, entrega_data: '', frete: 80, outras_despesas: null, desconto: 12.5, total: 1067.5, confira: '',
    });
  });

  it('CPF, data quebrada, prazo negativo e valor negativo não entram', () => {
    const c = cabecalhoDoServidor({ cnpj_emitente: '123.456.789-09', entrega_data: '2026-13-40', entrega_dias: -3, frete: -1 })!;
    expect(c.cnpj_emitente).toBe('');
    expect(c.entrega_data).toBe('');
    expect(c.entrega_dias).toBeNull();
    expect(c.frete).toBeNull();
  });
});

describe('o fornecedor pelo CNPJ do emitente', () => {
  it('o CNPJ que bate: a filial entra', () => {
    expect(fornecedorDoCnpj('22222222000100', TODOS)).toEqual({ tipo: 'achou', id: 'b1' });
  });

  it('o CNPJ que não bate: fica vazio, com a frase', () => {
    expect(fornecedorDoCnpj('33333333000100', TODOS)).toEqual({ tipo: 'nao_achou', porque: SEM_CADASTRO });
    expect(SEM_CADASTRO).toBe('o CNPJ do orçamento não está no cadastro');
  });

  it('duas filiais da mesma empresa: entra a do CNPJ, e não a principal', () => {
    expect(fornecedorDoCnpj('11111111000281', TODOS)).toEqual({ tipo: 'achou', id: 'a2' });
    expect(fornecedorDoCnpj('11111111000100', TODOS)).toEqual({ tipo: 'achou', id: 'a1' });
  });

  it('o mesmo CNPJ em duas empresas: não escolhe', () => {
    const outra = filial('c1', '22222222000100', 'gama');
    expect(fornecedorDoCnpj('22222222000100', [...TODOS, outra])).toEqual({ tipo: 'nao_achou', porque: DOIS_CADASTROS });
  });

  it('o orçamento sem CNPJ: fica vazio, com a frase', () => {
    expect(fornecedorDoCnpj('', TODOS)).toEqual({ tipo: 'nao_achou', porque: SEM_CNPJ });
  });

  it('a filial bloqueada não entra, e a frase diz por quê', () => {
    const bloqueada = filial('d1', '44444444000100', undefined, { bloqueado_para_compra_nova: true });
    expect(fornecedorDoCnpj('44444444000100', [bloqueada])).toEqual({
      tipo: 'nao_achou', porque: 'o fornecedor do CNPJ do orçamento está bloqueada para compra nova',
    });
  });
});

describe('o prazo vira data, a partir da Data da OC', () => {
  // 16/10/2026 é uma sexta-feira.
  it('dias úteis: de segunda a sexta, sem feriados', () => {
    expect(somaDiasUteis('2026-10-16', 1)).toBe('2026-10-19');
    expect(somaDiasUteis('2026-10-16', 5)).toBe('2026-10-23');
    const e = entregaDoPapel(cab({ entrega_texto: '5 dias úteis', entrega_dias: 5 }), '2026-10-16')!;
    expect(e.data).toBe('2026-10-23');
    expect(e.como).toBe('"5 dias úteis": 5 dias úteis a partir da Data da OC (16/10/2026), de segunda a sexta, sem contar feriados');
  });

  it('dias corridos quando o papel não diz "úteis"', () => {
    const e = entregaDoPapel(cab({ entrega_texto: 'entrega em 5 dias', entrega_dias: 5 }), '2026-10-16')!;
    expect(e.data).toBe('2026-10-21');
    expect(e.como).toContain('5 dias corridos');
  });

  it('a data impressa vale como está; sem nada no papel, fica o automático', () => {
    expect(entregaDoPapel(cab({ entrega_data: '2026-11-03', entrega_dias: 5 }), '2026-10-16')!.data).toBe('2026-11-03');
    expect(entregaDoPapel(cab(), '2026-10-16')).toBeNull();
  });
});

describe('o que a leitura preenche, e o que não pisa', () => {
  const tudo = cab({
    cnpj_emitente: '22222222000100', condicao_pagamento: '28 dias', entrega_texto: '3 dias', entrega_dias: 3,
    frete: 80, outras_despesas: 0, desconto: 12.5, total: 1000,
  });

  it('com tudo livre: fornecedor, condição, entrega, frete, outras e desconto, cada um com o confira', () => {
    const p = preencherDoCabecalho({ data: '2026-10-16' }, tudo, TODOS, () => true);
    expect(p.mudancas).toEqual({
      fornecedor_id: 'b1', condicao_pagamento: '28 dias', entrega_prevista: '2026-10-19',
      frete: 80, outras_despesas: 0, desconto_material: 12.5,
    });
    expect(Object.keys(p.confira).sort()).toEqual(['condicao', 'desconto', 'entrega', 'fornecedor', 'frete', 'outras']);
    expect(p.naoPisou).toEqual({});
  });

  it('o campo à mão não muda, e o resumo diz o que o papel dizia', () => {
    const p = preencherDoCabecalho({ data: '2026-10-16' }, tudo, TODOS, (c) => c !== 'condicao' && c !== 'frete');
    expect(p.mudancas.condicao_pagamento).toBeUndefined();
    expect(p.mudancas.frete).toBeUndefined();
    expect(p.naoPisou).toEqual({ condicao: '"28 dias"', frete: 'R$ 80,00' });
  });

  it('nunca toca na obra nem nas observações', () => {
    const p = preencherDoCabecalho({ data: '2026-10-16' }, tudo, TODOS, () => true);
    expect(p.mudancas).not.toHaveProperty('obra_id');
    expect(p.mudancas).not.toHaveProperty('observacoes');
  });
});

describe('a diferença do total', () => {
  it('o total do orçamento ao lado do da OC, com a diferença em centavos', () => {
    expect(conferenciaDoTotal(1000, 1067.5)).toEqual({ orcamento: 1000, oc: 1067.5, diferenca: 67.5, bate: false });
    expect(conferenciaDoTotal(1067.5, 1067.5)).toMatchObject({ diferenca: 0, bate: true });
    expect(conferenciaDoTotal(0.3, 0.1 + 0.2)).toMatchObject({ bate: true });
    expect(conferenciaDoTotal(null, 50)).toBeNull();
  });
});
