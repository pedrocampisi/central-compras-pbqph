import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Pendência 30 (CTO-D853, D855): a OC nova nasce com a mesma hora no
 * `criado_em` e no `atualizado_em`. Com duas leituras do relógio, as duas
 * caíam em milissegundos diferentes de vez em quando, e o título dizia
 * "Editar OC" numa OC em branco. Aqui o relógio anda 1 ms a CADA leitura: com
 * duas leituras, o título erra sempre. O `App` de verdade, com sessão e banco
 * FALSOS, como no `TituloUmaVez`.
 */

const relogio = vi.hoisted(() => ({ ms: Date.UTC(2026, 9, 16, 12, 0, 0) }));
vi.mock('../../src/domain/format', async (original) => ({
  ...(await original<typeof import('../../src/domain/format')>()),
  nowIso: () => new Date(relogio.ms++).toISOString(),
}));

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
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUiStore } from '../../src/stores/useUiStore';

// O jsdom não tem `matchMedia` (o tema do Windows): claro, sempre.
window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

describe('a OC nova nasce com uma hora só (pendência 30)', () => {
  it('com o relógio andando entre uma leitura e outra, o título é "Nova Ordem de Compra", e não "Editar OC"', async () => {
    useUiStore.setState({ activeTab: 'dashboard' });
    render(<App />);
    await screen.findByText('Nenhuma OC ainda');
    await act(async () => {
      useUiStore.getState().setActiveTab('nova-oc');
    });
    expect(document.querySelector('main')!.querySelector('h2')?.textContent?.trim()).toBe('Nova Ordem de Compra');
    const oc = useOcEditingStore.getState().ocEditing!;
    expect(oc.criado_em).toBe(oc.atualizado_em);
  });
});
