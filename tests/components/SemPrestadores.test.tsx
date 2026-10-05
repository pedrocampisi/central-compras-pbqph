import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

/**
 * A aba "Prestadores" saiu da OC (CTO-D585, palavra do Pedro em 27/09/2026:
 * "TIRE a aba de prestadores de serviço, não faz sentido ter aqui"). O teste
 * monta o `App` de verdade, com sessão e banco FALSOS: nada sai daqui.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => ({ access_token: 'falso', user: { id: 'prova', email: 'prova@exemplo.invalid' } }),
  perfilAtual: async () => ({ user_id: 'prova', nome: 'Pessoa de Prova', papel: 'admin', ativo: true }),
  sair: async () => {},
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
import { ABA_INICIAL, abaQueExiste, useUiStore } from '../../src/stores/useUiStore';
import { useDataStore } from '../../src/stores/useDataStore';

async function abrirOc() {
  render(<App />);
  const menu = await screen.findByRole('navigation');
  await screen.findByText('Nenhuma OC ainda');
  return menu;
}

// O jsdom não tem `matchMedia` (o tema do Windows): claro, sempre.
window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

beforeEach(() => {
  useDataStore.setState({ data: null, dirty: false, dirtySince: null });
  useUiStore.setState({ activeTab: ABA_INICIAL });
  localStorage.clear();
});

describe('D585 — a aba Prestadores saiu', () => {
  it('o menu não tem "Prestadores", e as outras abas ficam (a Qualificação entrou depois de Fornecedores, D661)', async () => {
    const menu = await abrirOc();
    const abas = within(menu).getAllByRole('button').map((b) => b.textContent?.trim());
    expect(abas).toEqual(['Dashboard', 'Nova OC', 'Histórico', 'Recebimentos', 'Fornecedores', 'Qualificação', 'Obras', 'Mestres', 'Catálogo de ECRs', 'Configurações']);
    expect(screen.queryByText(/Prestadores/)).toBeNull();
  });

  it('quem ainda pedir a aba "prestadores" cai na tela inicial, e nunca numa tela em branco', async () => {
    // O pedido velho chega de dois jeitos: a loja com a aba antiga, e a chave
    // de preferências antiga no navegador (que nenhum código lê hoje).
    localStorage.setItem('central-compras-ui-v1', JSON.stringify({ activeTab: 'prestadores' }));
    useUiStore.setState({ activeTab: 'prestadores' as never });
    await abrirOc();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Últimas Ordens de Compra')).toBeInTheDocument();
  });

  it('pedir a aba que saiu pela loja também leva à tela inicial', () => {
    useUiStore.getState().setActiveTab('prestadores' as never);
    expect(useUiStore.getState().activeTab).toBe('dashboard');
    expect(abaQueExiste('prestadores')).toBe('dashboard');
    expect(abaQueExiste('historico')).toBe('historico');
  });
});
