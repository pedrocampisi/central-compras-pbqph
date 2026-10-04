import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTO-D696 §4: o acesso do mestre do lado do engenheiro, contra o contrato das
 * três portas do Banco (D696), com banco e função de borda FALSOS. Pessoas,
 * obras e códigos inventados; endereços `.invalid`.
 */

const banco = vi.hoisted(() => ({
  tabelas: {} as Record<string, Record<string, unknown>[]>,
  filtros: [] as string[],
  rpc: [] as { nome: string; args: Record<string, unknown> }[],
  respostaRpc: { data: null as unknown, error: null as null | { code: string; message: string } },
  verify: [] as Record<string, unknown>[],
  respostaVerify: [] as (null | { message: string; status?: number })[],
}));

function consulta(tabela: string) {
  const filtros: [string, unknown][] = [];
  const c: Record<string, unknown> = {
    select: () => c,
    order: () => c,
    eq: (col: string, v: unknown) => {
      filtros.push([col, v]);
      banco.filtros.push(`${tabela}.${col}=${String(v)}`);
      return c;
    },
    is: (col: string, v: unknown) => {
      filtros.push([col, v]);
      banco.filtros.push(`${tabela}.${col} is ${String(v)}`);
      return c;
    },
    range: () => c,
    then: (ok: (v: unknown) => void) => {
      const linhas = (banco.tabelas[tabela] ?? []).filter((l) => filtros.every(([k, v]) => (l[k] ?? null) === v));
      ok({ data: linhas, error: null, count: linhas.length });
    },
  };
  return c;
}

vi.mock('../../src/services/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: { access_token: 'token-de-teste' } } }),
      verifyOtp: async (args: Record<string, unknown>) => {
        banco.verify.push(args);
        const r = banco.respostaVerify.length > 1 ? banco.respostaVerify.shift()! : banco.respostaVerify[0] ?? null;
        return { data: {}, error: r };
      },
    },
  },
  core: () => ({
    from: consulta,
    rpc: async (nome: string, args: Record<string, unknown>) => {
      banco.rpc.push({ nome, args });
      return banco.respostaRpc;
    },
  }),
  compras: () => ({}),
}));

import {
  cadastrarMestre, desligarMestre, entrarComOQr, gerarQr, lerMestres, porNaObra, religarMestre, tirarDaObra,
} from '../../src/services/supabase/mestres';

const funcao = { chamadas: [] as { url: string; corpo: Record<string, unknown> }[], resposta: { status: 200, corpo: {} as unknown } as { status: number; corpo: unknown } | 'cai' };
const fetchFalso = vi.fn(async (url: string, init: RequestInit) => {
  funcao.chamadas.push({ url, corpo: JSON.parse(String(init.body)) as Record<string, unknown> });
  if (funcao.resposta === 'cai') throw new TypeError('Failed to fetch');
  const r = funcao.resposta;
  return { status: r.status, json: async () => r.corpo } as Response;
});

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://banco-de-teste.invalid');
  vi.stubGlobal('fetch', fetchFalso);
  funcao.chamadas.length = 0;
  funcao.resposta = { status: 200, corpo: {} };
  banco.tabelas = {};
  banco.filtros = [];
  banco.rpc = [];
  banco.respostaRpc = { data: null, error: null };
  banco.verify = [];
  banco.respostaVerify = [null];
});

