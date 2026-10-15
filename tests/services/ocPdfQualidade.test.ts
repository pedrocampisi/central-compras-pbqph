/**
 * CTO-D805 §1 — o PDF da OC diz a política da qualidade (A1) e, por ECR dos
 * itens, o que o fornecedor deve enviar (A2), na revisão que valia na Data da
 * OC. Obra, fornecedor e ECRs INVENTADOS.
 */
import { describe, expect, it } from 'vitest';
import type jsPDF from 'jspdf';
import { desenhaPdfDaOc } from '../../src/services/pdf/generateOcPdf';
import {
  OC_SEM_ECR,
  POLITICA_DA_QUALIDADE,
  TITULO_DA_POLITICA,
  TITULO_DO_REGISTRO,
  ecrsQuePedemRevisaoAntiga,
  registrosDaOc,
  revisaoNaData,
  type TextoDaRevisao,
} from '../../src/domain/qualidadeNaOc';
import type { Ecr, EcrSecao } from '../../src/domain/types';

function textoDaPagina(doc: jsPDF, p: number): string {
  const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[p]!.join('\n');
  return Array.from(conteudo.matchAll(/\(((?:\\.|[^\\)])*)\) Tj/g), (m) => m[1]!.replace(/\\(.)/g, '$1')).join(' ');
}
function textoTodo(doc: jsPDF): string {
  return Array.from({ length: doc.getNumberOfPages() }, (_, i) => textoDaPagina(doc, i + 1)).join(' ');
}
const vezes = (t: string, frase: string) => t.split(frase).length - 1;

/** A frase do FO 5.2, copiada do documento em 15/10/2026: mudar a constante sem mudar aqui fica vermelho. */
const FRASE_DO_FO_5_2 =
  'Buscar a satisfação do cliente com excelência técnica, promover a melhoria contínua de nossos processos, ' +
  'cumprir os requisitos legais e aplicáveis, e atuar com sustentabilidade em tudo que fazemos.';

const secoes = (registro: EcrSecao['itens']): EcrSecao[] => [
  { titulo: 'REFERÊNCIA', itens: [{ rotulo: null, texto: 'Norma de teste', numerado: true }] },
  { titulo: 'ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO', itens: [{ rotulo: null, texto: 'Especificação de teste', numerado: true }] },
  { titulo: 'REGISTRO DO FORNECEDOR', itens: registro },
  { titulo: 'INSPEÇÃO DO RECEBIMENTO', itens: [{ rotulo: null, texto: 'Inspeção de teste', numerado: true }] },
  { titulo: 'MANUSEIO, ARMAZENAMENTO E IDENTIFICAÇÃO', itens: [{ rotulo: null, texto: 'Manuseio de teste', numerado: true }] },
];

const ecr = (id: number, codigo: string, nome: string, registro: EcrSecao['itens'], revisao = '00', emitida_em = '2026-04-15'): Ecr => ({
  id, codigo, nome, categoria: '', unidades_padrao: [], materiais: [], revisao, emitida_em, secoes: secoes(registro), revisoes: [],
});

const ACO = ecr(8, 'ECR 08', 'Aço de teste', [
  { rotulo: 'Certificado', texto: 'certificado de qualidade da usina, por lote', numerado: true },
  { rotulo: null, texto: 'Laudo de ensaio de tração', numerado: true },
  { rotulo: null, texto: 'Os certificados ficam arquivados na obra.', numerado: false },
]);
const AREIA = ecr(1, 'ECR 01', 'Areia de teste', [{ rotulo: null, texto: 'Não aplicável', numerado: true }]);
const BLOCO = ecr(13, 'ECR 13', 'Bloco de teste', [{ rotulo: null, texto: 'Ficha técnica do bloco', numerado: true }]);

const item = (i: number, ecr_id: number | null) => ({
  id: `i${i}`, ecr_id, material_id: '', descricao: `Material de teste ${i}`, observacao: '', quantidade: 1, unidade: 'un',
  preco_unit: 10, ipi_pct: 0, desc_pct: 0, prazo_entrega: '',
});

