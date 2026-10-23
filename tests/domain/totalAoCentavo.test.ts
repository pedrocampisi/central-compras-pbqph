/**
 * CTO-D888 §1 e §2, D888b, D889 e D890 — o teste do Pedro na IA da OC: a
 * linha fecha no TOTAL impresso dela, a OC fecha no rodapé (o arredondamento
 * declarado), o mesmo desconto nunca entra duas vezes, e o fornecedor sem CNPJ
 * sai pelo nome, na matriz.
 *
 * As 11 linhas e o rodapé são os do papel que o Pedro leu (D889), sem dado de
 * pessoa. As empresas são INVENTADAS.
 */
import { describe, expect, it, vi } from 'vitest';

// O contrato passa pelo extractItems, que importa o cliente; aqui ele é falso.
vi.mock('../../src/services/supabase/client', () => ({ supabase: {}, core: () => ({}), compras: () => ({}) }));

import {
  NOME_EM_VARIAS,
  NOME_SEM_CADASTRO,
  NOME_SEM_FILIAL,
  SEM_CADASTRO,
  contaDoRodape,
  fornecedorDoNome,
  preencherDoCabecalho,
  type CabecalhoLido,
} from '../../src/domain/cabecalhoLido';
import { fecharLinha, linhasDoPapel } from '../../src/domain/linhaDoPapel';
import { computeItemTotal, computeOcTotals } from '../../src/domain/compute';
import { paraResultado } from '../../src/services/ai/extractItems';
import { normalizeFornecedor, normalizeItem, normalizeOC } from '../../src/domain/normalize';
import type { Fornecedor, Item } from '../../src/domain/types';

/** [QTD, VALOR TABELA, DESCONTO por unidade, TOTAL], como o papel imprime. */
const LINHAS: [number, number, number, number][] = [
  [6, 9.62, 1.46, 48.98],
  [1, 7.02, 1.06, 5.96],
  [1, 46.25, 7.01, 39.24],
  [1, 3.9, 0.59, 3.31],
  [1, 10.34, 1.56, 8.78],
  [1, 8.58, 1.3, 7.28],
  [4, 20.41, 3.09, 69.28],
  [4, 11.66, 1.77, 39.59],
  [5, 6.5, 0.98, 27.58],
  [1, 161.07, 24.39, 136.68],
  [1, 81.69, 12.36, 69.33],
];
const RODAPE = { subtotal: 537.38, desconto: 81.38, total: 456 };

/**
 * O que a leitura de 23/10 fez: a tabela no preço e o desconto em porcentagem
 * de duas casas. As porcentagens são RECONSTRUÍDAS (a linha 530 não guarda a
 * resposta, D889): são duas casas entre 15,08 e 15,18 que dão as 4 linhas
 * erradas que o CTO mediu (48,96; 39,56; 27,60; 136,67) e o "Total lido" de 455,96.
 */
const DESC_LIDO = [15.17, 15.08, 15.15, 15.14, 15.13, 15.18, 15.14, 15.18, 15.09, 15.15, 15.13];
const comoLeu = ([qtd, tabela]: [number, number, number, number], i: number): Item =>
  normalizeItem({
    id: `l${i + 1}`, descricao: `Item ${i + 1} (teste)`, quantidade: qtd, unidade: 'pç',
    preco_unit: tabela, desc_pct: DESC_LIDO[i], ipi_pct: 0,
  });

const cab = (c: Partial<CabecalhoLido> = {}): CabecalhoLido => ({
  cnpj_emitente: '', condicao_pagamento: '', entrega_texto: '', entrega_dias: null, entrega_data: '',
  frete: null, outras_despesas: null, desconto: null, total: null,
  subtotal: null, desconto_nas_linhas: null, nome_emitente: '', confira: '', ...c,
});
const DO_PAPEL = cab({ ...RODAPE, desconto_nas_linhas: true, condicao_pagamento: 'VENDA BOLETO' });
const somaDoPapel = linhasDoPapel(LINHAS.map((l) => l[3]))!;

