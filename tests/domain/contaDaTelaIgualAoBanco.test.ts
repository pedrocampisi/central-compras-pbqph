import { describe, expect, it } from 'vitest';

/**
 * CTO-D953, D954: a IA monta o rascunho pelo banco, e a pessoa o confere na
 * tela. As duas contas têm de dar o mesmo total, senão o rascunho mostra um
 * número na conversa com a IA e outro na Nova OC.
 *
 * A do banco é a `compras.oc_totais`: cada linha guardada com quatro casas
 * (`oc_itens.valor_bruto`, `valor_desconto`, `valor_liquido` e `valor_ipi`, colunas
 * calculadas), somadas, mais frete e outras despesas, menos o desconto
 * material. Os números de `NO_BANCO` foram MEDIDOS no ensaio em 26/10/2026, com
 * as mesmas fórmulas e os mesmos tipos, por uma consulta que só lê. A tela não
 * arredonda a linha; por isso as duas podem diferir na quarta casa, e o
 * combinado é o centavo, que é o que a OC mostra e imprime.
 */
import { computeOcTotals } from '../../src/domain/compute';
import { normalizeItem, normalizeOC } from '../../src/domain/normalize';

const centavos = (v: number) => Math.round(v * 100);

/** [quantidade, preço, desconto %, IPI %], como a tela os grava. */
type Linha = [number, number, number, number];

function ocCom(linhas: Linha[], frete = 0, outras = 0, descontoMaterial = 0) {
  return normalizeOC({
    id: 'oc-teste', status: 'rascunho', frete, outras_despesas: outras, desconto_material: descontoMaterial,
    itens: linhas.map(([quantidade, preco_unit, desc_pct, ipi_pct], i) =>
      normalizeItem({ descricao: `Item ${i + 1} (teste)`, unidade: 'pç', quantidade, preco_unit, desc_pct, ipi_pct })),
  });
}

describe('D954 — a conta da tela é a conta do banco, ao centavo', () => {
  it('o papel de 23/10, como a tela o leu (o desconto em quatro casas, o −0,01 no desconto material)', () => {
    // As linhas que a Nova OC monta do papel de 23/10 (TotalAoCentavoNaOc.test.tsx).
    const oc = ocCom(
      [
        [6, 9.62, 15.1421, 0], [1, 7.02, 15.08, 0], [1, 46.25, 15.15, 0], [1, 3.9, 15.14, 0],
        [1, 10.34, 15.13, 0], [1, 8.58, 15.18, 0], [4, 20.41, 15.14, 0], [4, 11.66, 15.1158, 0],
        [5, 6.5, 15.1385, 0], [1, 161.07, 15.1425, 0], [1, 81.69, 15.13, 0],
      ],
      0, 0, 0.01,
    );
    const NO_BANCO = { sub_total: 537.35, desconto_itens: 81.3428, total_ipi: 0, total_geral: 455.9972 };
    const t = computeOcTotals(oc);
    expect(centavos(t.sub_total)).toBe(centavos(NO_BANCO.sub_total));
    expect(centavos(t.desc_itens)).toBe(centavos(NO_BANCO.desconto_itens));
    expect(centavos(t.total_ipi)).toBe(centavos(NO_BANCO.total_ipi));
    expect(centavos(t.total_geral)).toBe(centavos(NO_BANCO.total_geral));
    expect(centavos(t.total_geral)).toBe(45600);
  });

  it('com IPI, quantidade quebrada, frete, outras despesas e desconto material', () => {
    const oc = ocCom([[3, 19.99, 7.5, 10], [12.5, 4.333, 0, 5], [1, 1234.56, 2.25, 3.25]], 35.5, 12.3, 4.2);
    const NO_BANCO = { sub_total: 1348.6925, desconto_itens: 32.2754, total_ipi: 47.4757, total_geral: 1407.4929 };
    const t = computeOcTotals(oc);
    expect(centavos(t.sub_total)).toBe(centavos(NO_BANCO.sub_total));
    expect(centavos(t.desc_itens)).toBe(centavos(NO_BANCO.desconto_itens));
    expect(centavos(t.total_ipi)).toBe(centavos(NO_BANCO.total_ipi));
    expect(centavos(t.total_geral)).toBe(centavos(NO_BANCO.total_geral));
  });
});
