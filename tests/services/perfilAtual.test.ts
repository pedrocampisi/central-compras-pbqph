import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTO-D814: o perfil vem com a marca `sem_ordem_de_compra`. O banco que ainda
 * não tem a coluna (42703) não pode deixar ninguém de fora: a leitura volta à
 * de antes. Banco FALSO; pessoas inventadas.
 */

const banco = vi.hoisted(() => ({
  colunas: [] as string[],
  respostas: [] as { data: unknown; error: null | { code?: string; message: string } }[],
}));

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getUser: async () => ({ data: { user: { id: 'prova' } } }) } },
  core: () => ({
    from: () => {
      const c = {
        select: (colunas: string) => {
          banco.colunas.push(colunas);
          return c;
        },
        eq: () => c,
        maybeSingle: async () => banco.respostas.shift()!,
      };
      return c;
    },
  }),
  compras: () => ({}),
}));

import { perfilAtual } from '../../src/services/supabase/auth';

const PERFIL = { user_id: 'prova', nome: 'Pessoa de Prova', papel: 'engenharia', ativo: true };

beforeEach(() => {
  banco.colunas = [];
  banco.respostas = [];
});

describe('CTO-D814 — a marca no perfil', () => {
  it('lê a marca junto com o perfil', async () => {
    banco.respostas = [{ data: { ...PERFIL, sem_ordem_de_compra: true }, error: null }];
    expect(await perfilAtual()).toEqual({ ...PERFIL, sem_ordem_de_compra: true });
    expect(banco.colunas).toEqual(['user_id, nome, papel, ativo, sem_ordem_de_compra']);
  });

  it('a marca só barra quando é verdadeira de fato', async () => {
    banco.respostas = [{ data: { ...PERFIL, sem_ordem_de_compra: null }, error: null }];
    expect((await perfilAtual())!.sem_ordem_de_compra).toBe(false);
  });

  it('o banco sem a coluna (42703): lê como antes, e entra', async () => {
    banco.respostas = [
      { data: null, error: { code: '42703', message: 'column perfis.sem_ordem_de_compra does not exist' } },
      { data: PERFIL, error: null },
    ];
    expect(await perfilAtual()).toEqual({ ...PERFIL, sem_ordem_de_compra: false });
    expect(banco.colunas).toEqual(['user_id, nome, papel, ativo, sem_ordem_de_compra', 'user_id, nome, papel, ativo']);
  });

  it('outra falha não é a coluna: avisa, como antes', async () => {
    banco.respostas = [{ data: null, error: { code: '57014', message: 'tempo esgotado' } }];
    await expect(perfilAtual()).rejects.toThrow('Falha ao carregar seu perfil: tempo esgotado');
    expect(banco.colunas).toHaveLength(1);
  });

  it('o perfil inativo, ou nenhum: sem acesso, como antes', async () => {
    banco.respostas = [{ data: { ...PERFIL, ativo: false, sem_ordem_de_compra: false }, error: null }, { data: null, error: null }];
    expect(await perfilAtual()).toBeNull();
    expect(await perfilAtual()).toBeNull();
  });
});
