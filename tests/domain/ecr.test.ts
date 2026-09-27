/**
 * A ECR como o documento (CTO-D586, D588, D589): a lógica pura que a tela e o
 * PDF usam. Os textos são os das ECRs 03 e 08, como o Banco carregou.
 */
import { describe, expect, it } from 'vitest';
import {
  MATERIAIS,
  O_QUE_E_O_CATALOGO,
  TITULOS_DA_ECR,
  blocosDaSecao,
  linhaDoDocumento,
  linhaDoHistorico,
  nomeDoPdfDaEcr,
  numeroDaSecao,
  revisaoDaEcr,
  revisoesDoBanco,
  secoesDoBanco,
} from '../../src/domain/ecr';
import { normalizeEcr } from '../../src/domain/normalize';
import ecrs from '../fixtures/ecrs-03-e-08.json';

const ecr03 = ecrs[0]!;
const ecr08 = ecrs[1]!;

describe('D586 — as seções como vieram do banco', () => {
  it('sem seções é null (ECR ainda não carregada), nunca uma lista vazia', () => {
    expect(secoesDoBanco(null)).toBeNull();
    expect(secoesDoBanco(undefined)).toBeNull();
    expect(secoesDoBanco('texto')).toBeNull();
  });

  it('as cinco seções da ECR 03 chegam inteiras, na ordem, sem reescrever palavra', () => {
    const s = secoesDoBanco(ecr03.secoes)!;
    expect(s.map((x) => x.titulo)).toEqual([...TITULOS_DA_ECR]);
    expect(s.map((x) => x.itens.length)).toEqual([4, 4, 1, 6, 3]);
    expect(s[1]!.itens[0]!.texto).toBe('Volume (mᶟ);');
    expect(s).toEqual(ecr03.secoes);
  });

  it('o que não é da forma vira vazio; numerado só é true quando é true', () => {
    expect(secoesDoBanco([{ itens: [{ rotulo: 3, numerado: 'sim' }] }])).toEqual([
      { titulo: '', itens: [{ rotulo: null, texto: '', numerado: false }] },
    ]);
  });
});

describe('D586 — a linha e a seção como o documento', () => {
  it('"01." a "05."', () => {
    expect([0, 1, 4].map(numeroDaSecao)).toEqual(['01.', '02.', '05.']);
  });

  it('o rótulo volta para antes dos dois-pontos', () => {
    expect(linhaDoDocumento({ rotulo: 'Lote', texto: 'cada entrega.', numerado: true })).toBe('Lote: cada entrega.');
    expect(linhaDoDocumento({ rotulo: null, texto: 'Realizar a cada caminhão.', numerado: true })).toBe(
      'Realizar a cada caminhão.',
    );
  });

  it('a inspeção da ECR 03: uma lista de 5 e a nota "Atenção" fora dela', () => {
    const blocos = blocosDaSecao(secoesDoBanco(ecr03.secoes)![3]!.itens);
    expect(blocos.map((b) => b.tipo)).toEqual(['lista', 'nota']);
    expect(blocos[0]!.tipo === 'lista' && blocos[0]!.itens.length).toBe(5);
    expect(blocos[1]!.tipo === 'nota' && blocos[1]!.item.rotulo).toBe('Atenção');
  });

  it('uma nota no meio parte a lista em duas, na ordem', () => {
    const it = (texto: string, numerado: boolean) => ({ rotulo: null, texto, numerado });
    expect(blocosDaSecao([it('a', true), it('b', false), it('c', true)]).map((b) => b.tipo)).toEqual([
      'lista',
      'nota',
      'lista',
    ]);
  });

  it('a ECR 08: o registro do fornecedor é o mais longo (9 linhas)', () => {
    expect(secoesDoBanco(ecr08.secoes)!.map((x) => x.itens.length)).toEqual([3, 4, 9, 5, 3]);
  });
});

