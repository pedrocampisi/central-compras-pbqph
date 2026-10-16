import { describe, expect, it } from 'vitest';
import {
  ALCANCES_DA_QUALIFICACAO,
  alcancesPossiveis,
  codigoDaEcr,
  dicasDoAlcance,
  avisoDaEcr,
  correcaoSemMudanca,
  problemaDoAlcance,
  quemConferiu,
  registrosDaEcr,
  textoDaCorrecao,
  textoDaEntregaCoberta,
  textoDaVigencia,
  vigenciaDoRegistro,
  type RegistroGuardado,
} from '../../src/domain/registrosGuardados';

/**
 * CTO-D812 §2 (ajuste 1) e D811 §2: os papéis guardados como a qualificação os
 * mostra. Lógica pura; empresas e pessoas inventadas.
 */

const HOJE = '2026-10-15';

function papel(extra: Partial<RegistroGuardado> = {}): RegistroGuardado {
  return {
    id: 1, documentoId: 'doc-1', ecrId: 6, empresaRaizId: 'raiz-1', fornecedorId: null, alcance: 'vale_ate',
    validoAte: '2027-06-30', ocId: '', avaliacaoId: 0, entrouPor: 'qualificacao', conferidoPorNome: 'Comprador de Teste',
    conferidoEm: '2026-10-10T12:00:00+00:00', correcoes: [], ...extra,
  };
}

describe('os alcances que cada caminho aceita', () => {
  it('a qualificação não aceita o lote; a OC aceita os três', () => {
    expect(ALCANCES_DA_QUALIFICACAO).toEqual(['vale_ate', 'produto']);
    expect(alcancesPossiveis('qualificacao')).toEqual(['vale_ate', 'produto']);
    expect(alcancesPossiveis('oc')).toEqual(['lote', 'vale_ate', 'produto']);
  });

  it('o que falta: a escolha, o lote fora da OC, a data do "vale até"', () => {
    const q = alcancesPossiveis('qualificacao');
    expect(problemaDoAlcance(null, '', q)).toBe('Escolha a quem o papel vale.');
    expect(problemaDoAlcance('lote', '', q)).toBe('O papel "deste lote" se anexa na OC em que chegou.');
    expect(problemaDoAlcance('vale_ate', '', q)).toBe('Escreva até quando o papel vale.');
    expect(problemaDoAlcance('vale_ate', '30/06/2027', q)).toBe('Escreva até quando o papel vale.');
    expect(problemaDoAlcance('vale_ate', '2027-06-30', q)).toBe('');
    expect(problemaDoAlcance('produto', '', q)).toBe('');
    expect(problemaDoAlcance('lote', '', alcancesPossiveis('oc'))).toBe('');
  });
});

describe('a ECR com a marca "a cada entrega" (D840 §2.3, §2.5)', () => {
  it('pela OC e pela qualificação, o lote não entra; pela entrega, ele é o único', () => {
    expect(alcancesPossiveis('oc', true)).toEqual(['vale_ate', 'produto']);
    expect(alcancesPossiveis('qualificacao', true)).toEqual(['vale_ate', 'produto']);
    expect(alcancesPossiveis('entrega', true)).toEqual(['lote']);
    expect(alcancesPossiveis('entrega')).toEqual(['lote', 'vale_ate', 'produto']);
  });

  it('a janela diz por onde o lote entra, e que o "vale até" e o "produto" não cobrem a entrega', () => {
    expect(codigoDaEcr(2)).toBe('ECR 02');
    expect(dicasDoAlcance('oc', 2, true)).toEqual([
      'A ECR 02 pede o papel a cada entrega: anexe pela entrega, em Recebimentos, na lista das entregas sem papel.',
      'Aqui, o "vale até" e o "vale para o produto" guardam o papel, mas não cobrem as entregas desta ECR.',
    ]);
    expect(dicasDoAlcance('qualificacao', 17, true)[0]).toMatch(/^A ECR 17 pede o papel a cada entrega/);
    expect(dicasDoAlcance('entrega', 1, true)).toEqual(['Este papel vale para esta entrega.']);
    expect(dicasDoAlcance('qualificacao', 6, false)).toEqual(['O papel deste lote se anexa na OC em que ele chegou, em Ordens de compra.']);
    expect(dicasDoAlcance('oc', 6, false)).toEqual([]);
    expect(dicasDoAlcance('entrega', 6, false)).toEqual([]);
  });
});