/** A resposta da `extrair-itens` neste formato (D888 §3, os nomes que o Banco aceitou na D890). */
const RESPOSTA = {
  itens: LINHAS.map(([qtd, tabela, , total], i) => ({
    descricao: `Item ${i + 1} (teste)`, observacao: '', unidade: 'pç', quantidade: qtd,
    preco_unit: tabela, ipi_pct: 0, desc_pct: DESC_LIDO[i], ecr_id: 12,
    total_linha: total,
  })),
  ignoradas: [],
  cabecalho: {
    cnpj_emitente: '', condicao_pagamento: 'VENDA BOLETO', entrega_texto: '', entrega_dias: null, entrega_data: '',
    frete: null, outras_despesas: null, ...RODAPE, desconto_nas_linhas: true,
    nome_emitente: 'CASA DAS CONEXÕES LTDA - ME', confira: '',
  },
  _meta: { leitor: 'rapido' },
};

const centavos = (v: number) => Math.round(v * 100);

describe('D888 §1 — a linha fecha no TOTAL impresso dela', () => {
  it('como a leitura de 23/10 deixou, 4 linhas saem erradas e o total dá 455,96', () => {
    const itens = LINHAS.map(comoLeu);
    const erradas = itens.filter((it, i) => centavos(computeItemTotal(it).total) !== centavos(LINHAS[i]![3]));
    expect(erradas.map((it) => centavos(computeItemTotal(it).total))).toEqual([4896, 3956, 2760, 13667]);
    expect(centavos(itens.reduce((s, it) => s + computeItemTotal(it).total, 0))).toBe(45596);
  });

  it('as 11 fecham ao centavo: o preço fica a TABELA, e o desconto ganha 4 casas', () => {
    LINHAS.forEach((l, i) => {
      const r = fecharLinha(comoLeu(l, i), l[3]);
      expect(r.fechou, `linha ${i + 1}`).toBe(true);
      expect(r.item.preco_unit).toBe(l[1]);
      expect(Number.isInteger(r.item.desc_pct * 10000)).toBe(true);
      expect(centavos(computeItemTotal(r.item).total)).toBe(centavos(l[3]));
    });
  });

  it('a linha que já dá o total fica como veio', () => {
    const certa = normalizeItem({ id: 'x', quantidade: 2, preco_unit: 10, desc_pct: 5 });
    expect(fecharLinha(certa, 19).item).toBe(certa);
  });

  it('a tabela não serve (o total passa dela): o preço vira total ÷ QTD, com o desconto 0', () => {
    const r = fecharLinha(normalizeItem({ id: 'x', quantidade: 3, preco_unit: 5, desc_pct: 0 }), 20);
    expect(r).toMatchObject({ fechou: true, item: { preco_unit: 6.6667, desc_pct: 0 } });
    expect(centavos(computeItemTotal(r.item).total)).toBe(2000);
  });

  it('nenhum degrau fecha: a linha fica como veio, e o "Confira" diz o total do papel', () => {
    const r = fecharLinha(normalizeItem({ id: 'x', quantidade: 300, preco_unit: 0 }), 100);
    expect(r.fechou).toBe(false);
    expect(r.item.preco_unit).toBe(0);
    expect(r.fechou === false && r.confira).toMatch(/O orçamento diz R\$\s100,00 nesta linha/);
  });

  it('a soma do papel só existe com o total em TODAS as linhas', () => {
    expect(somaDoPapel).toEqual({ soma: 456.01, linhas: 11 });
    expect(linhasDoPapel([48.98, null])).toBeNull();
    expect(linhasDoPapel([])).toBeNull();
  });
});

