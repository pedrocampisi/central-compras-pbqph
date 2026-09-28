import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A camada da qualificação (CTO-D604) contra um banco FALSO que segue o
 * contrato do Banco de 28/09: as vistas, as tabelas dos critérios e as três
 * funções, com os nomes e as chaves exatas. Nenhuma chamada ao banco de
 * verdade.
 */

const banco = vi.hoisted(() => {
  const TABELAS: Record<string, Record<string, unknown>[]> = {};
  const estado = {
    mascara: null as string | null,
    filtros: [] as string[],
    rpc: [] as { nome: string; args: Record<string, unknown> }[],
    resposta: { data: {} as unknown, error: null as null | { code: string; message: string } },
    /** O teto de linhas por resposta da API (a perícia de 28/09, achado 5): sem teto, por padrão. */
    teto: Number.POSITIVE_INFINITY,
  };
  function consulta(tabela: string) {
    let de = 0;
    let ate = Number.POSITIVE_INFINITY;
    let contar = false;
    const filtros: [string, unknown][] = [];
    const c: Record<string, unknown> = {
      select: (_c: string, o?: { count?: string }) => {
        contar = o?.count === 'exact';
        return c;
      },
      order: () => c,
      eq: (col: string, v: unknown) => {
        filtros.push([col, v]);
        estado.filtros.push(`${tabela}.${col}=${String(v)}`);
        return c;
      },
      range: (a: number, b: number) => {
        de = a;
        ate = b;
        return c;
      },
      then: (ok: (v: unknown) => void) => {
        const todas = (TABELAS[tabela] ?? []).filter((l) => filtros.every(([k, v]) => l[k] === v));
        ok({ data: todas.slice(de, Math.min(ate + 1, de + estado.teto)), error: null, ...(contar ? { count: todas.length } : {}) });
      },
    };
    return c;
  }
  return { TABELAS, estado, consulta };
});

vi.mock('../../src/services/supabase/client', () => ({
  supabase: {},
  core: () => ({ from: (t: string) => banco.consulta(t) }),
  compras: () => ({
    from: (t: string) => banco.consulta(t),
    rpc: async (nome: string, args: Record<string, unknown>) => {
      banco.estado.rpc.push({ nome, args });
      return banco.estado.resposta;
    },
  }),
}));
vi.mock('../../src/services/storage/umaObra', () => ({ obraDaMascara: () => banco.estado.mascara }));

import {
  carregarQualificacoes,
  darCienciaTratativa,
  lerAvaliacoesDeEntrega,
  qualificarEmpresa,
  registrarEntrega,
} from '../../src/services/supabase/qualificacao';
import { desempenhoDaFilial, textoDoDesempenho } from '../../src/domain/qualificacao';

const linha = (o: Record<string, unknown>) => ({
  id: 1,
  empresa_raiz_id: 'empresa-a',
  fornecedor_id: null,
  categoria: 'material',
  tipo: 'Tubo',
  qualificada_em: '2026-05-07',
  vence_em: '2027-05-07',
  atende_1: true,
  atende_2: false,
  atende_3: true,
  motivo_1: 'm1',
  motivo_2: 'm2',
  motivo_3: 'm3',
  nota: 2,
  minimo: 2,
  qualificada: true,
  qualificado_por_nome: 'Não anotado na FO 8.4.1.1',
  origem: 'planilha FO 8.4.1.1',
  situacao: 'qualificada',
  ecrs: [19, 12],
  vigente: true,
  ...o,
});

beforeEach(() => {
  for (const k of Object.keys(banco.TABELAS)) delete banco.TABELAS[k];
  Object.assign(banco.TABELAS, {
    qualificacoes_situacao: [linha({}), linha({ id: 2, categoria: 'algo_que_a_tela_nao_conhece' })],
    categorias_qualificacao: [
      { categoria: 'locacao', nome: 'Locação', minimo: 2 },
      { categoria: 'material', nome: 'Materiais', minimo: 2 },
      { categoria: 'controle_tecnologico', nome: 'Controle tecnológico', minimo: 1 },
    ],
    criterios_qualificacao: [
      { categoria: 'material', ordem: 2, texto: 'preço' },
      { categoria: 'material', ordem: 1, texto: 'qualidade' },
      { categoria: 'material', ordem: 3, texto: 'prazo' },
    ],
    tratativas_abertas: [
      { avaliacao_id: 7, oc_id: 'oc-1', numero: '2026/001', intervencao_id: 'obra-a', nao_conformes: 2 },
      { avaliacao_id: 8, oc_id: 'oc-2', numero: '2026/002', intervencao_id: 'obra-b', nao_conformes: 3 },
    ],
    desempenho_12_meses: [{ empresa_raiz_id: 'empresa-a', entregas: 4, no_prazo: 3, inteiras: 4, conformes: 3 }],
    avaliacoes_entrega: [
      { id: 1, oc_id: 'oc-1', intervencao_id: 'obra-a', nota_fiscal: '10', recebido_em: '2026-09-01' },
      { id: 2, oc_id: 'oc-2', intervencao_id: 'obra-b', nota_fiscal: '11', recebido_em: '2026-09-02' },
    ],
  });
  banco.estado.mascara = null;
  banco.estado.filtros = [];
  banco.estado.rpc = [];
  banco.estado.resposta = { data: {}, error: null };
  banco.estado.teto = Number.POSITIVE_INFINITY;
});

