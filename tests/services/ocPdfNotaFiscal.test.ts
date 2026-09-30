/**
 * CTO-D655 §5 — o PDF da OC com o endereço da obra para a nota fiscal. O
 * quadro PARA A NOTA FISCAL vem no alto da página 1, antes do destinatário;
 * leva a obra, o endereço com o CEP, o CNO (só quando há) e o número da OC;
 * as condições apontam o campo certo da nota. Obra, pessoas e documentos
 * INVENTADOS.
 */
import { describe, expect, it } from 'vitest';
import type jsPDF from 'jspdf';
import { desenhaPdfDaOc } from '../../src/services/pdf/generateOcPdf';

/** Os trechos desenhados de uma página, na ordem, separados por espaço. */
function textoDaPagina(doc: jsPDF, p: number): string {
  const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[p]!.join('\n');
  return Array.from(conteudo.matchAll(/\(((?:\\.|[^\\)])*)\) Tj/g), (m) => m[1]!.replace(/\\(.)/g, '$1')).join(' ');
}
function textoTodo(doc: jsPDF): string {
  return Array.from({ length: doc.getNumberOfPages() }, (_, i) => textoDaPagina(doc, i + 1)).join(' ');
}
/** Só o quadro: do título dele até o título do destinatário. */
function quadro(doc: jsPDF): string {
  const t = textoDaPagina(doc, 1);
  const de = t.indexOf('PARA A NOTA FISCAL');
  const ate = t.indexOf('DESTINATÁRIO DA NOTA');
  expect(de, t).toBeGreaterThanOrEqual(0);
  expect(ate, t).toBeGreaterThan(de);
  return t.slice(de, ate);
}

const ENDERECO_DA_OBRA = {
  logradouro: 'Rua das Provas', numero: '100', complemento: '', bairro: 'Bairro de Teste',
  cidade: 'Cidade de Teste', uf: 'MG', cep: '38400000',
};
const PF = {
  nome: 'Pessoa de Teste', documento: '00000000000', tipo: 'pf' as const,
  endereco: { logradouro: 'Rua da Pessoa', numero: '5', complemento: '', bairro: 'Centro', cidade: 'Cidade de Teste', uf: 'MG', cep: '38400111' },
};
const PJ = {
  nome: 'Empresa de Teste Ltda', documento: '00000000000000', tipo: 'pj' as const,
  endereco: { logradouro: 'Avenida da Empresa', numero: '900', complemento: '', bairro: 'Distrito', cidade: 'Cidade de Teste', uf: 'MG', cep: '38400222' },
};

function pdf(opcoes: { cno?: string; destinatario?: typeof PF | typeof PJ; condicoes?: string } = {}) {
  const obra = {
    id: 'o1', nome: 'Obra de Teste', cei: opcoes.cno ?? '', endereco: ENDERECO_DA_OBRA,
    destinatario: opcoes.destinatario ?? PF, telefone: '', responsavel: '', observacoes: '',
  };
  const oc = {
    id: 'oc-teste', numero: '2026/010', data: '2026-09-30', fornecedor_id: 'f1', obra_id: 'o1',
    itens: [{ id: 'i1', descricao: 'Cimento', observacao: '', quantidade: 40, unidade: 'sc', preco_unit: 34.9, ipi_pct: 0, desc_pct: 0, prazo_entrega: '' }],
    frete: 0, outras_despesas: 0, desconto: 0, condicao_pagamento: 'À vista', observacoes: '',
  };
  const dados = {
    config: { condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: opcoes.condicoes ?? '' },
    fornecedores: [{ id: 'f1', razao_social: 'Fornecedor de Teste Ltda' }],
    obras: [obra],
    ecrs: [],
  };
  return desenhaPdfDaOc(oc as never, dados as never, null);
}

describe('CTO-D655 — o quadro PARA A NOTA FISCAL', () => {
  it('leva a obra, o logradouro com número, o CEP, o CNO e o número da OC', () => {
    const q = quadro(pdf({ cno: '90.000.00000/00' }));
    expect(q).toContain('INFORMAÇÕES COMPLEMENTARES');
    expect(q).toContain('OBRA: Obra de Teste');
    expect(q).toContain('Rua das Provas, 100');
    expect(q).toContain('CEP 38400-000');
    expect(q).toContain('CNO 90.000.00000/00');
    expect(q).toContain('OC nº 2026/010');
    expect(q).toContain('Local de entrega: este mesmo endereço, o da obra.');
  });

  it('sem CNO no cadastro, a palavra "CNO" não aparece no quadro', () => {
    const q = quadro(pdf());
    expect(q).not.toMatch(/CNO/);
    expect(q).toContain('CEP 38400-000');
  });

  it('na página 1, o quadro vem antes do destinatário da nota', () => {
    const t = textoDaPagina(pdf(), 1);
    expect(t.indexOf('PARA A NOTA FISCAL')).toBeGreaterThanOrEqual(0);
    expect(t.indexOf('PARA A NOTA FISCAL')).toBeLessThan(t.indexOf('DESTINATÁRIO DA NOTA'));
  });

  it('o endereço da obra aparece uma vez só: o quadro ENTREGAR EM saiu', () => {
    const t = textoTodo(pdf());
    expect(t).not.toContain('ENTREGAR EM');
    expect(t.split('Rua das Provas').length - 1).toBe(1);
  });

  it('o destinatário continua, com o endereço do cadastro dele', () => {
    const t = textoDaPagina(pdf(), 1);
    expect(t).toContain('Pessoa de Teste');
    expect(t).toContain('Endereço do destinatário: Rua da Pessoa, 5');
  });

  it('destinatário empresa: o quadro avisa para não trocar o endereço dele pelo da obra', () => {
    expect(quadro(pdf({ destinatario: PJ }))).toContain('Não troque o endereço do destinatário pelo da obra');
    expect(quadro(pdf())).not.toContain('Não troque');
  });

  it('as condições apontam o campo certo, sem "rodapé", e não repetem o quadro', () => {
    const t = textoTodo(pdf());
    expect(t).toContain('1) Escrever no campo INFORMAÇÕES COMPLEMENTARES da Nota Fiscal');
    expect(t).not.toMatch(/rodapé/i);
    expect(t).not.toContain('6)');
  });

  it('um texto de condições guardado com o item 1 antigo sai com o item 1 novo', () => {
    const antigo = '1) Constar o nome e endereço da obra no rodapé da Nota Fiscal.\n2) Outra condição de teste.';
    const t = textoTodo(pdf({ condicoes: antigo }));
    expect(t).toContain('1) Escrever no campo INFORMAÇÕES COMPLEMENTARES da Nota Fiscal');
    expect(t).not.toMatch(/rodapé/i);
  });

  it('o lembrete no rodapé de cada página', () => {
    const doc = pdf();
    for (let p = 1; p <= doc.getNumberOfPages(); p++) {
      expect(textoDaPagina(doc, p)).toContain('NA NOTA FISCAL: o endereço da obra vai no campo INFORMAÇÕES COMPLEMENTARES');
    }
  });
});
