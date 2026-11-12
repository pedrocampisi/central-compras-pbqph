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
    expect(titulo.tamanho).toBe(10.5);
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

/** Cada texto desenhado em cada página, com a altura da linha de base, em mm do alto da folha. */
function textosPorPagina(doc: jsPDF): { texto: string; y: number }[][] {
  const paginas = (doc.internal as unknown as { pages: string[][] }).pages.slice(1);
  const alturaPt = doc.internal.pageSize.getHeight() * doc.internal.scaleFactor;
  return paginas.map((p) => {
    const saida: { texto: string; y: number }[] = [];
    let y = 0;
    for (const m of p.join('\n').matchAll(/[\d.]+ ([\d.]+) Td|\(((?:\\.|[^\\)])*)\) Tj/g)) {
      if (m[1]) y = ((alturaPt - Number(m[1])) / doc.internal.scaleFactor);
      else saida.push({ texto: m[2]!.replace(/\\(.)/g, '$1'), y });
    }
    return saida;
  });
}

const OBS_DE_TRES_LINHAS =
  'Entregar somente de segunda a sexta-feira, das 7h às 16h. O caminhão não entra na obra: descarregar na calçada ' +
  'da Rua das Acácias, ao lado do portão 2. Ligar para o encarregado Rodrigo, no (34) 99999-0000, 30 minutos antes de ' +
  'sair da loja. Mandar a nota fiscal e o boleto juntos para o financeiro, com o número desta OC.';

/** A OC da prova da D1036: obra de endereço longo, frete, observação de três linhas, `n` itens. */
function pdfDaProva(n: number, observacoes = OBS_DE_TRES_LINHAS) {
  const obra = {
    id: 'o1', nome: 'Residencial de Teste — Bloco B', cei: '90.000.00000/00', telefone: '(34) 3333-0000', responsavel: '', observacoes: '',
    endereco: { logradouro: 'Avenida Doutor Joaquim Floriano de Andrade', numero: '1.250', complemento: 'Quadra 14, Lote 7', bairro: 'Bairro de Teste', cidade: 'Cidade de Teste', uf: 'MG', cep: '38411000' },
    destinatario: { nome: 'Construtora de Teste Ltda', documento: '00000000000000', tipo: 'pj', endereco: { logradouro: 'Rua da Empresa', numero: '900', complemento: '', bairro: 'Centro', cidade: 'Cidade de Teste', uf: 'MG', cep: '38400222' } },
  };
  const itens = Array.from({ length: n }, (_, k) => ({
    id: `i${k}`, descricao: `Material de teste ${k + 1}`, observacao: '', quantidade: 10 + k, unidade: 'un', preco_unit: 12.5, ipi_pct: 0, desc_pct: 0, prazo_entrega: '',
  }));
  const oc = {
    id: 'oc-prova', numero: '2026/236', data: '2026-11-11', fornecedor_id: 'f1', obra_id: 'o1', entrega_prevista: '2026-11-14',
    itens, frete: 80, outras_despesas: 0, desconto_material: 0, condicao_pagamento: '28 dias', observacoes,
  };
  const dados = {
    config: { condicoes_pagamento: [], texto_condicoes_contratacao: '' },
    fornecedores: [{ id: 'f1', razao_social: 'Fornecedor de Teste Ltda', cnpj: '00000000000000' }],
    obras: [obra],
    ecrs: [],
  };
  return desenhaPdfDaOc(oc as never, dados as never, null);
}

describe('CTO-D1036a §1 — as assinaturas nunca ficam sozinhas numa página', () => {
  it('o caso comum, observação de três linhas e dois itens, cabe numa página só', () => {
    const doc = pdfDaProva(2);
    expect(doc.getNumberOfPages()).toBe(1);
    const p1 = textosPorPagina(doc)[0]!;
    expect(p1.some((x) => x.texto === 'CARIMBO DE RECEBIMENTO DO MATERIAL')).toBe(true);
    expect(p1.some((x) => x.texto === 'OBSERVAÇÕES DO PEDIDO')).toBe(true);
  });

  it('com qualquer número de itens, as assinaturas ficam na página das condições, e a legenda antes da linha do rodapé', () => {
    const alturaDaFolha = pdfDaProva(1).internal.pageSize.getHeight();
    const linhaDoRodape = alturaDaFolha - 15;
    for (const obs of [OBS_DE_TRES_LINHAS, '']) {
      for (let n = 1; n <= 30; n += 1) {
        const paginas = textosPorPagina(pdfDaProva(n, obs));
        const daAssinatura = paginas.findIndex((p) => p.some((x) => x.texto === 'CARIMBO DE RECEBIMENTO DO MATERIAL'));
        const p = paginas[daAssinatura]!;
        expect(p.some((x) => x.texto === 'CONDIÇÕES DE CONTRATAÇÃO:'), `${n} itens`).toBe(true);
        const legenda = p.find((x) => x.texto === 'CARIMBO DE RECEBIMENTO DO MATERIAL')!;
        expect(legenda.y, `${n} itens`).toBeLessThan(linhaDoRodape - 1);
        const ultimaCondicao = Math.max(...p.filter((x) => /^\d\) /.test(x.texto)).map((x) => x.y));
        expect(legenda.y - 4, `${n} itens`).toBeGreaterThan(ultimaCondicao);
      }
    }
  });
});