describe('D604 — a carga das qualificações', () => {
  it('as linhas no formato da tela: critérios juntos, ECRs em ordem; categoria desconhecida fica de fora', async () => {
    const q = await carregarQualificacoes();
    expect(q.linhas).toHaveLength(1);
    expect(q.linhas[0]).toMatchObject({
      id: 1,
      empresaRaizId: 'empresa-a',
      fornecedorId: null,
      categoria: 'material',
      situacao: 'qualificada',
      ecrs: [12, 19],
      vigente: true,
      criterios: [
        { atende: true, motivo: 'm1' },
        { atende: false, motivo: 'm2' },
        { atende: true, motivo: 'm3' },
      ],
    });
  });

  it('as categorias na ordem das abas da planilha, com os critérios do banco na ordem deles', async () => {
    const q = await carregarQualificacoes();
    expect(q.categorias.map((c) => c.categoria)).toEqual(['material', 'controle_tecnologico', 'locacao']);
    expect(q.categorias[0]).toEqual({ categoria: 'material', nome: 'Materiais', minimo: 2, criterios: ['qualidade', 'preço', 'prazo'] });
    expect(q.categorias[1]!.minimo).toBe(1); // o laboratório segue o PS.02: basta um (D606 2)
  });

  it('com a máscara da D599, as tratativas vêm só da obra dela; a lista de qualificados vem inteira', async () => {
    banco.estado.mascara = 'obra-a';
    const q = await carregarQualificacoes();
    expect(q.tratativas.map((t) => t.avaliacaoId)).toEqual([7]);
    expect(q.linhas).toHaveLength(1);
    expect(banco.estado.filtros).toEqual(['tratativas_abertas.intervencao_id=obra-a']);
  });

  it('as avaliações de entrega para o PDF: todas; com a máscara, só as da obra', async () => {
    expect((await lerAvaliacoesDeEntrega()).map((a) => a.id)).toEqual([1, 2]);
    banco.estado.mascara = 'obra-b';
    expect((await lerAvaliacoesDeEntrega()).map((a) => a.id)).toEqual([2]);
  });
});

