/**
 * CTO-D620 §2 — a família do achado 4 (perícia de 28/09, B4) no PDF da OC:
 * todo PDF da casa escreve texto livre pelo caminho do PDF da ECR. Na busca
 * pelo `src/`, o PDF da OC escrevia a descrição, a observação do item e as
 * observações direto na Helvetica; com um "≥", a biblioteca gravava a frase
 * inteira em outra codificação, e o leitor mostrava a frase toda estragada.
 * OC de teste com dados inventados.
 */
import { describe, expect, it } from 'vitest';
import type jsPDF from 'jspdf';
import { desenhaPdfDaOc } from '../../src/services/pdf/generateOcPdf';

/** O gabarito escrito à mão da fonte Symbol da Adobe, e não a tabela do código. */
const NA_SYMBOL_DA_ADOBE: Record<number, string> = { 0xb3: '≥', 0xa3: '≤', 0xae: '→', 0x6d: 'μ' };

/** Cada trecho desenhado, na ordem, separado por "|"; o da Symbol lido pelo código dela. */
function textoComSinais(doc: jsPDF): string {
  doc.setFont('symbol', 'normal');
  const symbol = String(doc.getFont().id);
  const partes: string[] = [];
  for (let p = 1; p <= doc.getNumberOfPages(); p++) {
    const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[p]!.join('\n');
    let fonte = '';
    for (const m of conteudo.matchAll(/\/(F\d+) [\d.]+ Tf|\(((?:\\.|[^\\)])*)\) Tj/g)) {
      if (m[1]) {
        fonte = m[1];
        continue;
      }
      const t = m[2]!.replace(/\\(.)/g, '$1');
      partes.push(fonte === symbol ? Array.from(t, (c) => NA_SYMBOL_DA_ADOBE[c.charCodeAt(0)] ?? c).join('') : t);
    }
  }
  return partes.join('|');
}

function oc(descricao: string, observacao: string, observacoes: string) {
  return {
    id: 'oc-teste', numero: 'OC-2026-0001', data: '2026-09-27', fornecedor_id: 'f1', obra_id: 'o1',
    itens: [
      { id: 'i1', descricao, observacao, quantidade: 40, unidade: 'sc', preco_unit: 34.9, ipi_pct: 0, desc_pct: 0, prazo_entrega: '' },
    ],
    frete: 0, outras_despesas: 0, desconto: 0, condicao_pagamento: 'À vista', observacoes,
  };
}
const DADOS = {
  config: { condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '' },
  fornecedores: [{ id: 'f1', razao_social: 'Fornecedor de Teste Ltda' }],
  obras: [{ id: 'o1', nome: 'Obra de Teste' }],
  ecrs: [],
};

describe('CTO-D620 §2 — o "≥" e o "≤" no PDF da OC', () => {
  it('a descrição e a observação do item: o sinal na Symbol, o resto da frase inteiro', () => {
    const doc = desenhaPdfDaOc(oc('Cimento resistência ≥ 32 MPa', 'abatimento ≤ 10 cm', '') as never, DADOS as never, null);
    const texto = textoComSinais(doc);
    expect(texto).toContain('Cimento resistência |≥| 32 MPa');
    // A coluna da observação é estreita: "cm" desce para a linha de baixo.
    expect(texto).toContain('abatimento |≤| 10|cm');
  });

  it('as observações da OC: o mesmo', () => {
    const doc = desenhaPdfDaOc(oc('Cimento', '', 'Aceitar só lote com fck ≥ 30 MPa') as never, DADOS as never, null);
    expect(textoComSinais(doc)).toContain('Aceitar só lote com fck |≥| 30 MPa');
  });
});