function pdf(itens: ReturnType<typeof item>[], opcoes: { textoQualidade?: string; data?: string; ecrs?: Ecr[]; antigas?: TextoDaRevisao[] } = {}) {
  const oc = {
    id: 'oc-teste', numero: '2026/010', data: opcoes.data ?? '2026-10-15', fornecedor_id: 'f1', obra_id: 'o1', itens,
    frete: 0, outras_despesas: 0, desconto_material: 0, condicao_pagamento: 'À vista', observacoes: '',
  };
  const dados = {
    config: { condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_qualidade: opcoes.textoQualidade ?? '' },
    fornecedores: [{ id: 'f1', razao_social: 'Fornecedor de Teste Ltda' }],
    obras: [{ id: 'o1', nome: 'Obra de Teste', cei: '', endereco: {}, destinatario: undefined }],
    ecrs: opcoes.ecrs ?? [ACO, AREIA, BLOCO],
  };
  return desenhaPdfDaOc(oc as never, dados as never, null, opcoes.antigas ?? []);
}

describe('CTO-D805 A1 — a política da qualidade no PDF', () => {
  it('a constante é a frase do FO 5.2, palavra por palavra', () => {
    expect(POLITICA_DA_QUALIDADE).toBe(FRASE_DO_FO_5_2);
    expect(TITULO_DA_POLITICA).toBe('POLÍTICA DA QUALIDADE (FO 5.2)');
  });

  it('o PDF traz o título e a frase inteira, uma vez', () => {
    const t = textoTodo(pdf([item(1, null)]));
    expect(vezes(t, TITULO_DA_POLITICA)).toBe(1);
    expect(vezes(t, FRASE_DO_FO_5_2)).toBe(1);
  });

  it('a configuração vazia não tira a política, e a configuração cheia não a troca', () => {
    expect(textoTodo(pdf([item(1, 8)], { textoQualidade: '' }))).toContain(FRASE_DO_FO_5_2);
    const cheia = textoTodo(pdf([item(1, 8)], { textoQualidade: 'Outro texto de teste' }));
    expect(cheia).toContain(FRASE_DO_FO_5_2);
    expect(cheia).not.toContain('Outro texto de teste');
  });

  it('em 30 itens, várias páginas, a política sai uma vez só', () => {
    const doc = pdf(Array.from({ length: 30 }, (_, i) => item(i + 1, [8, 1, 13, null][i % 4]!)));
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    expect(vezes(textoTodo(doc), FRASE_DO_FO_5_2)).toBe(1);
  });

  it('a OC de 1 item, com ECR ou sem, cabe numa página, com as assinaturas', () => {
    for (const ecrId of [null, 8]) {
      const doc = pdf([item(1, ecrId)]);
      expect(doc.getNumberOfPages()).toBe(1);
      expect(textoDaPagina(doc, 1)).toContain('AUTORIZAÇÃO / CAMPISI');
    }
  });
});

describe('CTO-D805 A2 — o registro do fornecedor por ECR', () => {
  it('cada ECR na ordem da primeira aparição, com o código, o nome e as linhas como estão', () => {
    const t = textoTodo(pdf([item(1, 13), item(2, 8), item(3, 13), item(4, 1), item(5, null)]));
    expect(t).toContain(TITULO_DO_REGISTRO);
    const bloco = t.indexOf('ECR 13 - Bloco de teste · Rev. 00 · itens 1, 3');
    const aco = t.indexOf('ECR 08 - Aço de teste · Rev. 00 · item 2');
    const areia = t.indexOf('ECR 01 - Areia de teste · Rev. 00 · item 4');
    expect(bloco).toBeGreaterThan(-1);
    expect(aco).toBeGreaterThan(bloco);
    expect(areia).toBeGreaterThan(aco);
    expect(t).toContain('Certificado: certificado de qualidade da usina, por lote');
    expect(t).toContain('Laudo de ensaio de tração');
    expect(t).toContain('Os certificados ficam arquivados na obra.');
    expect(t).toContain('Ficha técnica do bloco');
    // "Não aplicável" sai como está: o PDF não esconde linha.
    expect(t).toContain('Não aplicável');
    // Só a seção do registro: as outras seções da ECR não vão à OC.
    expect(t).not.toContain('Inspeção de teste');
  });

  it('o quadro genérico "CRITÉRIO DE QUALIFICAÇÃO CONFORME ECR" saiu', () => {
    expect(textoTodo(pdf([item(1, 8)]))).not.toContain('CRITÉRIO DE QUALIFICAÇÃO');
    expect(textoTodo(pdf([item(1, null)]))).not.toContain('CRITÉRIO DE QUALIFICAÇÃO');
  });

  it('a OC sem ECR em item nenhum diz isso, e não fica sem o quadro', () => {
    const t = textoTodo(pdf([item(1, null), item(2, null)]));
    expect(t).toContain(TITULO_DO_REGISTRO);
    expect(t).toContain(OC_SEM_ECR);
    expect(textoTodo(pdf([item(1, 8)]))).not.toContain(OC_SEM_ECR);
  });
});

