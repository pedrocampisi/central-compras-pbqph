import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

/**
 * CTO-D814: o perfil com a Ordem de Compra barrada (`core.perfis.sem_ordem_de_compra`)
 * vê o aviso e o "Sair", e não entra. Sem a marca, tudo como hoje. O App de
 * verdade, com sessão e banco FALSOS; pessoas inventadas, endereço `.invalid`.
 */

const login = vi.hoisted(() => ({
  perfil: {} as Record<string, unknown>,
  carregou: 0,
  saiu: 0,
}));

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => ({ access_token: 'falso', user: { id: 'prova', email: 'prova@exemplo.invalid' } }),
  perfilAtual: async () => ({ user_id: 'prova', nome: 'Pessoa de Prova', ativo: true, ...login.perfil }),
  sair: async () => {
    login.saiu++;
  },
}));
vi.mock('../../src/services/supabase/mestres', () => ({ lerMestres: async () => [] }));
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  assinarMudancas: () => () => {},
  carregarDados: async () => {
    login.carregou++;
    return {
      schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
      config: {
        emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
        condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
        texto_qualidade: '', pasta_backups: '',
      },
      fornecedores: [], obras: [], ecrs: [], ordens_compra: [],
    };
  },
}));

import App from '../../src/App';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

const AVISO = /Seu acesso não inclui a Ordem de Compra\./;

beforeEach(() => {
  useDataStore.setState({ data: null, dirty: false, dirtySince: null });
  // O perfil do teste anterior não pode responder por este.
  useAuthStore.setState({ verificando: true, sessao: null, perfil: null });
  localStorage.clear();
  login.carregou = 0;
  login.saiu = 0;
});

describe('CTO-D814 — o perfil sem a Ordem de Compra', () => {
  it('com a marca: o aviso e o "Sair", sem o menu, e nada do banco é lido', async () => {
    login.perfil = { papel: 'engenharia', sem_ordem_de_compra: true };
    render(<App />);
    expect(await screen.findByText(AVISO)).toBeTruthy();
    expect(screen.getByText('prova@exemplo.invalid')).toBeTruthy();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(login.carregou).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    await waitFor(() => expect(login.saiu).toBe(1));
  });

  it('o encarregado com a marca também fica de fora: a trava do banco é dos atos da OC', async () => {
    login.perfil = { papel: 'mestre', sem_ordem_de_compra: true };
    render(<App />);
    expect(await screen.findByText(AVISO)).toBeTruthy();
    expect(screen.queryByText('Material a chegar')).toBeNull();
  });

  it.each([
    ['sem a marca', { papel: 'engenharia', sem_ordem_de_compra: false }],
    ['o perfil de antes, sem a chave', { papel: 'financeiro' }],
  ])('%s: entra como hoje', async (_nome, perfil) => {
    login.perfil = perfil;
    render(<App />);
    expect(await screen.findByRole('navigation')).toBeTruthy();
    await waitFor(() => expect(login.carregou).toBe(1));
    expect(screen.queryByText(AVISO)).toBeNull();
  });
});
