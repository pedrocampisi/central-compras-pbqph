import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTO-D840 §2.5 e §2.6: as entregas sem o papel do fornecedor e a cobertura de
 * cada entrega, a lógica pura e a leitura do banco. O banco é FALSO, nos nomes
 * do contrato do Banco (D840) e dos pedidos da D845. Obras, empresas e pessoas
 * INVENTADAS.
 */

const banco = vi.hoisted(() => ({
  chamadas: [] as { nome: string; args: Record<string, unknown> }[],
  resposta: { data: [] as unknown, error: null as { message: string } | null },
  mascara: null as string | null,
}));
vi.mock('../../src/services/supabase/client', () => ({
  supabase: {},
  core: () => ({}),
  compras: () => ({
    rpc: async (nome: string, args: Record<string, unknown>) => {
      banco.chamadas.push({ nome, args });
      return banco.resposta;
    },
  }),
}));
vi.mock('../../src/services/storage/umaObra', async (original) => ({
  ...(await original<typeof import('../../src/services/storage/umaObra')>()),
  obraDaMascara: () => banco.mascara,
}));

import {
  NAO_SE_DESFAZ, chaveDaLinha, colunaDoRegistro, coberturaPorEntrega, daObra, emOrdem, problemaDoNaoSeAplica,
  quemEhAEntrega, rotuloDaLinha, textoDaCobertura, type CoberturaDaEntrega, type EntregaSemPapel,
} from '../../src/domain/entregasSemPapel';
import {
  coberturaDaLinha, entregaDaLinha, lerCoberturaDasEntregas, lerEntregasSemPapel, marcarNaoSeAplica,
} from '../../src/services/supabase/entregasSemPapel';

const linha = (o: Partial<EntregaSemPapel>): EntregaSemPapel => ({
  avaliacaoId: 1, ocId: 'oc-1', numero: '2026/101', obra: 'Obra de Teste', fornecedor: 'Fornecedor de Teste',
  fornecedorId: 'forn-1', recebidoEm: '2026-10-10', notaFiscal: '4567', avaliadoPorNome: 'Encarregado de Teste',
  ecrId: 19, ecr: 'ECR 19', nome: 'Cimento (teste)', posicoes: [1], porque: 'nada guardado ainda', linhas: [],
  observacao: '', aCadaEntrega: false, ...o,
});

const cobertura = (o: Partial<CoberturaDaEntrega>): CoberturaDaEntrega => ({
  avaliacaoId: 1, ecrId: 2, situacao: 'sem_papel', documentoId: '', alcance: null, validoAte: '', motivo: '', ...o,
});

beforeEach(() => {
  banco.chamadas = [];
  banco.resposta = { data: [], error: null };
  banco.mascara = null;
});

describe('a lista: a ordem, a máscara e as palavras', () => {
  it('da mais antiga para a mais nova; na mesma entrega, pela ECR', () => {
    const l = emOrdem([
      linha({ avaliacaoId: 3, recebidoEm: '2026-10-12', ecrId: 2 }),
      linha({ avaliacaoId: 1, recebidoEm: '2026-10-09', ecrId: 19 }),
      linha({ avaliacaoId: 1, recebidoEm: '2026-10-09', ecrId: 2 }),
    ]);
    expect(l.map(chaveDaLinha)).toEqual(['1-2', '1-19', '3-2']);
  });

  it('a máscara de uma obra deixa só as linhas das OCs dela; a OC que a tela não conhece fica de fora', () => {
    const obraDaOc = (id: string) => ({ 'oc-1': 'obra-1', 'oc-2': 'obra-2' })[id];
    const todas = [linha({ ocId: 'oc-1' }), linha({ ocId: 'oc-2', avaliacaoId: 2 }), linha({ ocId: 'oc-x', avaliacaoId: 3 })];
    expect(daObra(todas, 'obra-1', obraDaOc).map((l) => l.ocId)).toEqual(['oc-1']);
    expect(daObra(todas, null, obraDaOc)).toHaveLength(3);
  });

  it('a ECR e a entrega numa linha', () => {
    expect(rotuloDaLinha(linha({}))).toBe('ECR 19 — Cimento (teste)');
    expect(rotuloDaLinha(linha({ ecr: '', nome: '', ecrId: 2 }))).toBe('ECR 02');
    expect(quemEhAEntrega(linha({}))).toBe('OC 2026/101 · Fornecedor de Teste · entrega de 10/10/2026');
  });

  it('o "não se aplica" pede o motivo; o aviso diz que a marca não se desfaz', () => {
    expect(problemaDoNaoSeAplica('   ')).toBe('Escreva o motivo: ele fica no registro da entrega.');
    expect(problemaDoNaoSeAplica('é compensado')).toBe('');
    expect(NAO_SE_DESFAZ).toMatch(/^A marca não se desfaz/);
  });
});