describe('CTO-D805 A2 — a OC mostra a ECR que valia na Data dela', () => {
  // A ECR 08 ganha a Rev. 01 em dezembro; a OC é de outubro.
  const ACO_DE_DEZEMBRO = ecr(8, 'ECR 08', 'Aço de teste', [{ rotulo: null, texto: 'Texto de dezembro', numerado: true }], '01', '2026-12-01');
  const REV_00: TextoDaRevisao = {
    ecr_id: 8, revisao: '00', emitida_em: '2026-04-15',
    secoes: secoes([{ rotulo: null, texto: 'Texto de abril', numerado: true }]),
  };
  const REV_01: TextoDaRevisao = { ...REV_00, revisao: '01', emitida_em: '2026-12-01', secoes: ACO_DE_DEZEMBRO.secoes };

  it('só a ECR com revisão mais nova que a Data pede o texto antigo ao banco', () => {
    const oc = { data: '2026-10-15', itens: [item(1, 8), item(2, 1)] };
    expect(ecrsQuePedemRevisaoAntiga(oc, [ACO, AREIA])).toEqual([]);
    expect(ecrsQuePedemRevisaoAntiga(oc, [ACO_DE_DEZEMBRO, AREIA])).toEqual([8]);
    expect(ecrsQuePedemRevisaoAntiga({ ...oc, data: '2026-12-01' }, [ACO_DE_DEZEMBRO])).toEqual([]);
  });

  it('a revisão da data é a última com data até a Data da OC', () => {
    expect(revisaoNaData([REV_01, REV_00], '2026-10-15')?.revisao).toBe('00');
    expect(revisaoNaData([REV_01, REV_00], '2026-12-01')?.revisao).toBe('01');
    expect(revisaoNaData([REV_01, REV_00], '2026-04-14')).toBeUndefined();
  });

  it('a OC de outubro mostra o texto de abril, e não o de dezembro', () => {
    const t = textoTodo(pdf([item(1, 8)], { ecrs: [ACO_DE_DEZEMBRO], antigas: [REV_00, REV_01] }));
    expect(t).toContain('ECR 08 - Aço de teste · Rev. 00 · item 1');
    expect(t).toContain('Texto de abril');
    expect(t).not.toContain('Texto de dezembro');
  });

  it('sem o texto da revisão que valia, o PDF diz que falta e não põe o de outra', () => {
    const semTexto = registrosDaOc({ data: '2026-10-15', itens: [item(1, 8)] }, [ACO_DE_DEZEMBRO], [{ ...REV_00, secoes: null }, REV_01]);
    expect(semTexto[0]!.itens).toBeNull();
    expect(semTexto[0]!.falta).toBe('O texto da Rev. 00, que valia em 15/10/2026, não está no sistema.');
    const antesDaEcr = registrosDaOc({ data: '2026-03-01', itens: [item(1, 8)] }, [ACO_DE_DEZEMBRO], [REV_00, REV_01]);
    expect(antesDaEcr[0]!.falta).toBe('Esta ECR não tinha revisão em vigor em 01/03/2026.');
    const t = textoTodo(pdf([item(1, 8)], { ecrs: [ACO_DE_DEZEMBRO], antigas: [{ ...REV_00, secoes: null }] }));
    expect(t).toContain('não está no sistema');
    expect(t).not.toContain('Texto de dezembro');
  });
});