describe('a lista dos mestres', () => {
  it('só papel mestre; as obras abertas; o último QR; o motivo de quem está desligado; ativos primeiro', async () => {
    banco.tabelas = {
      equipe: [
        { user_id: 'm-2', nome: 'Bruno de Teste', papel: 'mestre', ativo: false },
        { user_id: 'm-1', nome: 'Carlos de Teste', papel: 'mestre', ativo: true },
        { user_id: 'm-3', nome: 'Ana de Teste', papel: 'mestre', ativo: true },
        { user_id: 'eng', nome: 'Engenheira de Teste', papel: 'engenharia', ativo: true },
      ],
      mestre_da_obra: [
        { id: 7, user_id: 'm-1', intervencao_id: 'obra-1', desde: '2026-10-01T10:00:00Z', ate: null },
        { id: 8, user_id: 'm-1', intervencao_id: 'obra-2', desde: '2026-10-02T10:00:00Z', ate: null },
      ],
      acesso_do_mestre: [
        { id: 1, mestre: 'm-1', evento: 'qr_gerado', por_nome: 'Engenheira de Teste', em: '2026-10-02T10:00:00Z' },
        { id: 2, mestre: 'm-1', evento: 'qr_gerado', por_nome: 'Outra Pessoa', em: '2026-10-04T10:00:00Z' },
        { id: 3, mestre: 'm-2', evento: 'desligado', por_nome: 'Engenheira de Teste', em: '2026-10-03T10:00:00Z', motivo: 'saiu da empresa' },
      ],
    };
    const lista = await lerMestres();
    expect(banco.filtros).toEqual(expect.arrayContaining(['equipe.papel=mestre', 'mestre_da_obra.ate is null']));
    expect(lista.map((m) => m.nome)).toEqual(['Ana de Teste', 'Carlos de Teste', 'Bruno de Teste']);
    expect(lista[1]).toEqual({
      userId: 'm-1', nome: 'Carlos de Teste', ativo: true,
      obras: [
        { vinculo: 7, obraId: 'obra-1', desde: '2026-10-01T10:00:00Z' },
        { vinculo: 8, obraId: 'obra-2', desde: '2026-10-02T10:00:00Z' },
      ],
      ultimoQr: { porNome: 'Outra Pessoa', em: '2026-10-04T10:00:00Z' },
      motivoDesligado: '',
    });
    expect(lista[2]).toMatchObject({ ativo: false, motivoDesligado: 'saiu da empresa', ultimoQr: null });
  });
});

describe('a função acesso-do-mestre', () => {
  it('cadastrar: o nome sem espaço nas pontas; e-mail, telefone e obra vazios não vão', async () => {
    funcao.resposta = { status: 200, corpo: { user_id: 'm-9', nome: 'Davi de Teste' } };
    const r = await cadastrarMestre({ nome: '  Davi de Teste ', email: ' ', telefone: '', obraId: '' });
    expect(funcao.chamadas[0]!.url).toBe('https://banco-de-teste.invalid/functions/v1/acesso-do-mestre');
    expect(funcao.chamadas[0]!.corpo).toEqual({ acao: 'cadastrar', nome: 'Davi de Teste' });
    expect(r).toEqual({ userId: 'm-9', aviso: '' });
  });

  it('cadastrar com tudo; o aviso de quando a obra não foi volta', async () => {
    funcao.resposta = { status: 200, corpo: { user_id: 'm-9', aviso: 'O mestre foi cadastrado, mas não entrou na obra: x' } };
    const r = await cadastrarMestre({ nome: 'Davi', email: 'davi@exemplo.invalid', telefone: '11 90000-0000', obraId: 'obra-1' });
    expect(funcao.chamadas[0]!.corpo).toEqual({
      acao: 'cadastrar', nome: 'Davi', email: 'davi@exemplo.invalid', telefone: '11 90000-0000', obra: 'obra-1',
    });
    expect(r.aviso).toMatch(/não entrou na obra/);
  });

  it('a recusa diz a frase da função (403 de quem não pode; 409 do desligado)', async () => {
    funcao.resposta = { status: 403, corpo: { erro: 'Só admin e engenharia cuidam do acesso do mestre.' } };
    await expect(gerarQr('m-1')).rejects.toThrow('Só admin e engenharia cuidam do acesso do mestre.');
    funcao.resposta = { status: 409, corpo: { erro: 'Mestre desligado.' } };
    await expect(gerarQr('m-1')).rejects.toThrow('Mestre desligado.');
    funcao.resposta = { status: 500, corpo: {} };
    await expect(gerarQr('m-1')).rejects.toThrow('O servidor recusou (500).');
  });

  it('sem rede: a frase de sem sinal', async () => {
    funcao.resposta = 'cai';
    await expect(gerarQr('m-1')).rejects.toThrow('Sem sinal para falar com o servidor. Tente de novo.');
  });

  it('gerar o QR: o id do mestre; volta o link e quando vence; sem link, erro', async () => {
    funcao.resposta = { status: 200, corpo: { link: 'https://banco-de-teste.invalid/auth/v1/verify?token=x', vence_em: '2026-10-04T16:00:00Z' } };
    expect(await gerarQr('m-1')).toEqual({
      link: 'https://banco-de-teste.invalid/auth/v1/verify?token=x', venceEm: '2026-10-04T16:00:00Z',
    });
    expect(funcao.chamadas[0]!.corpo).toEqual({ acao: 'gerar_qr', mestre: 'm-1' });
    funcao.resposta = { status: 200, corpo: {} };
    await expect(gerarQr('m-1')).rejects.toThrow('O servidor não devolveu o acesso. Tente de novo.');
  });
});