describe('a cobertura, para o auditor', () => {
  it('a linha curta por ECR: o papel que cobre, o não se aplica com o motivo, a falta; a que não exige não aparece', () => {
    expect(textoDaCobertura(cobertura({ situacao: 'coberta', alcance: 'lote' }))).toBe('ECR 02: deste lote');
    expect(textoDaCobertura(cobertura({ ecrId: 6, situacao: 'coberta', alcance: 'vale_ate', validoAte: '2027-06-30' }))).toBe(
      'ECR 06: vale até 30/06/2027',
    );
    expect(textoDaCobertura(cobertura({ ecrId: 19 }))).toBe('ECR 19: sem papel');
    expect(textoDaCobertura(cobertura({ ecrId: 6, situacao: 'nao_se_aplica', motivo: ' é compensado ' }))).toBe(
      'ECR 06: não se aplica — é compensado',
    );
    expect(textoDaCobertura(cobertura({ situacao: 'nao_exige' }))).toBe('');
  });

  it('por entrega, pela ECR, sem as que não exigem; a coluna do PDF, uma linha por ECR', () => {
    const m = coberturaPorEntrega([
      cobertura({ avaliacaoId: 1, ecrId: 19 }),
      cobertura({ avaliacaoId: 1, ecrId: 2, situacao: 'coberta', alcance: 'lote' }),
      cobertura({ avaliacaoId: 1, ecrId: 6, situacao: 'nao_exige' }),
      cobertura({ avaliacaoId: 2, ecrId: 6, situacao: 'nao_exige' }),
    ]);
    expect(m.get(1)!.map((c) => c.ecrId)).toEqual([2, 19]);
    expect(m.has(2)).toBe(false);
    expect(colunaDoRegistro(m.get(1))).toBe('ECR 02: deste lote\nECR 19: sem papel');
    expect(colunaDoRegistro(m.get(2))).toBe('—');
  });
});

describe('a leitura do banco, nos nomes do contrato', () => {
  it('a linha da entregas_sem_papel vira a linha da tela, com as palavras da ECR e a marca', () => {
    const l = entregaDaLinha({
      avaliacao_id: 31, oc_id: 'oc-1', numero: '2026/101', versao: 4, obra: 'Obra de Teste', fornecedor: 'Fornecedor de Teste',
      fornecedor_id: 'forn-1', recebido_em: '2026-10-10T00:00:00Z', nota_fiscal: '4567', avaliado_por_nome: 'Encarregado de Teste',
      ecr_id: 2, ecr: 'ECR 02', nome: 'Madeira (teste)', posicoes: [1, 'x', 0], porque: 'a cada entrega',
      o_que_pede: { ecr: 'ECR 02', revisao: '01', itens: [{ rotulo: 'GCA', texto: 'a guia (teste)', numerado: true }] },
      observacao: 'o motorista disse que manda por e-mail (teste)', a_cada_entrega: true,
    });
    expect(l).toEqual({
      avaliacaoId: 31, ocId: 'oc-1', numero: '2026/101', obra: 'Obra de Teste', fornecedor: 'Fornecedor de Teste',
      fornecedorId: 'forn-1', recebidoEm: '2026-10-10', notaFiscal: '4567', avaliadoPorNome: 'Encarregado de Teste',
      ecrId: 2, ecr: 'ECR 02', nome: 'Madeira (teste)', posicoes: [1], porque: 'a cada entrega',
      linhas: [{ rotulo: 'GCA', texto: 'a guia (teste)', numerado: true }],
      observacao: 'o motorista disse que manda por e-mail (teste)', aCadaEntrega: true,
    });
    expect(entregaDaLinha({ a_cada_entrega: 'true' }).aCadaEntrega).toBe(false);
  });

  it('a lista vai com a obra da máscara; sem ela, nula; a falha sobe com a frase do banco', async () => {
    banco.mascara = 'obra-1';
    banco.resposta = { data: [{ avaliacao_id: 31, ecr_id: 2 }, { avaliacao_id: 0, ecr_id: 2 }], error: null };
    expect((await lerEntregasSemPapel()).map((l) => l.avaliacaoId)).toEqual([31]);
    expect(banco.chamadas[0]).toEqual({ nome: 'entregas_sem_papel', args: { p_obra: 'obra-1' } });
    banco.mascara = null;
    await lerEntregasSemPapel();
    expect(banco.chamadas[1]!.args).toEqual({ p_obra: null });
    banco.resposta = { data: null, error: { message: 'sem permissão (teste)' } };
    await expect(lerEntregasSemPapel()).rejects.toThrow('Falha ao ler as entregas sem papel: sem permissão (teste)');
  });

  it('o "não se aplica" vai com a entrega, a ECR e o motivo limpo; a recusa sobe como veio', async () => {
    await marcarNaoSeAplica(31, 6, '  é compensado  ');
    expect(banco.chamadas[0]).toEqual({
      nome: 'marcar_nao_se_aplica', args: { p_avaliacao_id: 31, p_ecr_id: 6, p_motivo: 'é compensado' },
    });
    banco.resposta = { data: null, error: { message: 'A marca já existe (teste).' } };
    await expect(marcarNaoSeAplica(31, 6, 'x')).rejects.toThrow('A marca já existe (teste).');
  });

  it('a cobertura de todas as entregas numa chamada; a situação que a tela não conhece conta como falta', async () => {
    banco.resposta = {
      data: [
        { avaliacao_id: 31, ecr_id: 2, situacao: 'coberta', documento_id: 'doc-1', alcance: 'lote', valido_ate: null },
        { avaliacao_id: 31, ecr_id: 6, situacao: 'nao_se_aplica', motivo: 'é compensado' },
        { avaliacao_id: 32, ecr_id: 19, situacao: 'talvez' },
      ],
      error: null,
    };
    const c = await lerCoberturaDasEntregas('obra-1');
    expect(banco.chamadas[0]).toEqual({ nome: 'cobertura_das_entregas', args: { p_obra: 'obra-1' } });
    expect(c.map((x) => [x.avaliacaoId, x.ecrId, x.situacao])).toEqual([[31, 2, 'coberta'], [31, 6, 'nao_se_aplica'], [32, 19, 'sem_papel']]);
    expect(c[0]).toMatchObject({ documentoId: 'doc-1', alcance: 'lote', validoAte: '' });
    expect(coberturaDaLinha({ situacao: 'coberta', alcance: 'qualquer' }).alcance).toBeNull();
  });
});
