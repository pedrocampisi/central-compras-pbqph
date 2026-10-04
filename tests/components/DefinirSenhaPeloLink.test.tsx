import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * CTO-D700: a metade que RECEBE o link do "Esqueci minha senha". Até hoje o
 * link caía na Central, e a tela "Definir nova senha" da OC nunca rodou na
 * produção. Aqui o App de verdade recebe o evento de recuperação SIMULADO
 * (o que a biblioteca do login dispara quando a pessoa chega pelo link): sem
 * e-mail, sem login de verdade, sem senha de ninguém — as do teste são
 * inventadas e não saem daqui.
 */

const login = vi.hoisted(() => ({
  aoMudar: null as null | ((evento: string, sessao: unknown) => void),
  updateUser: vi.fn<(p: { password: string }) => Promise<{ error: { message: string } | null }>>(async () => ({ error: null })),
}));

vi.mock('../../src/services/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (evento: string, sessao: unknown) => void) => {
        login.aoMudar = cb;
        return { data: { subscription: { unsubscribe() {} } } };
      },
      updateUser: (p: { password: string }) => login.updateUser(p),
    },
  },
  core: () => ({}),
  compras: () => ({}),
}));
const SESSAO = { access_token: 'falso', user: { id: 'prova', email: 'prova@exemplo.invalid' } };
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => SESSAO,
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
import { ABA_INICIAL, useUiStore } from '../../src/stores/useUiStore';
import { useDataStore } from '../../src/stores/useDataStore';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

const SENHA = 'senha-inventada-do-teste';

beforeEach(() => {
  login.aoMudar = null;
  login.updateUser.mockReset();
  login.updateUser.mockImplementation(async () => ({ error: null }));
  useDataStore.setState({ data: null, dirty: false, dirtySince: null });
  useUiStore.setState({ activeTab: ABA_INICIAL, toasts: [] });
  localStorage.clear();
});

/** A pessoa chega pelo link do e-mail: a biblioteca abre a sessão e diz "recuperação". */
async function chegarPeloLink() {
  render(<App />);
  await screen.findByRole('navigation');
  expect(login.aoMudar).toBeTypeOf('function');
  act(() => login.aoMudar!('PASSWORD_RECOVERY', SESSAO));
  await screen.findByRole('heading', { name: 'Definir nova senha' });
}

async function gravar(senha: string, repetida = senha) {
  await userEvent.type(screen.getByLabelText('Nova senha'), senha);
  await userEvent.type(screen.getByLabelText('Repita a nova senha'), repetida);
  await userEvent.click(screen.getByRole('button', { name: 'Salvar senha e entrar' }));
}

describe('D700 — quem chega pelo link do "Esqueci" define a senha na própria OC', () => {
  it('o evento de recuperação abre "Definir nova senha", e não a OC', async () => {
    await chegarPeloLink();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.getByLabelText('Nova senha')).toHaveAttribute('type', 'password');
  });

  it('a senha nova vai para o login, e depois a pessoa entra na OC', async () => {
    await chegarPeloLink();
    await gravar(SENHA);
    expect(login.updateUser).toHaveBeenCalledWith({ password: SENHA });
    expect(await screen.findByRole('navigation')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Definir nova senha' })).toBeNull();
    expect(useUiStore.getState().toasts.map((t) => t.message)).toContain('Senha definida com sucesso!');
  });

  it('se a gravação falha, a tela diz o que houve, e a pessoa tenta de novo sem ficar presa', async () => {
    login.updateUser.mockImplementationOnce(async () => ({
      error: { message: 'New password should be different from the old password.' },
    }));
    await chegarPeloLink();
    await gravar(SENHA);
    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('A senha nova precisa ser diferente da antiga.');
    const botao = screen.getByRole('button', { name: 'Salvar senha e entrar' });
    expect(botao).toBeEnabled();

    await userEvent.click(botao);
    expect(login.updateUser).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole('navigation')).toBeInTheDocument();
  });

  it('as duas senhas diferentes, ou curta: avisa e não manda nada ao login', async () => {
    await chegarPeloLink();
    await gravar(SENHA, `${SENHA}-outra`);
    expect(screen.getByRole('alert')).toHaveTextContent('As duas senhas não conferem.');
    expect(login.updateUser).not.toHaveBeenCalled();
  });
});
