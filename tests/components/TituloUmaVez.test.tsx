import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * CTO-D643: o título de cada tela aparece uma vez só. A palavra do Pedro: "tem
 * outra coisa zuada na UI, os titulos estão duplicados" — "Nova Ordem de
 * Compra" na barra do alto e no cabeçalho da página. O título fica no
 * cabeçalho da página (o que traz o subtítulo e os botões); a barra fica com
 * "Central de Compras" e o estado do banco. O `App` de verdade, com sessão e
 * banco FALSOS: nada sai daqui.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } },
  core: () => ({ rpc: async () => ({ data: false, error: null }) }),
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
import { useUiStore, type TabId } from '../../src/stores/useUiStore';

// O jsdom não tem `matchMedia` (o tema do Windows): claro, sempre.
window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

const TELAS: [TabId, string][] = [
  ['dashboard', 'Dashboard'],
  ['nova-oc', 'Nova Ordem de Compra'],
  ['historico', 'Histórico de OCs'],
  ['fornecedores', 'Fornecedores'],
  ['obras', 'Obras'],
  ['catalogo', 'Catálogo de ECRs'],
  ['config', 'Configurações'],
];

/** Os textos da barra do alto e da página (o menu da esquerda fica de fora: lá o nome é o botão da aba). */
function vezes(titulo: string): number {
  return [...document.querySelectorAll('header *, main *')].filter(
    (e) => e.children.length === 0 && e.textContent?.trim() === titulo,
  ).length;
}

describe('CTO-D643 — o título de cada tela aparece uma vez só', () => {
  it.each(TELAS)('%s: "%s" uma vez, no cabeçalho da página, e nunca na barra do alto', async (aba, titulo) => {
    useUiStore.setState({ activeTab: 'dashboard' });
    render(<App />);
    await screen.findByText('Nenhuma OC ainda');
    await act(async () => {
      useUiStore.getState().setActiveTab(aba);
    });
    expect(vezes(titulo), `"${titulo}" entre a barra e a página`).toBe(1);
    expect(document.querySelector('main')!.querySelector('h2')?.textContent?.trim()).toBe(titulo);
    const barra = document.querySelector('header')!.textContent ?? '';
    expect(barra).not.toContain(titulo);
    expect(barra).toContain('Central de Compras');
  });
});
