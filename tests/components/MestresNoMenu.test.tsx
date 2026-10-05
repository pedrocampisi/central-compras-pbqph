import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';

/**
 * CTO-D696 §4: a tela "Mestres" é de admin e engenharia (`pode_gerir_mestre`
 * no banco). Os outros papéis não veem o menu, nem a tela se a pedirem. O App
 * de verdade, com sessão e banco FALSOS.
 */

const login = vi.hoisted(() => ({ papel: 'engenharia' }));

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
vi.mock('../../src/services/supabase/mestres', () => ({ lerMestres: async () => [] }));
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
import { useUiStore } from '../../src/stores/useUiStore';
import { useDataStore } from '../../src/stores/useDataStore';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

beforeEach(() => {
  useDataStore.setState({ data: null, dirty: false, dirtySince: null });
  localStorage.clear();
});

async function menuDe(papel: string) {
  login.papel = papel;
  render(<App />);
  const menu = await screen.findByRole('navigation');
  await waitFor(() => expect(useDataStore.getState().data).not.toBeNull());
  const botao = within(menu).queryByRole('button', { name: 'Mestres' });
  // Pede a tela mesmo sem o botão (um link guardado, a aba de antes): ela não pode abrir.
  act(() => useUiStore.setState({ activeTab: 'mestres' }));
  return botao;
}

describe('a tela Mestres, por papel', () => {
  it('engenharia vê o menu e a tela', async () => {
    expect(await menuDe('engenharia')).not.toBeNull();
    expect(await screen.findByRole('heading', { name: 'Mestres de obra' })).toBeTruthy();
  });

  it.each(['financeiro', 'leitura'])('%s não vê o menu, nem a tela pedida', async (papel) => {
    expect(await menuDe(papel)).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Mestres de obra' })).toBeNull();
  });
});