describe('a entrega que o papel de lote cobre (D840 §2.4)', () => {
  it('o dia e a OC; sem o dia, só a OC; o que não é lote, ou não nomeia entrega, não diz', () => {
    const lote = { alcance: 'lote' as const, avaliacaoId: 31 };
    expect(textoDaEntregaCoberta(lote, '2026-10-14', '2026/101')).toBe('cobre a entrega de 14/10, OC 2026/101');
    expect(textoDaEntregaCoberta(lote, '2026-10-14T13:00:00Z', '')).toBe('cobre a entrega de 14/10, OC (sem número)');
    expect(textoDaEntregaCoberta(lote, '', '2026/101')).toBe('cobre uma entrega da OC 2026/101');
    expect(textoDaEntregaCoberta({ alcance: 'lote', avaliacaoId: 0 }, '2026-10-14', '2026/101')).toBe('');
    expect(textoDaEntregaCoberta({ alcance: 'vale_ate', avaliacaoId: 31 }, '2026-10-14', '2026/101')).toBe('');
  });
});

describe('a vigência no dia, e o aviso de 30 dias', () => {
  it('o "vale até": vale, vence em 30 dias, venceu; o último dia ainda vale', () => {
    expect(vigenciaDoRegistro(papel({ validoAte: '2026-11-15' }), HOJE)).toBe('vale');
    expect(vigenciaDoRegistro(papel({ validoAte: '2026-11-14' }), HOJE)).toBe('vence_em_30_dias');
    expect(vigenciaDoRegistro(papel({ validoAte: HOJE }), HOJE)).toBe('vence_em_30_dias');
    expect(vigenciaDoRegistro(papel({ validoAte: '2026-10-14' }), HOJE)).toBe('vencido');
  });

  it('o lote e o produto não vencem', () => {
    expect(vigenciaDoRegistro(papel({ alcance: 'lote', validoAte: '' }), HOJE)).toBe('lote');
    expect(vigenciaDoRegistro(papel({ alcance: 'produto', validoAte: '' }), HOJE)).toBe('produto');
  });

  it('o texto: o alcance, ou a vigência quando pede atenção', () => {
    expect(textoDaVigencia(papel(), HOJE)).toBe('Vale até 30/06/2027');
    expect(textoDaVigencia(papel({ validoAte: '2026-10-20' }), HOJE)).toBe('Vence em 20/10/2026, em menos de 30 dias');
    expect(textoDaVigencia(papel({ validoAte: '2026-09-30' }), HOJE)).toBe('Venceu em 30/09/2026');
    expect(textoDaVigencia(papel({ alcance: 'lote', validoAte: '' }), HOJE)).toBe('Deste lote');
    expect(textoDaVigencia(papel({ alcance: 'produto', validoAte: '' }), HOJE)).toBe('Vale para o produto, sem prazo');
  });

  describe('o aviso da ECR, na ordem das regras do banco (CTO-D818 §2)', () => {
    const PEDE = { itens: [{ texto: 'Licença (teste)' }], temMarca: false };
    const NAO_APLICAVEL = { itens: [{ texto: 'Não aplicável.' }], temMarca: false };
    const NADA = 'Nenhum papel guardado para esta ECR.';
    const LOTE = 'Esta empresa já mandou papel valendo só para o lote: cada entrega pede o papel, mesmo com outro guardado.';
    const VENCEU = 'O papel que valia até uma data venceu. A próxima entrega vai pedir de novo.';
    const lote = papel({ alcance: 'lote', validoAte: '' });

    it('1: a seção que diz "Não aplicável" não pede, nem com a marca, e não soa como falta', () => {
      const aviso = 'A ECR diz "Não aplicável" no registro do fornecedor: nenhuma entrega pede o papel.';
      expect(avisoDaEcr([], HOJE, NAO_APLICAVEL)).toBe(aviso);
      expect(avisoDaEcr([], HOJE, { itens: [{ texto: ' nao aplicavel ' }], temMarca: true })).toBe(aviso);
      // Uma linha que pede, junto: a seção não é "Não aplicável".
      expect(avisoDaEcr([], HOJE, { itens: [{ texto: 'Não aplicável.' }, { texto: 'Licença (teste)' }], temMarca: false })).toBe(NADA);
    });

    it('2: com a marca, a caixa dela diz, e o aviso fica calado', () => {
      expect(avisoDaEcr([], HOJE, { ...PEDE, temMarca: true })).toBe('');
      expect(avisoDaEcr([lote], HOJE, { ...PEDE, temMarca: true })).toBe('');
    });

    it('3 antes de 4 e 5: um lote, mesmo com um "vale até" valendo ou um "produto", pede em toda entrega', () => {
      expect(avisoDaEcr([lote], HOJE, PEDE)).toBe(LOTE);
      expect(avisoDaEcr([papel({ validoAte: '2027-06-30' }), lote], HOJE, PEDE)).toBe(LOTE);
      expect(avisoDaEcr([papel({ alcance: 'produto', validoAte: '' }), lote], HOJE, PEDE)).toBe(LOTE);
      expect(avisoDaEcr([papel({ validoAte: '2026-09-30' }), lote], HOJE, PEDE)).toBe(LOTE);
    });

    it('4 e 5: o "vale até" que vale hoje, ou o "produto", calam o aviso', () => {
      expect(avisoDaEcr([papel({ validoAte: '2026-10-20' })], HOJE, PEDE)).toBe('');
      expect(avisoDaEcr([papel({ validoAte: HOJE })], HOJE, PEDE)).toBe('');
      expect(avisoDaEcr([papel({ validoAte: '2026-09-30' }), papel({ alcance: 'produto', validoAte: '' })], HOJE, PEDE)).toBe('');
    });

    it('6: o vencido, ou nada guardado (também sem o texto da ECR no sistema)', () => {
      expect(avisoDaEcr([papel({ validoAte: '2026-10-14' })], HOJE, PEDE)).toBe(VENCEU);
      expect(avisoDaEcr([], HOJE, PEDE)).toBe(NADA);
      expect(avisoDaEcr([], HOJE, { itens: null, temMarca: false })).toBe(NADA);
      expect(avisoDaEcr([], HOJE, { itens: [], temMarca: false })).toBe(NADA);
    });
  });
});

