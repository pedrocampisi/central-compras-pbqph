import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CartaoAChegar } from '../../src/domain/recebimento';
import { guardaNaMemoria } from '../../src/services/guardaDoAparelho';

/**
 * CTO-D696 §5.2: a tela do mestre ligada ao banco, e a porta do App. O banco é
 * FALSO (o serviço do recebimento e o login, deste teste). Pedido, obra e
 * pessoa são inventados.
 */

const servico = vi.hoisted(() => ({
  lerMaterialAChegar: vi.fn(),
  registrarEntregaDoMestre: vi.fn(async () => ''),
  registrarSemPedidoDoMestre: vi.fn(async () => undefined),
  lerNumeroDaNotaNaFoto: vi.fn(async () => ''),
}));
vi.mock('../../src/services/supabase/recebimento', () => servico);

const login = vi.hoisted(() => ({ papel: 'mestre', carregarDados: vi.fn() }));
vi.mock('../../src/services/supabase/client', () => ({
  supabase: {
    auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
  },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => ({ access_token: 'falso', user: { id: 'mestre-de-teste', email: 'm@exemplo.invalid' } }),
  perfilAtual: async () => ({ user_id: 'mestre-de-teste', nome: 'Mestre de Teste', papel: login.papel, ativo: true }),
  sair: async () => {},
}));
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  assinarMudancas: () => () => {},
  carregarDados: login.carregarDados,
}));
// A guarda do celular de verdade é o IndexedDB, que o jsdom não tem: aqui, a da memória.
const celular = vi.hoisted(() => ({ guarda: null as null | ReturnType<typeof import('../../src/services/guardaDoAparelho')['guardaNaMemoria']> }));
vi.mock('../../src/services/guardaDoAparelho', async (original) => {
  const o = await original<typeof import('../../src/services/guardaDoAparelho')>();
  return { ...o, guardaDoAparelho: () => celular.guarda ?? o.guardaNaMemoria() };
});

import App from '../../src/App';
import { TelaDoMestre, CHAVE_DA_LISTA } from '../../src/features/recebimento/TelaDoMestre';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

const CARTAO: CartaoAChegar = {
  ocId: 'oc-1', intervencaoId: 'obra-1', obra: 'Obra de Teste', numero: '2026/101',
  fornecedor: 'Fornecedor de Teste', combinadoPara: '', total: 100,
  itens: [{ descricao: 'Cimento de teste', quantidade: 2, unidade: 'sc' }],
};

beforeEach(() => {
  celular.guarda = guardaNaMemoria();
  servico.lerMaterialAChegar.mockReset();
  servico.lerMaterialAChegar.mockResolvedValue({ cartoes: [CARTAO], obras: [{ id: 'obra-1', nome: 'Obra de Teste' }] });
  servico.registrarEntregaDoMestre.mockClear();
  login.papel = 'mestre';
  login.carregarDados.mockReset();
});

describe('a tela do mestre, ligada ao banco', () => {
  it('lê a lista, mostra a obra e o pedido, e guarda a lista no celular', async () => {
    render(<TelaDoMestre aoSair={() => {}} guarda={celular.guarda!} />);
    expect(await screen.findByText('Fornecedor de Teste')).toBeTruthy();
    expect(screen.getByText('Obra de Teste')).toBeTruthy();
    await waitFor(async () => expect(await celular.guarda!.ler(CHAVE_DA_LISTA)).toBeTruthy());
  });

  it('a obra sem pedido a caminho aparece com o nome no "Em qual obra?" (Banco-D710)', async () => {
    servico.lerMaterialAChegar.mockResolvedValue({
      cartoes: [CARTAO],
      obras: [{ id: 'obra-2', nome: 'Obra Sem Pedido' }, { id: 'obra-1', nome: 'Obra de Teste' }],
    });
    render(<TelaDoMestre aoSair={() => {}} guarda={celular.guarda!} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Chegou material sem pedido' }));
    const grupo = await screen.findByRole('group', { name: 'Em qual obra?' });
    expect(within(grupo).getAllByRole('button').map((b) => b.textContent?.trim())).toEqual([
      'Obra Sem Pedido', 'Obra de Teste',
    ]);
  });

  it('sem sinal, com a lista guardada: mostra a de antes, e diz de que hora ela é', async () => {
    await celular.guarda!.gravar(CHAVE_DA_LISTA, {
      cartoes: [CARTAO], obras: [{ id: 'obra-1', nome: 'Obra de Teste' }], lidaEm: '2026-10-04T17:05:00.000Z',
    });
    servico.lerMaterialAChegar.mockRejectedValue(new Error('Failed to fetch'));
    render(<TelaDoMestre aoSair={() => {}} guarda={celular.guarda!} />);
    expect(await screen.findByText('Fornecedor de Teste')).toBeTruthy();
    expect(await screen.findByText('Sem sinal. Esta é a lista das 14h05.')).toBeTruthy();
  });

  it('sem sinal e sem lista guardada: diz, e "Tentar de novo" busca outra vez', async () => {
    servico.lerMaterialAChegar.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<TelaDoMestre aoSair={() => {}} guarda={celular.guarda!} />);
    expect(await screen.findByText('Sem sinal para buscar os pedidos.')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Fornecedor de Teste')).toBeTruthy();
  });

  it('quando a rede volta, lê a lista de novo', async () => {
    render(<TelaDoMestre aoSair={() => {}} guarda={celular.guarda!} />);
    await screen.findByText('Fornecedor de Teste');
    const antes = servico.lerMaterialAChegar.mock.calls.length;
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    await waitFor(() => expect(servico.lerMaterialAChegar.mock.calls.length).toBeGreaterThan(antes));
  });

  it('a entrega vai ao banco com a obra e o pedido do cartão, e a lista é lida de novo', async () => {
    render(<TelaDoMestre aoSair={() => {}} guarda={celular.guarda!} />);
    await userEvent.click(await screen.findByRole('button', { name: /Toque para receber/ }));
    for (const p of ['Chegou no dia combinado?', 'Chegou sem estrago?', 'Chegou o que foi pedido?', 'Chegou tudo?']) {
      await userEvent.click(
        screen.getAllByRole('group').find((g) => g.textContent?.startsWith(p))!.querySelector('button')!,
      );
    }
    await userEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
    await userEvent.type(screen.getByRole('textbox'), '4567');
    const leituras = servico.lerMaterialAChegar.mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    expect(await screen.findByText('Recebido.')).toBeTruthy();
    expect(servico.registrarEntregaDoMestre).toHaveBeenCalledWith(
      expect.objectContaining({ ocId: 'oc-1', intervencaoId: 'obra-1', soUmaParte: false, foto: null }),
    );
    await waitFor(() => expect(servico.lerMaterialAChegar.mock.calls.length).toBeGreaterThan(leituras));
  });
});

describe('a porta do App', () => {
  it('o mestre cai em "Material a chegar", sem menu, e os dados do escritório não são lidos', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Material a chegar' })).toBeTruthy();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(login.carregarDados).not.toHaveBeenCalled();
  });
});