describe('D888 §1 — a OC fecha no rodapé, e o desconto entra uma vez só', () => {
  it('o papel: as linhas somam 456,01, o rodapé diz 456,00; o desconto já está nas linhas, e −0,01 entra declarado', () => {
    const c = contaDoRodape(DO_PAPEL, somaDoPapel);
    expect(c.desconto).toBeNull();
    expect(c.arredondamento).toBe(-0.01);
    expect(c.frase).toMatch(/O desconto do orçamento \(R\$\s81,38\) já está nos preços das linhas\./);
    expect(c.frase).toMatch(/somam R\$\s456,01 e o total dele diz R\$\s456,00: a diferença de R\$\s0,01 entra como arredondamento do orçamento\./);
  });

  it('a conta da tela vale mais que a marca: a leitura diz `false`, e o 81,38 não entra de novo', () => {
    expect(contaDoRodape({ ...DO_PAPEL, desconto_nas_linhas: false }, somaDoPapel).desconto).toBeNull();
  });

  it('o inverso: as linhas vêm antes do desconto, e ele entra', () => {
    const papel = { soma: 537.38, linhas: 11 };
    expect(contaDoRodape(DO_PAPEL, papel)).toEqual({ desconto: 81.38, arredondamento: 0, frase: '' });
  });

  it('nenhuma das duas fecha: o desconto não entra, e a frase pede para conferir', () => {
    const c = contaDoRodape(DO_PAPEL, { soma: 500, linhas: 11 });
    expect(c.desconto).toBeNull();
    expect(c.arredondamento).toBe(0);
    expect(c.frase).toMatch(/nem com o desconto de R\$\s81,38, nem sem ele\. O desconto não entrou: confira\./);
  });

  it('a diferença maior que 1 centavo por linha não é arredondamento: nada se ajusta', () => {
    expect(contaDoRodape(cab({ total: 100 }), { soma: 100.03, linhas: 2 }).arredondamento).toBe(0);
    expect(contaDoRodape(cab({ total: 100 }), { soma: 100.02, linhas: 2 }).arredondamento).toBe(-0.02);
  });

  it('sem as linhas do papel, vale a marca: `true` não entra, `false` entra, `null` pede à pessoa (D890)', () => {
    const d = cab({ desconto: 12.5, total: 100 });
    expect(contaDoRodape({ ...d, desconto_nas_linhas: true }, null).desconto).toBeNull();
    expect(contaDoRodape({ ...d, desconto_nas_linhas: false }, null).desconto).toBe(12.5);
    const nulo = contaDoRodape(d, null);
    expect(nulo.desconto).toBeNull();
    expect(nulo.frase).toMatch(/a leitura não soube se ele já está nos preços das linhas\. Se não estiver, ponha no "Desconto material"\./);
  });

  it('sem desconto no papel, nada a dizer', () => {
    expect(contaDoRodape(cab({ total: 10 }), null)).toEqual({ desconto: null, arredondamento: 0, frase: '' });
  });

  it('o alto da OC: o −0,01 vai ao "Desconto material", com o nome; nada em "Outras despesas"', () => {
    const p = preencherDoCabecalho({ data: '2026-10-23' }, DO_PAPEL, [], () => true, somaDoPapel);
    expect(p.mudancas.desconto_material).toBe(0.01);
    expect(p.mudancas).not.toHaveProperty('outras_despesas');
    expect(p.confira.desconto).toBe('Com o arredondamento do orçamento (veja acima). Confira.');
    expect(p.contaDoPapel).toMatch(/arredondamento do orçamento/);
  });

  it('o arredondamento para mais vai a "Outras despesas"', () => {
    const p = preencherDoCabecalho({ data: '2026-10-23' }, cab({ total: 100.01 }), [], () => true, { soma: 100, linhas: 3 });
    expect(p.mudancas.outras_despesas).toBe(0.01);
    expect(p.mudancas).not.toHaveProperty('desconto_material');
    expect(p.confira.outras).toMatch(/arredondamento do orçamento/);
  });

  it('a resposta inteira, do jeito que a leitura manda: a OC fecha em 456,00', () => {
    const r = paraResultado(RESPOSTA);
    expect(r.papel).toEqual({ soma: 456.01, linhas: 11 });
    expect(r.confira).toEqual({});
    const p = preencherDoCabecalho({ data: '2026-10-23' }, r.cabecalho!, [], () => true, r.papel!);
    const oc = { ...normalizeOC({ id: 'oc-1' }), itens: r.itens, ...p.mudancas };
    expect(centavos(computeOcTotals(oc).total_geral)).toBe(45600);
  });

  it('a resposta sem as chaves novas (a função de antes): a tela de hoje, sem soma do papel', () => {
    const r = paraResultado({ ...RESPOSTA, itens: [{ ...RESPOSTA.itens[0]!, total_linha: undefined }] });
    expect(r).not.toHaveProperty('papel');
    expect(r.itens[0]!.desc_pct).toBe(RESPOSTA.itens[0]!.desc_pct);
  });

  it('o total da linha que não é número fica de fora: a linha como veio', () => {
    const r = paraResultado({ itens: [{ ...RESPOSTA.itens[0], total_linha: '48,98' }] });
    expect(r).not.toHaveProperty('papel');
    expect(r.itens[0]!.desc_pct).toBe(RESPOSTA.itens[0]!.desc_pct);
  });
});