describe('D588 — a revisão e o histórico', () => {
  it('"Rev. 00 · emitida em 15/04/2026", ou o que houver, ou nada', () => {
    expect(revisaoDaEcr({ revisao: '00', emitida_em: '2026-04-15' })).toBe('Rev. 00 · emitida em 15/04/2026');
    expect(revisaoDaEcr({ revisao: '01', emitida_em: null })).toBe('Rev. 01');
    expect(revisaoDaEcr({ revisao: null, emitida_em: null })).toBeNull();
  });

  it('sem histórico lido é null — a tela diz, e não mostra tabela vazia', () => {
    expect(revisoesDoBanco(undefined)).toBeNull();
    expect(revisoesDoBanco([])).toEqual([]);
  });

  it('a linha do banco vira a do rodapé: a data de emitida_em e os nomes das colunas _nome', () => {
    expect(
      revisoesDoBanco([
        {
          id: 7, ecr_id: 3, revisao: '00', emitida_em: '2026-04-15', descricao: 'Emissão Inicial',
          revisado_por_nome: 'Revisor de teste', aprovado_por_nome: 'Aprovador de teste',
          revisado_por: null, aprovado_por: null,
        },
      ]),
    ).toEqual([
      { revisao: '00', data: '2026-04-15', descricao: 'Emissão Inicial', revisado_por: 'Revisor de teste', aprovado_por: 'Aprovador de teste' },
    ]);
  });

  it('na ordem do contrato: a data da revisão e, no empate, a chave', () => {
    const r = revisoesDoBanco([
      { id: 30, revisao: '02', emitida_em: '2027-03-01' },
      { id: 12, revisao: '01b', emitida_em: '2026-10-01' },
      { id: 1, revisao: '00', emitida_em: '2026-04-15' },
      { id: 11, revisao: '01', emitida_em: '2026-10-01' },
    ])!;
    expect(r.map((x) => x.revisao)).toEqual(['00', '01', '01b', '02']);
  });

  it('a linha da tabela: a data em dd/mm/aaaa, e "—" sem data', () => {
    expect(
      linhaDoHistorico({ revisao: '00', data: '2026-04-15', descricao: 'Emissão Inicial', revisado_por: 'A', aprovado_por: 'B' }),
    ).toEqual(['00', '15/04/2026', 'Emissão Inicial', 'A', 'B']);
    expect(linhaDoHistorico({ revisao: '01', data: null, descricao: '', revisado_por: '', aprovado_por: '' })[1]).toBe('—');
  });

  it('o normalize guarda seções e histórico (e a falta deles é null)', () => {
    const e = normalizeEcr({ id: 3, codigo: 'ECR 03', nome: 'Concreto Usinado', secoes: ecr03.secoes, revisoes: [] });
    expect(e.secoes).toEqual(ecr03.secoes);
    expect(e.revisoes).toEqual([]);
    const velha = normalizeEcr({ id: 1, codigo: 'ECR 01', nome: 'x' });
    expect(velha.secoes).toBeNull();
    expect(velha.revisoes).toBeNull();
  });
});

describe('D588/D589 — o que a tela e o PDF dizem', () => {
  it('a página diz que é o texto em vigor, sem falar de cópia do SGQ', () => {
    expect(O_QUE_E_O_CATALOGO).toBe('O texto em vigor de cada ECR, com o histórico de revisões no fim.');
    expect(O_QUE_E_O_CATALOGO).not.toMatch(/SGQ|cópia/i);
    expect(MATERIAIS).toBe('Materiais');
  });

  it('o nome do arquivo leva o código, o nome e a revisão, sem caractere proibido', () => {
    expect(nomeDoPdfDaEcr({ codigo: 'ECR 03', nome: 'Concreto Usinado', revisao: '00' })).toBe(
      'ECR 03 - Concreto Usinado - Rev 00.pdf',
    );
    expect(nomeDoPdfDaEcr({ codigo: 'ECR 20', nome: 'Gás/GLP', revisao: null })).toBe('ECR 20 - Gás-GLP.pdf');
  });
});
