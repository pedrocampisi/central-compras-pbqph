import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// O envio é SIMULADO: nenhum e-mail sai daqui. Apertar com e-mail de verdade é
// ato que sai da máquina, e é do Pedro, na conferência dele (CTO-D541).
const resetPasswordForEmail = vi.fn<(email: string) => Promise<{ error: null }>>(async () => ({ error: null }));
vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { resetPasswordForEmail: (e: string) => resetPasswordForEmail(e) } },
  core: () => ({}),
  compras: () => ({}),
}));

import { LoginPage } from '../../src/features/auth/LoginPage';
import { TEXTOS_DO_ACESSO } from '../../src/features/auth/textosDoAcesso';

const EMAIL = 'alguem@exemplo.test';

beforeEach(() => resetPasswordForEmail.mockClear());

describe('primeiro acesso — a própria frase e um botão para enviar (pendência 9 b e c)', () => {
  it('a frase do primeiro acesso não fala em redefinir, e é diferente da do "esqueci"', () => {
    const pa = TEXTOS_DO_ACESSO['primeiro-acesso'].frase;
    expect(pa).not.toMatch(/redefini/i);
    expect(pa).toMatch(/criar a sua senha/);
    expect(pa).not.toBe(TEXTOS_DO_ACESSO.esqueci.frase);
  });

  it('clicar em Primeiro acesso: some a Senha, aparece a frase e o botão de enviar', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /Primeiro acesso/ }));
    expect(screen.getByRole('heading', { name: 'Primeiro acesso' })).toBeInTheDocument();
    expect(screen.getByText(TEXTOS_DO_ACESSO['primeiro-acesso'].frase)).toBeInTheDocument();
    expect(screen.queryByLabelText('Senha')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Entrar' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Enviar link para criar minha senha' })).toBeInTheDocument();
  });

  it('o botão manda o e-mail digitado — e diz o que aconteceu', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /Primeiro acesso/ }));
    await userEvent.type(screen.getByLabelText('E-mail'), EMAIL);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link para criar minha senha' }));
    expect(resetPasswordForEmail).toHaveBeenCalledTimes(1);
    expect(resetPasswordForEmail).toHaveBeenCalledWith(EMAIL);
    expect(await screen.findByRole('status')).toHaveTextContent(/link para criar a sua senha/);
  });

  it('sem e-mail, não manda nada e pede o e-mail', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /Primeiro acesso/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link para criar minha senha' }));
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o seu e-mail.');
  });

  it('"Esqueci minha senha" tem a frase dele e também manda', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Esqueci minha senha' }));
    expect(screen.getByText(TEXTOS_DO_ACESSO.esqueci.frase)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('E-mail'), EMAIL);
    await userEvent.keyboard('{Enter}');
    expect(resetPasswordForEmail).toHaveBeenCalledWith(EMAIL);
  });

  it('"Voltar para entrar" traz a Senha e o Entrar de volta', async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /Primeiro acesso/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para entrar' }));
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('a tela tem o marco <main> (pendência 9 f)', () => {
    render(<LoginPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
