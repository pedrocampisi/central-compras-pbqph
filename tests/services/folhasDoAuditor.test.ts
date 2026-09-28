/**
 * CTO-D604 §3.5 — as duas folhas do auditor: o que vai em cada célula (as
 * regras puras) e o texto de dentro do PDF, lido página por página sem baixar
 * nada. Dados inventados.
 */
import { describe, expect, it } from 'vitest';
import type jsPDF from 'jspdf';
import { linhasDasAvaliacoes, secoesDosQualificados } from '../../src/domain/folhasDoAuditor';
import { pdfDasAvaliacoes, pdfDosQualificados } from '../../src/services/pdf/generateFolhasDoAuditor';
import { normalizeFornecedor } from '../../src/domain/normalize';
import type { LinhaDeQualificacao } from '../../src/domain/qualificacao';
import type { Fornecedor } from '../../src/domain/types';

function textoDaPagina(doc: jsPDF, pagina: number): string {
  const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[pagina]!.join('\n');
  return [...conteudo.matchAll(/\(((?:\\.|[^\\)])*)\) Tj/g)].map((m) => m[1]!.replace(/\\(.)/g, '$1')).join(' ');
}
const textoTodo = (doc: jsPDF) =>
  Array.from({ length: doc.getNumberOfPages() }, (_, i) => textoDaPagina(doc, i + 1)).join(' ');

const filial = (id: string, empresa: string | undefined, nome: string, apelido?: string): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: nome }),
  empresa_id: empresa,
  empresa_apelido: apelido,
});
const FORNECEDORES = [
  filial('f1', 'emp-b', 'Beta Materiais Ltda (teste)', 'Beta'),
  filial('f2', 'emp-b', 'Beta Materiais Ltda filial 2 (teste)', 'Beta'),
  filial('f3', 'emp-a', 'Alfa Tubos Ltda (teste)'),
  filial('pf', undefined, 'Prestador PF (teste)'),
];

const linha = (o: Partial<LinhaDeQualificacao>): LinhaDeQualificacao => ({
  id: 1, empresaRaizId: 'emp-a', fornecedorId: null, categoria: 'material', tipo: 'Tubos',
  qualificadaEm: '2026-05-07', venceEm: '2027-05-07',
  criterios: [{ atende: true, motivo: '' }, { atende: false, motivo: '' }, { atende: true, motivo: '' }],
  nota: 2, minimo: 2, qualificada: true, qualificadoPorNome: '', origem: '', situacao: 'qualificada', ecrs: [12, 19],
  vigente: true,
  ...o,
});

const CATEGORIAS = [
  { categoria: 'material' as const, nome: 'Materiais', criterios: ['Qualidade', 'Menor preço', 'Prazo'] },
  { categoria: 'servico' as const, nome: 'Serviços', criterios: ['Documentação e NR', 'EPI', 'Preço'] },
  { categoria: 'projeto' as const, nome: 'Projetos', criterios: ['Responsabilidade técnica', 'NBR 15575', 'Preço'] },
];

const LINHAS = [
  linha({ id: 1 }),
  linha({ id: 2, empresaRaizId: 'emp-b', tipo: 'Cimento', situacao: 'vence_em_30_dias', venceEm: '2026-10-15', ecrs: [] }),
  linha({ id: 3, empresaRaizId: 'emp-b', vigente: false, qualificadaEm: '2025-01-01' }), // a velha: não entra
  linha({ id: 4, empresaRaizId: null, fornecedorId: 'pf', categoria: 'servico', tipo: '', situacao: 'desqualificada', nota: 1 }),
  linha({ id: 5, empresaRaizId: 'emp-sumiu', tipo: 'Areia' }),
];

