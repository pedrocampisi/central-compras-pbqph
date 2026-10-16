import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';

/**
 * CTO-D845 §2, escolha 2: o número no item Recebimentos do menu, com as
 * entregas sem papel do fornecedor. Só para quem emite OC (a régua da lista no
 * banco). O App de verdade, com sessão e banco FALSOS.
 */

const login = vi.hoisted(() => ({ papel: 'financeiro' }));
const banco = vi.hoisted(() => ({}) as { ler: Mock });

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => ({ access_token: 'falso', user: { id: 'prova', email: 'prova@exemplo.invalid' } }),
  perfilAtual: async () => ({ user_id: 'prova', nome: 'Pessoa de Prova', papel: login.papel, ativo: true }),
  sair: async () => {},
}));
vi.mock('../../src/services/supabase/entregasSemPapel', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/entregasSemPapel')>()),
  lerEntregasSemPapel: (...a: unknown[]) => banco.ler(...a),
}));
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  assinarMudancas: () => () => {},
  carregarDados: async () => ({
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [], obras: [], ecrs: [], ordens_compra: [],
  }),
}));

import App from '../../src/App';
import { useDataStore } from '../../src/stores/useDataStore';
import { useEntregasSemPapelStore } from '../../src/stores/useEntregasSemPapelStore';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

const linha = (avaliacaoId: number, ecrId: number) => ({
  avaliacaoId, ocId: 'oc-1', numero: '2026/101', obra: '', fornecedor: '', fornecedorId: '', recebidoEm: '2026-10-10',
  notaFiscal: '', avaliadoPorNome: '', ecrId, ecr: '', nome: '', posicoes: [], porque: '', linhas: [], observacao: '',
  aCadaEntrega: false,
});

beforeEach(() => {
  useDataStore.setState({ data: null, dirty: false, dirtySince: null });
  useEntregasSemPapelStore.setState({ linhas: null, erro: '', carregando: false });
  banco.ler = vi.fn(async () => [linha(31, 2), linha(31, 19), linha(32, 6)]);
  localStorage.clear();
});

async function itemRecebimentos(papel: string) {
  login.papel = papel;
  render(<App />);
  const menu = await screen.findByRole('navigation');
  await waitFor(() => expect(useDataStore.getState().data).not.toBeNull());
  return within(menu).getByRole('button', { name: /Recebimentos/ });
}

describe('o número no item Recebimentos', () => {
  it('quem emite OC vê quantas linhas estão sem papel', async () => {
    const item = await itemRecebimentos('financeiro');
    await waitFor(() => expect(item.querySelector('[data-contador-sem-papel]')?.textContent).toBe('3'));
  });

  it('sem nenhuma, não aparece número', async () => {
    banco.ler = vi.fn(async () => []);
    const item = await itemRecebimentos('admin');
    await waitFor(() => expect(banco.ler).toHaveBeenCalled());
    expect(item.querySelector('[data-contador-sem-papel]')).toBeNull();
  });

  it('a falha da leitura não inventa número', async () => {
    banco.ler = vi.fn(async () => {
      throw new Error('sem rede (teste)');
    });
    const item = await itemRecebimentos('admin');
    await waitFor(() => expect(useEntregasSemPapelStore.getState().erro).not.toBe(''));
    expect(item.querySelector('[data-contador-sem-papel]')).toBeNull();
  });

  it('quem só lê não vê o número, e a lista nem é pedida', async () => {
    const item = await itemRecebimentos('leitura');
    await new Promise((r) => setTimeout(r, 0));
    expect(item.querySelector('[data-contador-sem-papel]')).toBeNull();
    expect(banco.ler).not.toHaveBeenCalled();
  });
});
