import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

/**
 * Perícia do Codex, 27/09/2026, achado 4 — medida na D603, TRAVA desde a D607
 * (a saída apaga o rascunho, e o rascunho guarda de quem é).
 *
 * O "como conferir" do perito: o App de verdade, a MESMA instância. A conta que
 * revisa abre a ECR e muda um texto; sai; entra outra conta, que não revisa
 * (`pode_revisar_ecr` = false), sem recarregar a página; abre o catálogo. O
 * certo: o rascunho da conta anterior não aparece para a outra.
 *
 * Sessão, perfil e banco são FALSOS: nada sai daqui.
 */

const auth = {
  conta: 'revisor' as 'revisor' | 'outra',
  aoMudar: null as null | ((evento: string, sessao: unknown) => void),
};
const sessaoDe = (conta: string) => ({ access_token: 'falso', user: { id: conta, email: `${conta}@exemplo.invalid` } });

vi.mock('../../src/services/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (f: (evento: string, sessao: unknown) => void) => {
        auth.aoMudar = f;
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
  },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => sessaoDe(auth.conta),
  perfilAtual: async () => ({ user_id: auth.conta, nome: `Pessoa ${auth.conta}`, papel: 'admin', ativo: true }),
  sair: async () => {},
}));
vi.mock('../../src/services/supabase/ecrs', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/ecrs')>()),
  podeRevisarEcr: async () => auth.conta === 'revisor',
}));
vi.mock('../../src/services/pdf/generateEcrPdf', () => ({ baixarPdfDaEcr: vi.fn() }));

import ecrs from '../fixtures/ecrs-03-e-08.json';
import { secoesDoBanco } from '../../src/domain/ecr';
import { normalizeEcr } from '../../src/domain/normalize';
import type { Ecr } from '../../src/domain/types';

function ecr03(): Ecr {
  return {
    ...normalizeEcr({ id: 3, codigo: 'ECR 03', nome: 'Concreto Usinado', categoria: 'Estrutura' }),
    revisao: '00',
    emitida_em: '2026-04-15',
    secoes: secoesDoBanco(ecrs[0]!.secoes),
    revisoes: [],
  };
}

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
    fornecedores: [], obras: [], ecrs: [ecr03()], ordens_compra: [],
  }),
}));

import App from '../../src/App';
import { ABA_INICIAL, useUiStore } from '../../src/stores/useUiStore';
import { useDataStore } from '../../src/stores/useDataStore';
import { useRevisaoEcrStore } from '../../src/stores/useRevisaoEcrStore';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

const RASCUNHO = 'Texto mudado pela conta que revisa, ainda não aprovado.';

beforeEach(() => {
  auth.conta = 'revisor';
  auth.aoMudar = null;
  useDataStore.setState({ data: null, dirty: false, dirtySince: null });
  useUiStore.setState({ activeTab: ABA_INICIAL, catalogoFilter: { search: '' } });
  useRevisaoEcrStore.getState().fechar();
  localStorage.clear();
});

describe('Perícia 27/09, achado 4 — o rascunho da ECR depois da troca de conta', () => {
  it('a outra conta, que não revisa, não encontra o rascunho da conta anterior', async () => {
    render(<App />);
    await screen.findByRole('navigation');
    await act(async () => useUiStore.getState().setActiveTab('catalogo'));
    fireEvent.click(await screen.findByRole('button', { name: 'Editar a ECR 03' }));
    fireEvent.change(screen.getByLabelText('Texto da linha 1 da seção 01'), { target: { value: RASCUNHO } });
    expect(screen.getByDisplayValue(RASCUNHO)).toBeInTheDocument();

    // Sai a conta que revisa; entra outra, na mesma página.
    await act(async () => auth.aoMudar!('SIGNED_OUT', null));
    // A saída, sozinha, já apaga: ninguém entrou ainda.
    expect(useRevisaoEcrStore.getState().rascunho).toBeNull();
    auth.conta = 'outra';
    await act(async () => auth.aoMudar!('SIGNED_IN', sessaoDe('outra')));
    await screen.findByRole('navigation');
    await act(async () => useUiStore.getState().setActiveTab('catalogo'));
    await screen.findByText('Concreto Usinado');
    await act(async () => {});
    // A troca aconteceu: é a outra conta na tela, e ela não tem "Editar".
    expect(screen.getByText('Pessoa outra')).toBeInTheDocument();
    expect(screen.queryByText('Pessoa revisor')).toBeNull();

    const editor = document.querySelector('[data-editor]');
    const rascunhoNaTela = screen.queryByDisplayValue(RASCUNHO);
    expect({ editor: !!editor, rascunhoNaTela: !!rascunhoNaTela }).toEqual({ editor: false, rascunhoNaTela: false });
    // E a loja está vazia: a saída apagou o rascunho, não só o escondeu.
    expect(useRevisaoEcrStore.getState().rascunho).toBeNull();
  });

  it('troca de conta sem passar pela saída: o rascunho da conta anterior também some', async () => {
    render(<App />);
    await screen.findByRole('navigation');
    await act(async () => useUiStore.getState().setActiveTab('catalogo'));
    fireEvent.click(await screen.findByRole('button', { name: 'Editar a ECR 03' }));
    fireEvent.change(screen.getByLabelText('Texto da linha 1 da seção 01'), { target: { value: RASCUNHO } });
    expect(useRevisaoEcrStore.getState().dono).toBe('revisor');

    auth.conta = 'outra';
    await act(async () => auth.aoMudar!('SIGNED_IN', sessaoDe('outra')));
    await screen.findByText('Pessoa outra');
    await act(async () => useUiStore.getState().setActiveTab('catalogo'));
    await screen.findByText('Concreto Usinado');
    await act(async () => {});

    expect(document.querySelector('[data-editor]')).toBeNull();
    expect(screen.queryByDisplayValue(RASCUNHO)).toBeNull();
    expect(useRevisaoEcrStore.getState().rascunho).toBeNull();
  });
});