describe('D604 §3.5 — a lista de qualificados, no desenho da FO 8.4.1.1', () => {
  const secoes = secoesDosQualificados(LINHAS, CATEGORIAS, FORNECEDORES);

  it('uma seção por aba, na ordem; só a linha que vale; em ordem de empresa', () => {
    expect(secoes.map((s) => s.nome)).toEqual(['Materiais', 'Serviços', 'Projetos']);
    expect(secoes[0]!.linhas.map((l) => l[0])).toEqual(['Alfa Tubos Ltda (teste)', 'Beta', 'Empresa fora do cadastro da OC']);
    expect(secoes[2]!.linhas).toEqual([]);
  });

  it('as colunas da planilha: tipo, as duas datas, os "x", a nota, a situação — e as ECRs em material', () => {
    expect(secoes[0]!.linhas[0]).toEqual(['Alfa Tubos Ltda (teste)', 'Tubos', '07/05/2026', '07/05/2027', 'x', '', 'x', '2', 'Qualificada', 'ECRs 12 e 19']);
    expect(secoes[0]!.linhas[1]!.slice(-2)).toEqual(['Vence em 30 dias', '—']);
    expect(secoes[1]!.linhas[0]).toEqual(['Prestador PF (teste)', '—', '07/05/2026', '07/05/2027', 'x', '', 'x', '1', 'Desqualificada']);
  });

  it('o PDF: o título da FO, cada seção com os critérios dela, e a aba vazia dizendo que está vazia', () => {
    const doc = pdfDosQualificados(secoes, '2026-09-28', null);
    const t = textoTodo(doc);
    expect(t).toContain('FO 8.4.1.1');
    expect(t).toContain('Emitida em 28/09/2026');
    expect(t).toContain('MATERIAIS');
    expect(t).toContain('Menor pre'); // o "ç" passa pela Helvetica
    expect(t).toContain('Alfa Tubos Ltda (teste)');
    expect(t).toContain('ECRs 12 e 19');
    expect(t).toContain('Documenta');
    expect(t).toContain('Nenhuma empresa qualificada nesta categoria.');
    expect(t).toContain('Página 1 de');
    expect(t).not.toContain('01/01/2025'); // a linha velha não vai
  });
});

describe('D604 §3.5 — as avaliações de entrega', () => {
  const AVALIACOES = [
    {
      ocId: 'oc-1', intervencaoId: 'obra-1', notaFiscal: '1234', recebidoEm: '2026-09-20',
      prazoConforme: false, integridadeConforme: true, ocEcrConforme: false, observacao: 'chegou tarde',
      tratativa: 'devolvido', avaliadoPorNome: 'Pessoa A', cienciaPorNome: '', cienciaEm: '',
    },
    {
      ocId: 'oc-2', intervencaoId: 'obra-1', notaFiscal: '99', recebidoEm: '2026-09-21',
      prazoConforme: true, integridadeConforme: true, ocEcrConforme: true, observacao: '',
      tratativa: '', avaliadoPorNome: 'Pessoa B', cienciaPorNome: '', cienciaEm: '',
    },
    {
      ocId: 'oc-3', intervencaoId: 'obra-1', notaFiscal: '7', recebidoEm: '2026-09-22',
      prazoConforme: false, integridadeConforme: false, ocEcrConforme: true, observacao: '',
      tratativa: 'trocado', avaliadoPorNome: 'Pessoa A', cienciaPorNome: 'Revisor', cienciaEm: '2026-09-23T10:00:00-03:00',
    },
  ];
  const OCS = [
    { id: 'oc-1', numero: '2026/001', fornecedor_id: 'f1' },
    { id: 'oc-2', numero: '2026/002', fornecedor_id: 'f3' },
    { id: 'oc-3', numero: '2026/003', fornecedor_id: 'f3' },
  ];
  const OBRAS = [{ id: 'obra-1', nome: 'Obra de teste' }];
  const linhas = linhasDasAvaliacoes(AVALIACOES, OCS, FORNECEDORES, OBRAS);

  it('uma linha por entrega: C/NC nas três, a tratativa junto da observação, a ciência aberta ou dada', () => {
    expect(linhas[0]).toEqual([
      '2026/001', 'Beta Materiais Ltda (teste)', 'Obra de teste', '1234', '20/09/2026', 'NC', 'C', 'NC',
      'chegou tarde · Tratativa: devolvido', 'Pessoa A', 'Aberta',
    ]);
    expect(linhas[1]!.slice(-3)).toEqual(['—', 'Pessoa B', '—']);
    expect(linhas[2]!.at(-1)).toBe('Revisor, 23/09/2026');
  });

  it('o PDF diz de que obra é, com a máscara; sem ela, "Todas as obras"; sem entrega, diz isso', () => {
    const comMascara = textoTodo(pdfDasAvaliacoes(linhas, 'Obra de teste', '2026-09-28', null));
    expect(comMascara).toContain('Obra: Obra de teste');
    expect(comMascara).toContain('2026/001');
    expect(comMascara).toContain('Tratativa: devolvido');
    expect(textoTodo(pdfDasAvaliacoes(linhas, null, '2026-09-28', null))).toContain('Todas as obras');
    expect(textoTodo(pdfDasAvaliacoes([], null, '2026-09-28', null))).toContain('Nenhuma entrega avaliada.');
  });
});
