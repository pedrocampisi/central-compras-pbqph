/**
 * Testes de cálculo de OC — computeItemTotal e computeOcTotals.
 * Fórmula de linha: total = (qtd × preco × (1 − desc/100)) × (1 + ipi/100)
 * Fórmula geral:   total_geral = Σtotais − desc_itens + ipi + frete + outras − desc_mat
 */

import { describe, it, expect } from 'vitest';
import { computeItemTotal, computeOcTotals } from '../../src/domain/compute';
import type { Item, OrdemCompra } from '../../src/domain/types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    ecr_id: null,
    material_id: '',
    descricao: 'Cimento CP-II',
    observacao: '',
    quantidade: 10,
    unidade: 'sc',
    preco_unit: 30,
    ipi_pct: 0,
    desc_pct: 0,
    prazo_entrega: '',
    ...overrides,
  };
}

function makeOC(overrides: Partial<OrdemCompra> = {}): OrdemCompra {
  return {
    id: 'oc-1',
    numero: '001/2026',
    sequencial: 1,
    ano: 2026,
    data: '2026-01-15',
    status: 'rascunho',
    fornecedor_id: '',
    obra_id: '',
    condicao_pagamento: '',
    emitente_id: '',
    itens: [],
    frete: 0,
    outras_despesas: 0,
    desconto_material: 0,
    observacoes: '',
    criado_em: '',
    atualizado_em: '',
    pdf_gerado_em: '',
    ...overrides,
  };
}

// ── computeItemTotal ──────────────────────────────────────────────────────────

describe('computeItemTotal', () => {
  it('calcula total simples sem desconto e sem IPI', () => {
    const result = computeItemTotal(makeItem({ quantidade: 10, preco_unit: 30 }));
    expect(result.liquido).toBe(300);
    expect(result.ipi).toBe(0);
    expect(result.total).toBe(300);
  });

  it('aplica desconto antes do IPI', () => {
    const result = computeItemTotal(
      makeItem({ quantidade: 10, preco_unit: 100, desc_pct: 10, ipi_pct: 10 }),
    );
    // bruto = 1000, liquido = 900, ipi = 90, total = 990
    expect(result.liquido).toBe(900);
    expect(result.ipi).toBe(90);
    expect(result.total).toBe(990);
  });

  it('aplica apenas desconto (sem IPI)', () => {
    const result = computeItemTotal(makeItem({ quantidade: 5, preco_unit: 200, desc_pct: 20 }));
    // bruto = 1000, liquido = 800
    expect(result.liquido).toBe(800);
    expect(result.ipi).toBe(0);
    expect(result.total).toBe(800);
  });

  it('aplica apenas IPI (sem desconto)', () => {
    const result = computeItemTotal(makeItem({ quantidade: 10, preco_unit: 100, ipi_pct: 15 }));
    // liquido = 1000, ipi = 150, total = 1150
    expect(result.liquido).toBe(1000);
    expect(result.ipi).toBe(150);
    expect(result.total).toBe(1150);
  });

  it('retorna zero para quantidade zero', () => {
    const result = computeItemTotal(makeItem({ quantidade: 0, preco_unit: 100 }));
    expect(result.liquido).toBe(0);
    expect(result.ipi).toBe(0);
    expect(result.total).toBe(0);
  });

  it('retorna zero para preço zero', () => {
    const result = computeItemTotal(makeItem({ quantidade: 10, preco_unit: 0 }));
    expect(result.total).toBe(0);
  });

  it('trata NaN em quantidade com graciosidade', () => {
    const result = computeItemTotal(makeItem({ quantidade: NaN as unknown as number }));
    expect(result.total).toBe(0);
  });

  it('trata NaN em preco_unit com graciosidade', () => {
    const result = computeItemTotal(makeItem({ preco_unit: NaN as unknown as number }));
    expect(result.total).toBe(0);
  });

  it('calcula com desconto e IPI fracionários', () => {
    const result = computeItemTotal(
      makeItem({ quantidade: 2, preco_unit: 150, desc_pct: 5, ipi_pct: 7 }),
    );
    // bruto = 300, liquido = 285, ipi = 19.95, total = 304.95
    expect(result.liquido).toBeCloseTo(285);
    expect(result.ipi).toBeCloseTo(19.95);
    expect(result.total).toBeCloseTo(304.95);
  });
});

