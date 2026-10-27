import { describe, expect, it } from 'vitest';

/**
 * CTO-D953, D954: a IA monta o rascunho pelo banco, e a pessoa o confere na
 * tela. As duas contas têm de dar o mesmo total, senão o rascunho mostra um
 * número na conversa com a IA e outro na Nova OC.
 *
 * A do banco é a `compras.oc_totais`: cada linha guardada com quatro casas
 * (`oc_itens.valor_bruto`, `valor_desconto`, `valor_liquido` e `valor_ipi`, colunas
 * calculadas), somadas, mais frete e outras despesas, menos o desconto
 * material. Todos os números do banco aqui foram MEDIDOS no ensaio em
 * 26/10/2026, com as mesmas fórmulas e os mesmos tipos, por consultas que só
 * leem.
 *
 * Perícia de 26/10, achado 2 (CTO-D960): a tela somava sem arredondar a linha, e
 * o combinado era só o centavo. Não bastava: três linhas de R$ 100,01 com
 * 5,0045% de desconto dão R$ 285,02 no banco e davam R$ 285,01 na tela. Desde
 * então a tela faz a conta do banco às quatro casas, e o teste exige a quarta
 * casa igual, linha a linha.
 */
import { computeItemTotal, computeOcTotals } from '../../src/domain/compute';
import { emCentavos } from '../../src/domain/numericDoBanco';
import { formatBrl } from '../../src/domain/format';
import { normalizeItem, normalizeOC } from '../../src/domain/normalize';
import LINHAS_DO_BANCO from '../fixtures/contaDoBanco_d960.json';

/** [quantidade, preço, desconto %, IPI %], como a tela os grava. */
type Linha = [number, number, number, number];

function ocCom(linhas: Linha[], frete = 0, outras = 0, descontoMaterial = 0) {
  return normalizeOC({
    id: 'oc-teste', status: 'rascunho', frete, outras_despesas: outras, desconto_material: descontoMaterial,
    itens: linhas.map(([quantidade, preco_unit, desc_pct, ipi_pct], i) =>
      normalizeItem({ descricao: `Item ${i + 1} (teste)`, unidade: 'pç', quantidade, preco_unit, desc_pct, ipi_pct })),
  });
}

/**
 * A ISCA: a conta da tela até a D960, sem arredondar a linha. O teste tem de
 * saber separar as duas, senão ele não prova nada.
 */
function contaSemArredondarALinha(linhas: Linha[]): number {
  return linhas.reduce((s, [q, p, d, ipi]) => s + q * p * (1 - d / 100) * (1 + ipi / 100), 0);
}

const PERITO: Linha[] = [[1, 100.01, 5.0045, 0], [1, 100.01, 5.0045, 0], [1, 100.01, 5.0045, 0]];

describe('D954 e D960 — a conta da tela é a conta do banco, às quatro casas', () => {
  it('o contraexemplo do perito: R$ 285,02 no banco, e agora também na tela', () => {
    // No ensaio: round(3 * (100.01 * (1 - 5.0045 / 100))::numeric(16,4), 2) = 285.02.
    const t = computeOcTotals(ocCom(PERITO));
    expect(t.total_geral).toBe(285.015);
    expect(formatBrl(t.total_geral)).toBe(formatBrl(285.02));
    expect(emCentavos(t.total_geral)).toBe(28502);
    // A isca cai no centavo de baixo: é a divergência que o perito achou.
    expect(formatBrl(contaSemArredondarALinha(PERITO))).toBe(formatBrl(285.01));
  });

  it('400 linhas medidas no ensaio: as quatro colunas de cada uma, iguais na quarta casa', () => {
    const erradas: string[] = [];
    for (const [i, linha] of (LINHAS_DO_BANCO as [number, number, number, number, string, string, string, string][]).entries()) {
      const [q, p, d, ipi, bruto, desconto, liquido, valorIpi] = linha;
      const t = computeOcTotals(ocCom([[q, p, d, ipi]]));
      const item = computeItemTotal(normalizeItem({ descricao: 'x', quantidade: q, preco_unit: p, desc_pct: d, ipi_pct: ipi }));
      const daTela = [t.sub_total, t.desc_itens, item.liquido, item.ipi];
      const doBanco = [bruto, desconto, liquido, valorIpi].map(Number);
      if (daTela.some((v, k) => v !== doBanco[k])) erradas.push(`${i}: ${daTela.join(' ')} ≠ ${doBanco.join(' ')}`);
    }
    expect(erradas).toEqual([]);
  });

  it('as 400 linhas numa OC só: o total é a soma das colunas do banco, e a isca erra', () => {
    const linhas = LINHAS_DO_BANCO as [number, number, number, number, string, string, string, string][];
    // A soma exata das colunas do banco, em décimos de milésimo.
    const quatroCasas = (s: string) => BigInt(s.replace('.', ''));
    const soma = linhas.reduce((s, l) => s + quatroCasas(l[6]) + quatroCasas(l[7]), 0n);
    const t = computeOcTotals(ocCom(linhas.map((l) => [l[0], l[1], l[2], l[3]])));
    expect(BigInt(Math.round(t.total_geral * 1e4))).toBe(soma);
    const isca = contaSemArredondarALinha(linhas.map((l) => [l[0], l[1], l[2], l[3]]));
    expect(Math.round(isca * 100)).not.toBe(Number((soma + 50n) / 100n));
  });

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
    expect(computeOcTotals(oc)).toMatchObject({ sub_total: 537.35, desc_itens: 81.3428, total_ipi: 0, total_geral: 455.9972 });
  });

  it('frete, outras despesas e desconto material entram como a coluna de duas casas os guarda', () => {
    // numeric(14,2): 10,005 vira 10,01; 0,004 vira 0; 0,005 vira 0,01.
    expect(computeOcTotals(ocCom(PERITO, 10.005, 0.004, 0.005))).toMatchObject({
      total_frete: 10.01, total_outras: 0, total_desc_mat: 0.01, total_geral: 295.015,
    });
  });

  it('com IPI, quantidade quebrada, frete, outras despesas e desconto material', () => {
    const oc = ocCom([[3, 19.99, 7.5, 10], [12.5, 4.333, 0, 5], [1, 1234.56, 2.25, 3.25]], 35.5, 12.3, 4.2);
    expect(computeOcTotals(oc)).toMatchObject({
      sub_total: 1348.6925, desc_itens: 32.2754, total_ipi: 47.4757, total_geral: 1407.4929,
    });
  });
});