// ── O fornecedor pelo nome (D888 §2, D888b) ─────────────────────────────────────

const filial = (id: string, cnpj: string, empresa: string, razao: string, extra: Partial<Fornecedor> = {}): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: razao, cnpj }),
  ativo: true,
  fornece_material: true,
  empresa_id: empresa,
  ...extra,
});
const CASA = [
  filial('c2', '33333333000281', 'casa', 'Casa das Conexões Ltda (teste)'),
  filial('c1', '33333333000100', 'casa', 'Casa das Conexões Ltda (teste)'),
  filial('c3', '33333333000362', 'casa', 'Casa das Conexões Ltda (teste)'),
];
const HIDRO = [
  filial('h1', '44444444000100', 'hidro1', 'Hidro Sul (teste)'),
  filial('h2', '55555555000100', 'hidro2', 'Hidro Sul Materiais (teste)'),
];
const TODOS = [...CASA, ...HIDRO];

describe('D888 §2 e D888b — sem CNPJ, o fornecedor sai pelo nome, na matriz', () => {
  it('o nome impresso, com LTDA, traço e acento: uma empresa só casa, e entra a MATRIZ (a 0001)', () => {
    expect(fornecedorDoNome('CASA DAS CONEXÕES LTDA - ME', TODOS)).toEqual({ tipo: 'achou', id: 'c1' });
  });

  it('a matriz não recebe OC: entra a de menor ordem que recebe, como na escolha à mão', () => {
    const semMatriz = [{ ...CASA[1]!, bloqueado_para_compra_nova: true }, CASA[0]!, CASA[2]!];
    expect(fornecedorDoNome('Casa das Conexões', semMatriz)).toEqual({ tipo: 'achou', id: 'c2' });
  });

  it('nenhuma filial recebe OC: vazio, com o porquê', () => {
    const paradas = CASA.map((f) => ({ ...f, ativo: false }));
    expect(fornecedorDoNome('Casa das Conexões', paradas)).toEqual({ tipo: 'nao_achou', porque: NOME_SEM_FILIAL });
  });

  it('nenhuma empresa casa, ou mais de uma: vazio, com o porquê', () => {
    expect(fornecedorDoNome('Ferragens do Norte', TODOS)).toEqual({ tipo: 'nao_achou', porque: NOME_SEM_CADASTRO });
    expect(fornecedorDoNome('HIDRO SUL', TODOS)).toEqual({ tipo: 'nao_achou', porque: NOME_EM_VARIAS });
  });

  it('no alto da OC: "Escolhido pelo nome do orçamento. Confira.", sem falar de filial', () => {
    const p = preencherDoCabecalho({ data: '2026-10-23' }, cab({ nome_emitente: 'Casa das Conexões' }), TODOS, () => true);
    expect(p.mudancas.fornecedor_id).toBe('c1');
    expect(p.confira.fornecedor).toBe('Escolhido pelo nome do orçamento. Confira.');
  });

  it('com CNPJ, vale o CNPJ, mesmo que o nome case com outra empresa', () => {
    const p = preencherDoCabecalho(
      { data: '2026-10-23' },
      cab({ cnpj_emitente: '99999999000100', nome_emitente: 'Casa das Conexões' }),
      TODOS,
      () => true,
    );
    expect(p.mudancas).not.toHaveProperty('fornecedor_id');
    expect(p.semFornecedor).toBe(SEM_CADASTRO);
  });

  it('a IA nunca cadastra: o nome sem cadastro deixa o campo vazio, com a frase', () => {
    const p = preencherDoCabecalho({ data: '2026-10-23' }, cab({ nome_emitente: 'Ferragens do Norte' }), TODOS, () => true);
    expect(p.mudancas).not.toHaveProperty('fornecedor_id');
    expect(p.semFornecedor).toBe(NOME_SEM_CADASTRO);
  });
});