// ── computeOcTotals ───────────────────────────────────────────────────────────

describe('computeOcTotals', () => {
  it('soma sub_total de múltiplos itens', () => {
    const oc = makeOC({
      itens: [
        makeItem({ id: 'i1', quantidade: 5, preco_unit: 100 }),
        makeItem({ id: 'i2', quantidade: 3, preco_unit: 200 }),
      ],
    });
    const result = computeOcTotals(oc);
    expect(result.sub_total).toBe(1100); // 500 + 600
    expect(result.desc_itens).toBe(0);
    expect(result.total_geral).toBe(1100);
  });

  it('inclui frete no total_geral', () => {
    const oc = makeOC({
      itens: [makeItem({ quantidade: 1, preco_unit: 100 })],
      frete: 50,
    });
    const result = computeOcTotals(oc);
    expect(result.total_frete).toBe(50);
    expect(result.total_geral).toBe(150);
  });

  it('inclui outras_despesas no total_geral', () => {
    const oc = makeOC({
      itens: [makeItem({ quantidade: 1, preco_unit: 100 })],
      outras_despesas: 30,
    });
    const result = computeOcTotals(oc);
    expect(result.total_outras).toBe(30);
    expect(result.total_geral).toBe(130);
  });

  it('subtrai desconto_material do total_geral', () => {
    const oc = makeOC({
      itens: [makeItem({ quantidade: 1, preco_unit: 100 })],
      desconto_material: 20,
    });
    const result = computeOcTotals(oc);
    expect(result.total_desc_mat).toBe(20);
    expect(result.total_geral).toBe(80);
  });

  it('acumula descontos individuais dos itens', () => {
    const oc = makeOC({
      itens: [makeItem({ quantidade: 10, preco_unit: 100, desc_pct: 10 })],
    });
    const result = computeOcTotals(oc);
    expect(result.sub_total).toBe(1000);
    expect(result.desc_itens).toBe(100);
    expect(result.total_geral).toBe(900);
  });

  it('inclui IPI acumulado no total_geral', () => {
    const oc = makeOC({
      itens: [makeItem({ quantidade: 10, preco_unit: 100, ipi_pct: 15 })],
    });
    const result = computeOcTotals(oc);
    expect(result.total_ipi).toBe(150);
    expect(result.total_geral).toBe(1150);
  });

  it('retorna zeros para OC sem itens (só frete)', () => {
    const oc = makeOC({ frete: 100 });
    const result = computeOcTotals(oc);
    expect(result.sub_total).toBe(0);
    expect(result.total_frete).toBe(100);
    expect(result.total_geral).toBe(100);
  });

  it('cenário completo: itens + desc + IPI + frete + outras − desc_mat', () => {
    const oc = makeOC({
      itens: [makeItem({ quantidade: 10, preco_unit: 100, desc_pct: 5, ipi_pct: 10 })],
      frete: 50,
      outras_despesas: 20,
      desconto_material: 30,
    });
    // bruto = 1000, desc = 50, liquido = 950, ipi = 95
    // total_geral = 1000 − 50 + 95 + 50 + 20 − 30 = 1085
    const result = computeOcTotals(oc);
    expect(result.sub_total).toBe(1000);
    expect(result.desc_itens).toBe(50);
    expect(result.total_ipi).toBeCloseTo(95);
    expect(result.total_geral).toBeCloseTo(1085);
  });

  it('dois itens com descontos e IPIs diferentes', () => {
    const oc = makeOC({
      itens: [
        makeItem({ id: 'i1', quantidade: 2, preco_unit: 500, desc_pct: 10, ipi_pct: 5 }),
        makeItem({ id: 'i2', quantidade: 4, preco_unit: 100, desc_pct: 0, ipi_pct: 12 }),
      ],
    });
    // i1: bruto=1000, desc=100, liq=900, ipi=45, total=945
    // i2: bruto=400, desc=0, liq=400, ipi=48, total=448
    // sub_total=1400, desc_itens=100, total_ipi=93, total_geral=1393
    const result = computeOcTotals(oc);
    expect(result.sub_total).toBe(1400);
    expect(result.desc_itens).toBe(100);
    expect(result.total_ipi).toBeCloseTo(93);
    expect(result.total_geral).toBeCloseTo(1393);
  });
});