describe('as funções do banco', () => {
  it('pôr e tirar da obra, desligar e religar: os nomes e as chaves do contrato; motivo sem espaço nas pontas', async () => {
    await porNaObra('m-1', 'obra-1');
    await tirarDaObra(7, '  terminou a obra ');
    await desligarMestre('m-1', ' saiu ');
    await religarMestre('m-1');
    expect(banco.rpc).toEqual([
      { nome: 'por_mestre_na_obra', args: { p_mestre: 'm-1', p_obra: 'obra-1' } },
      { nome: 'tirar_mestre_da_obra', args: { p_id: 7, p_motivo: 'terminou a obra' } },
      { nome: 'desligar_mestre', args: { p_mestre: 'm-1', p_motivo: 'saiu' } },
      { nome: 'religar_mestre', args: { p_mestre: 'm-1' } },
    ]);
  });

  it('a recusa sobe com a frase do banco', async () => {
    banco.respostaRpc = { data: null, error: { code: '22023', message: 'Escreva o motivo de desligar.' } };
    await expect(desligarMestre('m-1', '')).rejects.toThrow('Escreva o motivo de desligar.');
  });
});

describe('o mestre entra com o código do QR', () => {
  const acesso = { codigo: 'c'.repeat(56), tipo: 'magiclink' };

  it('manda o código e o tipo ao login', async () => {
    await entrarComOQr(acesso);
    expect(banco.verify).toEqual([{ token_hash: 'c'.repeat(56), type: 'magiclink' }]);
  });

  it('pedir duas vezes o mesmo código (a tela que monta duas vezes) não gasta o QR outra vez', async () => {
    const a = { codigo: 'd'.repeat(56), tipo: 'magiclink' };
    await Promise.all([entrarComOQr(a), entrarComOQr(a)]);
    await entrarComOQr(a);
    expect(banco.verify).toHaveLength(1);
  });

  it('usado ou vencido: diz para pedir outro; sem rede: diz sem sinal; e a que falhou pode tentar de novo', async () => {
    const a = { codigo: 'e'.repeat(56), tipo: 'magiclink' };
    banco.respostaVerify = [{ message: 'Token has expired or is invalid', status: 403 }];
    await expect(entrarComOQr(a)).rejects.toThrow('Este QR já foi usado ou venceu. Peça outro ao engenheiro.');
    banco.respostaVerify = [{ message: 'Failed to fetch', status: 0 }];
    await expect(entrarComOQr(a)).rejects.toThrow('Sem sinal para entrar. Chegue perto do sinal e tente de novo.');
    banco.respostaVerify = [null];
    await entrarComOQr(a);
    expect(banco.verify).toHaveLength(3);
  });
});
