/**
 * CTO-D1036 §2.4 — o PDF da OC: a observação em destaque, para o vendedor não
 * passar por cima, e o texto do endereço da obra maior. Só esses dois pontos
 * mudam. Obra, pessoas e documentos INVENTADOS.
 */
import { describe, expect, it } from 'vitest';
import type jsPDF from 'jspdf';
import { TAMANHO_DA_OBSERVACAO, TAMANHO_DO_ENDERECO, desenhaPdfDaOc } from '../../src/services/pdf/generateOcPdf';

/** Cada trecho desenhado na página 1, com o tamanho da letra em que saiu. */
function trechos(doc: jsPDF): { texto: string; tamanho: number }[] {
  const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[1]!.join('\n');
  const saida: { texto: string; tamanho: number }[] = [];
  let tamanho = 0;
  for (const m of conteudo.matchAll(/\/F\d+ ([\d.]+) Tf|\(((?:\\.|[^\\)])*)\) Tj/g)) {
    if (m[1]) tamanho = Number(m[1]);
    else saida.push({ texto: m[2]!.replace(/\\(.)/g, '$1'), tamanho });
  }
  return saida;
}

const OBS = 'Entregar só de segunda a sexta, das 7h às 16h. Ligar para o encarregado antes de sair da loja.';

function pdf(observacoes: string) {
  const obra = {
    id: 'o1', nome: 'Obra de Teste', cei: '', telefone: '', responsavel: '', observacoes: '',
    endereco: { logradouro: 'Rua das Provas', numero: '100', complemento: '', bairro: 'Bairro de Teste', cidade: 'Cidade de Teste', uf: 'MG', cep: '38400000' },
    destinatario: { nome: 'Pessoa de Teste', documento: '00000000000', tipo: 'pf', endereco: {} },
  };
  const oc = {
    id: 'oc-teste', numero: '2026/010', data: '2026-09-30', fornecedor_id: 'f1', obra_id: 'o1',
    itens: [{ id: 'i1', descricao: 'Cimento', observacao: '', quantidade: 40, unidade: 'sc', preco_unit: 34.9, ipi_pct: 0, desc_pct: 0, prazo_entrega: '' }],
    frete: 0, outras_despesas: 0, desconto: 0, condicao_pagamento: '28 dias', observacoes,
  };
  const dados = {
    config: { condicoes_pagamento: [], texto_condicoes_contratacao: '' },
    fornecedores: [{ id: 'f1', razao_social: 'Fornecedor de Teste Ltda' }],
    obras: [obra],
    ecrs: [],
  };
  return desenhaPdfDaOc(oc as never, dados as never, null);
}

describe('CTO-D1036 §2.4 — o PDF da OC', () => {
  it('o texto do endereço da obra sai maior que antes (10,5 pt)', () => {
    const t = trechos(pdf(''));
    const endereco = t.find((x) => x.texto.includes('Rua das Provas, 100'))!;
    expect(endereco.tamanho).toBe(TAMANHO_DO_ENDERECO);
    expect(TAMANHO_DO_ENDERECO).toBeGreaterThan(10.5);
  });

  it('a observação vem num quadro com título, e em letra maior que o corpo (era 8 pt)', () => {
    const t = trechos(pdf(OBS));
    const titulo = t.find((x) => x.texto === 'OBSERVAÇÕES DO PEDIDO')!;
    expect(titulo.tamanho).toBe(11);
    expect(t.some((x) => x.texto === 'LEIA ANTES DE SEPARAR O MATERIAL')).toBe(true);
    const corpo = t.filter((x) => OBS.includes(x.texto.trim()) && x.texto.trim().length > 10);
    expect(corpo.length).toBeGreaterThan(0);
    expect(corpo.every((x) => x.tamanho === TAMANHO_DA_OBSERVACAO)).toBe(true);
    expect(corpo.map((x) => x.texto.trim()).join(' ')).toBe(OBS);
    expect(TAMANHO_DA_OBSERVACAO).toBeGreaterThan(8);
  });

  it('sem observação, o quadro não aparece', () => {
    expect(trechos(pdf('')).some((x) => x.texto.startsWith('OBSERVAÇÕES'))).toBe(false);
  });
});
