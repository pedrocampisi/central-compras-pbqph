/**
 * A linha da OC fecha no TOTAL que o orçamento imprime nela (CTO-D888 §1, D889).
 *
 * O fornecedor trabalha com mais casas do que imprime: as colunas por unidade
 * (tabela, desconto, unitário) saem arredondadas, e nenhuma conta feita com
 * elas chega ao total do papel. Exato no papel é só o TOTAL de cada linha e o
 * rodapé. Por isso a linha fecha no TOTAL dela, e a OC no rodapé (o
 * arredondamento declarado mora em `cabecalhoLido.ts`).
 *
 * Os degraus, nesta ordem (a escolha do CTO na D889):
 *   0. a linha como veio já dá o total → fica como veio;
 *   1. o preço é a TABELA do papel, e o desconto ganha 4 casas;
 *   2. o preço é o total ÷ QTD, com 4 casas, e o desconto fica 0;
 *   3. nenhum fecha → a linha fica como veio, com o "Confira".
 * O banco guarda as 4 casas (`oc_itens.preco_unit` e `desc_pct`, numeric 14,4).
 *
 * Lógica pura, sem tela.
 */

import { computeItemTotal } from './compute';
import { formatBrl } from './format';
import { emCentavos } from './numericDoBanco';
import type { Item } from './types';

// O centavo com o empate para longe do zero, como o banco (CTO-D960).
const centavos = emCentavos;
const quatroCasas = (v: number) => Math.round(v * 10000) / 10000;

/** A conta da linha dá o total impresso, ao centavo. */
export function fechaNoTotal(item: Item, total: number): boolean {
  return centavos(computeItemTotal(item).total) === centavos(total);
}

export type LinhaFechada = { item: Item; fechou: true } | { item: Item; fechou: false; confira: string };

export function fecharLinha(item: Item, total: number): LinhaFechada {
  if (fechaNoTotal(item, total)) return { item, fechou: true };
  const qtd = Number(item.quantidade) || 0;
  const ipi = 1 + (Number(item.ipi_pct) || 0) / 100;
  if (qtd > 0) {
    const bruto = qtd * (Number(item.preco_unit) || 0) * ipi;
    if (bruto > 0) {
      const desc = quatroCasas((1 - total / bruto) * 100);
      const comDesconto = { ...item, desc_pct: desc };
      if (desc >= 0 && desc < 100 && fechaNoTotal(comDesconto, total)) return { item: comDesconto, fechou: true };
    }
    const liquido = { ...item, preco_unit: quatroCasas(total / (qtd * ipi)), desc_pct: 0 };
    if (fechaNoTotal(liquido, total)) return { item: liquido, fechou: true };
  }
  return {
    item,
    fechou: false,
    confira: `O orçamento diz ${formatBrl(total)} nesta linha, e a conta dela não chega lá. Confira o preço e o desconto.`,
  };
}

/** O que o papel soma nas linhas: só quando TODAS trazem o total impresso. */
export interface LinhasDoPapel {
  /** A soma dos totais impressos, em reais, exata ao centavo. */
  soma: number;
  linhas: number;
}

export function linhasDoPapel(totais: readonly (number | null)[]): LinhasDoPapel | null {
  if (totais.length === 0 || totais.some((t) => t == null)) return null;
  const soma = totais.reduce<number>((s, t) => s + centavos(t!), 0);
  return { soma: soma / 100, linhas: totais.length };
}