describe('os papéis de uma empresa e de uma ECR', () => {
  const lista = [
    papel({ id: 1, ecrId: 6, validoAte: '2027-06-30', conferidoEm: '2026-10-01T00:00:00Z' }),
    papel({ id: 2, ecrId: 6, validoAte: '2026-09-30', conferidoEm: '2026-09-01T00:00:00Z' }),
    papel({ id: 3, ecrId: 6, alcance: 'lote', validoAte: '', conferidoEm: '2026-10-12T00:00:00Z' }),
    papel({ id: 4, ecrId: 2 }),
    papel({ id: 5, ecrId: 6, empresaRaizId: 'raiz-2' }),
    // O fornecedor sem raiz no banco, que na tela já é da empresa.
    papel({ id: 6, ecrId: 6, empresaRaizId: null, fornecedorId: 'forn-9', conferidoEm: '2026-10-05T00:00:00Z' }),
    papel({ id: 7, ecrId: 6, empresaRaizId: null, fornecedorId: 'forn-sozinho' }),
  ];
  const chaveDe = (f: string) => (f === 'forn-9' ? 'raiz-1' : undefined);

  it('só os da ECR e da empresa, o vencido no alto, o lote no fim, e o mais novo antes', () => {
    expect(registrosDaEcr(lista, 'raiz-1', 6, chaveDe, HOJE).map((r) => r.id)).toEqual([2, 6, 1, 3]);
  });

  it('o fornecedor sem empresa responde pela chave dele', () => {
    expect(registrosDaEcr(lista, 'filial:forn-sozinho', 6, chaveDe, HOJE).map((r) => r.id)).toEqual([7]);
  });
});

describe('quem conferiu, e a correção escrita', () => {
  it('por onde entrou, quem conferiu e quando', () => {
    expect(quemConferiu(papel({ entrouPor: 'recebimento', conferidoPorNome: 'Encarregado de Teste' })))
      .toMatch(/^chegou com o material, na obra · conferido por Encarregado de Teste · \d{2}\/\d{2}\/2026/);
    expect(quemConferiu(papel({ entrouPor: 'oc', conferidoEm: '' }))).toBe('anexado na OC · conferido por Comprador de Teste');
  });

  it('a correção: de quê para quê, quem, quando e o motivo', () => {
    const c = {
      alcanceAntes: 'lote' as const, validoAteAntes: '', alcanceDepois: 'vale_ate' as const, validoAteDepois: '2027-06-30',
      motivo: 'a licença tem prazo', corrigidoPorNome: 'Comprador de Teste', corrigidoEm: '2026-10-13T15:00:00Z',
    };
    expect(textoDaCorrecao(c)).toMatch(
      /^Corrigido de "Deste lote" para "Vale até 30\/06\/2027" — Comprador de Teste, 13\/10\/2026.*\. Motivo: a licença tem prazo$/,
    );
    expect(textoDaCorrecao({ ...c, motivo: '' })).not.toContain('Motivo');
  });

  it('a correção sem mudança: o mesmo alcance; no "vale até", a mesma data', () => {
    expect(correcaoSemMudanca(papel(), 'vale_ate', '2027-06-30')).toBe(true);
    expect(correcaoSemMudanca(papel(), 'vale_ate', '2027-07-31')).toBe(false);
    expect(correcaoSemMudanca(papel(), 'produto', '')).toBe(false);
    expect(correcaoSemMudanca(papel({ alcance: 'produto', validoAte: '' }), 'produto', '2027-01-01')).toBe(true);
  });
});