describe('D604 — as três escritas, com as chaves do contrato', () => {
  const criterios = [
    { atende: true, motivo: '  atende a ECR  ' },
    { atende: false, motivo: 'caro' },
    { atende: true, motivo: 'no prazo' },
  ];

  it('qualificar material: a empresa, as ECRs, os motivos sem espaço nas pontas; o tipo em branco não vai', async () => {
    banco.estado.resposta = {
      data: { qualificacao_id: 30, nota: 2, minimo: 2, qualificada: true, situacao: 'qualificada', vence_em: '2027-09-28' },
      error: null,
    };
    const r = await qualificarEmpresa({
      sujeito: { empresa_raiz_id: 'empresa-a' },
      categoria: 'material',
      tipo: '  ',
      qualificadaEm: '2026-09-28',
      criterios,
      ecrs: [12, 19],
    });
    expect(banco.estado.rpc).toEqual([
      {
        nome: 'qualificar_empresa',
        args: {
          p: {
            empresa_raiz_id: 'empresa-a',
            categoria: 'material',
            qualificada_em: '2026-09-28',
            criterios: [
              { atende: true, motivo: 'atende a ECR' },
              { atende: false, motivo: 'caro' },
              { atende: true, motivo: 'no prazo' },
            ],
            ecrs: [12, 19],
          },
        },
      },
    ]);
    expect(r).toEqual({ qualificacaoId: 30, nota: 2, minimo: 2, qualificada: true, situacao: 'qualificada', venceEm: '2027-09-28' });
  });

  it('qualificar serviço pelo fornecedor sem raiz: sem ECR (o banco recusa ECR fora de material), com o tipo', async () => {
    await qualificarEmpresa({
      sujeito: { fornecedor_id: 'forn-pf' },
      categoria: 'projeto',
      tipo: 'Projeto elétrico',
      qualificadaEm: '2026-09-28',
      criterios,
      ecrs: [12],
    });
    const p = banco.estado.rpc[0]!.args['p'] as Record<string, unknown>;
    expect(Object.keys(p).sort()).toEqual(['categoria', 'criterios', 'fornecedor_id', 'qualificada_em', 'tipo']);
  });

  it('a recusa do banco sobe como frase de gente', async () => {
    banco.estado.resposta = { data: null, error: { code: '42501', message: 'permission denied' } };
    await expect(
      qualificarEmpresa({ sujeito: { empresa_raiz_id: 'e' }, categoria: 'servico', tipo: '', qualificadaEm: '2026-09-28', criterios, ecrs: [] }),
    ).rejects.toThrow('Só quem pode emitir OC qualifica uma empresa');
  });

  it('registrar a entrega: a OC, a versão e a avaliação; observação e tratativa vazias não vão', async () => {
    banco.estado.resposta = {
      data: { avaliacao_id: 5, status: 'entregue', versao: 4, entregue_em: '2026-09-28', nao_conformes: 0, tratativa_aberta: false },
      error: null,
    };
    const r = await registrarEntrega('oc-1', 3, {
      notaFiscal: ' 1234 ',
      recebidoEm: '2026-09-28',
      prazoConforme: true,
      integridadeConforme: true,
      ocEcrConforme: true,
      observacao: '',
      tratativa: ' ',
    });
    expect(banco.estado.rpc[0]).toEqual({
      nome: 'registrar_entrega',
      args: {
        p_oc_id: 'oc-1',
        p_versao: 3,
        p: { nota_fiscal: '1234', recebido_em: '2026-09-28', prazo_conforme: true, integridade_conforme: true, oc_ecr_conforme: true },
      },
    });
    expect(r).toMatchObject({ avaliacaoId: 5, status: 'entregue', versao: 4, tratativaAberta: false });
  });

  it('a versão velha (40001) diz o que fazer', async () => {
    banco.estado.resposta = { data: null, error: { code: '40001', message: 'versao' } };
    await expect(
      registrarEntrega('oc-1', 3, {
        notaFiscal: '1',
        recebidoEm: '2026-09-28',
        prazoConforme: true,
        integridadeConforme: true,
        ocEcrConforme: true,
        observacao: '',
        tratativa: '',
      }),
    ).rejects.toThrow('Recarregue a página e registre de novo');
  });

  it('dar ciência: a avaliação e a nota; quem não revisa ECR recebe a frase do 42501', async () => {
    await darCienciaTratativa(7, ' visto ');
    expect(banco.estado.rpc[0]).toEqual({ nome: 'dar_ciencia_tratativa', args: { p_avaliacao_id: 7, p_nota: 'visto' } });
    banco.estado.resposta = { data: null, error: { code: '42501', message: 'x' } };
    await expect(darCienciaTratativa(7, 'visto')).rejects.toThrow('Só quem revisa as ECRs dá ciência de tratativa');
  });
});

/** Perícia de 28/09 sobre `fe119e6..ebbebb0` (fornecedores): a medida, SEM conserto. */
describe('Perícia 28/09 (fornecedores), achado 5 — o desempenho com mais linhas que o teto da API', () => {
  it.fails('1.001 sujeitos com entregas e teto de 1.000: o 1.001º não vira "nenhuma entrega"', async () => {
    banco.estado.teto = 1000;
    banco.TABELAS['desempenho_12_meses'] = Array.from({ length: 1001 }, (_, i) => ({
      empresa_raiz_id: `empresa-${i + 1}`, fornecedor_id: null, entregas: 2, no_prazo: 2, inteiras: 2, conformes: 2,
    }));
    const r = await carregarQualificacoes().catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))));
    if (r instanceof Error) return; // recusar a carga incompleta também é certo
    const d = desempenhoDaFilial({ id: 'filial-x', empresa_id: 'empresa-1001' }, r.desempenho);
    expect(textoDoDesempenho(d)).not.toBe('Nenhuma entrega avaliada nos últimos 12 meses.');
  });

  it('controle: com 1.000 (cabe no teto), o último sujeito tem as entregas dele', async () => {
    banco.estado.teto = 1000;
    banco.TABELAS['desempenho_12_meses'] = Array.from({ length: 1000 }, (_, i) => ({
      empresa_raiz_id: `empresa-${i + 1}`, fornecedor_id: null, entregas: 2, no_prazo: 2, inteiras: 2, conformes: 2,
    }));
    const r = await carregarQualificacoes();
    const d = desempenhoDaFilial({ id: 'filial-x', empresa_id: 'empresa-1000' }, r.desempenho);
    expect(textoDoDesempenho(d)).toContain('2 entregas avaliadas');
  });
});
