/**
 * Cálculos de OC — funções puras, testáveis.
 * Migrado de CentralCompras-PBQPH.html linhas 1209-1233.
 *
 * Fórmula da linha:
 *   total_linha = (qtd × preço × (1 − desc/100)) × (1 + ipi/100)
 *
 * Total geral:
 *   total_geral = Σ totais_linha + frete + outras_despesas − desconto_material
 *
 * Desde a perícia de 26/10 (achado 2; CTO-D960) a conta é a da
 * `compras.oc_totais`, ao pé da letra: o que entra é o que a coluna guarda
 * (quatro casas na linha, duas no cabeçalho), cada valor calculado da linha é
 * arredondado às quatro casas da `numeric(16,4)` antes da soma, e o total soma o
 * LÍQUIDO e o IPI de cada linha. Até então a tela somava sem arredondar a linha:
 * três linhas de R$ 100,01 com 5,0045% de desconto davam R$ 285,02 no banco (o
 * número que a IA mostra) e R$ 285,01 na tela.
 */

import type { Item, OrdemCompra } from './types';
import {
  arredondar, dividido, emNumero, inteiro, mais, menos, naColuna, vezes, type Numeric,
} from './numericDoBanco';

export interface ItemTotal {
  liquido: number;
  ipi: number;
  total: number;
}

export interface OcTotals {
  sub_total: number;
  desc_itens: number;
  total_ipi: number;
  total_frete: number;
  total_outras: number;
  total_desc_mat: number;
  total_geral: number;
}

const CEM = inteiro(100);
const ZERO: Numeric = { v: 0n, escala: 4 };

/** As quatro colunas calculadas de `compras.oc_itens`, com as expressões delas. */
function colunasDaLinha(item: Item) {
  const qtd = naColuna(Number(item.quantidade) || 0, 4);
  const preco = naColuna(Number(item.preco_unit) || 0, 4);
  const desc = naColuna(Number(item.desc_pct) || 0, 4);
  const ipi = naColuna(Number(item.ipi_pct) || 0, 4);
  const bruto = vezes(qtd, preco);
  // ((quantidade * preco_unit) * (1 - desc_pct / 100))
  const liquido = vezes(bruto, menos(inteiro(1), dividido(desc, CEM)));
  return {
    valor_bruto: arredondar(bruto, 4),
    // (((quantidade * preco_unit) * desc_pct) / 100)
    valor_desconto: arredondar(dividido(vezes(bruto, desc), CEM), 4),
    valor_liquido: arredondar(liquido, 4),
    // ((((quantidade * preco_unit) * (1 - desc_pct / 100)) * ipi_pct) / 100)
    valor_ipi: arredondar(dividido(vezes(liquido, ipi), CEM), 4),
  };
}

export function computeItemTotal(item: Item): ItemTotal {
  const c = colunasDaLinha(item);
  return {
    liquido: emNumero(c.valor_liquido),
    ipi: emNumero(c.valor_ipi),
    total: emNumero(mais(c.valor_liquido, c.valor_ipi)),
  };
}

export function computeOcTotals(oc: OrdemCompra): OcTotals {
  let sub_total = ZERO;
  let desc_itens = ZERO;
  let liquido = ZERO;
  let total_ipi = ZERO;

  for (const item of oc.itens) {
    const c = colunasDaLinha(item);
    sub_total = mais(sub_total, c.valor_bruto);
    desc_itens = mais(desc_itens, c.valor_desconto);
    liquido = mais(liquido, c.valor_liquido);
    total_ipi = mais(total_ipi, c.valor_ipi);
  }

  const frete = naColuna(Number(oc.frete) || 0, 2);
  const outras = naColuna(Number(oc.outras_despesas) || 0, 2);
  const descMat = naColuna(Number(oc.desconto_material) || 0, 2);
  // Σ valor_liquido + Σ valor_ipi + frete + outras_despesas − desconto_material
  const total_geral = menos(mais(mais(mais(liquido, total_ipi), frete), outras), descMat);

  return {
    sub_total: emNumero(sub_total),
    desc_itens: emNumero(desc_itens),
    total_ipi: emNumero(total_ipi),
    total_frete: emNumero(frete),
    total_outras: emNumero(outras),
    total_desc_mat: emNumero(descMat),
    total_geral: emNumero(total_geral),
  };
}
