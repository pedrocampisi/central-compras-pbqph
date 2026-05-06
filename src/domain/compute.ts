/**
 * Cálculos de OC — funções puras, testáveis.
 * Migrado de CentralCompras-PBQPH.html linhas 1209-1233.
 *
 * Fórmula da linha:
 *   total_linha = (qtd × preço × (1 − desc/100)) × (1 + ipi/100)
 *
 * Total geral:
 *   total_geral = Σ totais_linha + frete + outras_despesas − desconto_material
 */

import type { Item, OrdemCompra } from './types';

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

export function computeItemTotal(item: Item): ItemTotal {
  const qtd = Number(item.quantidade) || 0;
  const preco = Number(item.preco_unit) || 0;
  const descPct = Number(item.desc_pct) || 0;
  const ipiPct = Number(item.ipi_pct) || 0;

  const bruto = qtd * preco;
  const liquido = bruto * (1 - descPct / 100);
  const ipi = liquido * (ipiPct / 100);
  const total = liquido + ipi;
  return { liquido, ipi, total };
}

export function computeOcTotals(oc: OrdemCompra): OcTotals {
  let sub_total = 0;
  let desc_itens = 0;
  let total_ipi = 0;

  for (const item of oc.itens) {
    const qtd = Number(item.quantidade) || 0;
    const preco = Number(item.preco_unit) || 0;
    const descPct = Number(item.desc_pct) || 0;
    const ipiPct = Number(item.ipi_pct) || 0;
    const bruto = qtd * preco;
    const desc = bruto * (descPct / 100);
    const liquido = bruto - desc;
    const ipi = liquido * (ipiPct / 100);
    sub_total += bruto;
    desc_itens += desc;
    total_ipi += ipi;
  }

  const total_frete = Number(oc.frete) || 0;
  const total_outras = Number(oc.outras_despesas) || 0;
  const total_desc_mat = Number(oc.desconto_material) || 0;
  const total_geral =
    sub_total - desc_itens + total_ipi + total_frete + total_outras - total_desc_mat;

  return {
    sub_total,
    desc_itens,
    total_ipi,
    total_frete,
    total_outras,
    total_desc_mat,
    total_geral,
  };
}
