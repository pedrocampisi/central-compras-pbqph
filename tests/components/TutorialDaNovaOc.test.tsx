import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * CTO-D763: o tutorial "Fazer uma OC" da Nova OC, como piloto. A pessoa faz de
 * verdade, o passo segue quando ela age, e o tutorial NUNCA grava: a gravação
 * aqui é FALSA e conta as chamadas — o percurso inteiro termina com zero.
 * OC, obra e fornecedor são INVENTADOS.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const gravacoes = {
  salvar: vi.fn(async (...a: unknown[]): Promise<never> => {
    void a;
    throw new Error('o tutorial não grava');
  }),
  pdf: vi.fn(async (...a: unknown[]): Promise<never> => {
    void a;
    throw new Error('o tutorial não grava');
  }),
};
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarOrdemCompra: (...a: unknown[]) => gravacoes.salvar(...a),
  marcarPdfGerado: (...a: unknown[]) => gravacoes.pdf(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { normalizeFornecedor, normalizeObra } from '../../src/domain/normalize';
import { O_QUE_E_ECR } from '../../src/domain/ecr';
import { DICA_DA_ENTREGA, PASSOS_DA_NOVA_OC } from '../../src/domain/tutorialDaNovaOc';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

// Com destinatário: a OC do percurso fica EMITÍVEL, para que, se o tutorial
// apertasse o "Emitir", a gravação falsa contasse (nenhuma trava a esconde).
const OBRA = {
  ...normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' }),
  destinatario: {
    nome: 'Destinatário de teste',
    documento: '00000000000000',
    tipo: 'pj' as const,
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
  },
};
const FORNECEDOR = { ...normalizeFornecedor({ id: 'f1', razao_social: 'Fornecedor de teste' }), fornece_material: true, bloqueado_para_compra_nova: false };
const OC_JA_EMITIDA = { id: 'oc-velha', numero: '001/2026', status: 'emitida' };

function entrar(pessoa = 'pessoa-a') {
  useAuthStore.setState({ perfil: { user_id: pessoa, nome: 'Pessoa (teste)', papel: 'admin', ativo: true } });
}

beforeEach(() => {
  gravacoes.salvar.mockClear();
  gravacoes.pdf.mockClear();
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  useDataStore.setState({
    data: {
      config: { emitentes: [], condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '' },
      fornecedores: [FORNECEDOR],
      obras: [OBRA],
      ecrs: [],
      ordens_compra: [OC_JA_EMITIDA],
    } as unknown as Data,
  });
  entrar();
  useUiStore.setState({ toasts: [] });
  useOcEditingStore.getState().stopEditing();
});

const balao = () => document.querySelector<HTMLElement>('[data-tutorial-balao]');
const aceso = () => document.querySelector<HTMLElement>('[data-tutorial-aceso]')?.dataset['tutorial'];
const noBalao = (nome: string) => within(balao()!).getByRole('button', { name: nome });

async function escolher(rotulo: 'Fornecedor' | 'Obra') {
  const campo = screen.getByRole('combobox', { name: new RegExp(rotulo) });
  await userEvent.click(campo);
  const opcao = screen.getAllByRole('option').find((o) => o.textContent !== 'Selecione…')!;
  await userEvent.click(opcao);
}

function abrirPeloBotao() {
  fireEvent.click(screen.getByRole('button', { name: /^Tutorial$/ }));
}

describe('D763 — o tutorial, de ponta a ponta', () => {
  it('a pessoa faz de verdade, o passo segue quando ela age, e no fim nada foi gravado', async () => {
    render(<NovaOcPage />);
    const ocsAntes = useDataStore.getState().data!.ordens_compra.length;
    abrirPeloBotao();

    expect(balao()).toHaveTextContent('Passo 1 de 7');
    expect(aceso()).toBe('fornecedor');
    await escolher('Fornecedor');

    expect(balao()).toHaveTextContent('Passo 2 de 7');
    expect(aceso()).toBe('obra');
    await escolher('Obra');

    expect(aceso()).toBe('entrega');
    fireEvent.click(noBalao('Próximo'));

    expect(aceso()).toBe('itens');
    fireEvent.click(screen.getAllByRole('button', { name: '+ Adicionar Item' })[0]!);

    expect(aceso()).toBe('tabela');
    // A pessoa preenche a linha: o passo de leitura não sai do lugar sozinho.
    fireEvent.change(screen.getByPlaceholderText('Descrição do item'), { target: { value: 'Cimento (teste)' } });
    const [quantidade, preco] = screen.getAllByPlaceholderText('0');
    fireEvent.change(quantidade!, { target: { value: '10' } });
    fireEvent.change(preco!, { target: { value: '30' } });
    expect(aceso()).toBe('tabela');
    fireEvent.click(noBalao('Próximo'));
    expect(aceso()).toBe('totais');
    fireEvent.click(noBalao('Próximo'));

    // O último passo acende o botão laranja, explica, e não aperta.
    expect(balao()).toHaveTextContent('Passo 7 de 7');
    const acesoNoFim = document.querySelector('[data-tutorial-aceso]')!;
    expect(acesoNoFim).toHaveTextContent('Emitir OC + Gerar PDF');
    await act(async () => {
      fireEvent.click(noBalao('Terminar'));
    });

    expect(balao()).toBeNull();
    expect(aceso()).toBeUndefined();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(gravacoes.pdf).not.toHaveBeenCalled();
    expect(useDataStore.getState().data!.ordens_compra.length).toBe(ocsAntes);
    // O que a pessoa fez fica na tela, como rascunho em edição — o tutorial não desfaz nem grava.
    const oc = useOcEditingStore.getState().ocEditing!;
    expect(oc).toMatchObject({ fornecedor_id: 'f1', obra_id: OBRA.id, status: 'rascunho', numero: '' });
    expect(oc.itens).toHaveLength(1);
    // A prova de que a OC estava pronta para emitir: o botão dela, apertado pela pessoa, grava.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Emitir OC \+ Gerar PDF/ }));
    });
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
  });

  it('voltar a um passo já feito mostra o passo, e não empurra para a frente', async () => {
    render(<NovaOcPage />);
    abrirPeloBotao();
    await escolher('Fornecedor');
    expect(aceso()).toBe('obra');
    fireEvent.click(noBalao('Voltar'));
    expect(aceso()).toBe('fornecedor');
    expect(balao()).toHaveTextContent('Passo 1 de 7');
  });

  it('"Pular" segue sem agir; "Voltar" não existe no primeiro passo; "Sair" fecha e apaga o contorno', () => {
    render(<NovaOcPage />);
    abrirPeloBotao();
    expect(noBalao('Voltar')).toBeDisabled();
    fireEvent.click(noBalao('Pular'));
    expect(aceso()).toBe('obra');
    expect(noBalao('Voltar')).toBeEnabled();
    fireEvent.click(noBalao('Sair'));
    expect(balao()).toBeNull();
    expect(aceso()).toBeUndefined();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
  });

  it('Esc no balão sai; Esc na página (fechando a lista do campo) não leva o tutorial junto', async () => {
    render(<NovaOcPage />);
    abrirPeloBotao();
    const campo = screen.getByRole('combobox', { name: /Fornecedor/ });
    await userEvent.click(campo);
    await userEvent.keyboard('{Escape}');
    expect(balao()).not.toBeNull();
    fireEvent.keyDown(noBalao('Pular'), { key: 'Escape' });
    expect(balao()).toBeNull();
  });

  it('cada passo acende um lugar que existe na tela', () => {
    render(<NovaOcPage />);
    for (const p of PASSOS_DA_NOVA_OC) {
      expect(document.querySelectorAll(`[data-tutorial="${p.alvo}"]`), p.alvo).toHaveLength(1);
    }
  });
});

describe('D763 — a oferta, uma vez só', () => {
  const oferta = () => document.querySelector('[data-oferta-do-tutorial]');

  it('na primeira entrada aparece; "Agora não" e ela não volta', () => {
    const { unmount } = render(<NovaOcPage />);
    expect(oferta()).toHaveTextContent('Quer ver como funciona?');
    fireEvent.click(screen.getByRole('button', { name: 'Agora não' }));
    expect(oferta()).toBeNull();
    expect(balao()).toBeNull();
    unmount();
    render(<NovaOcPage />);
    expect(oferta()).toBeNull();
  });

  it('"Ver o tutorial" abre no passo 1 e também não oferece de novo', () => {
    const { unmount } = render(<NovaOcPage />);
    fireEvent.click(screen.getByRole('button', { name: /Ver o tutorial/ }));
    expect(oferta()).toBeNull();
    expect(aceso()).toBe('fornecedor');
    unmount();
    render(<NovaOcPage />);
    expect(oferta()).toBeNull();
  });

  it('é por pessoa: quem recusou não vê; outra pessoa no mesmo navegador vê', () => {
    const { unmount } = render(<NovaOcPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Agora não' }));
    unmount();
    entrar('pessoa-b');
    render(<NovaOcPage />);
    expect(oferta()).not.toBeNull();
  });

  it('navegador que não guarda nada: não oferece (não pergunta a cada visita), e o botão continua', () => {
    const ler = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    try {
      render(<NovaOcPage />);
      expect(oferta()).toBeNull();
      expect(screen.getByRole('button', { name: /^Tutorial$/ })).toBeInTheDocument();
    } finally {
      ler.mockRestore();
    }
  });
});

describe('D763 §1.6 — uma fonte só para o texto', () => {
  it('a dica da entrega na tela é a mesma frase do balão', () => {
    render(<NovaOcPage />);
    expect(screen.getByText(DICA_DA_ENTREGA)).toBeInTheDocument();
    expect(PASSOS_DA_NOVA_OC.find((p) => p.alvo === 'entrega')!.texto).toContain(DICA_DA_ENTREGA);
  });

  it('o passo dos itens explica a ECR com a frase do "?" da ECR', () => {
    expect(PASSOS_DA_NOVA_OC.find((p) => p.alvo === 'tabela')!.texto).toContain(O_QUE_E_ECR);
  });
});
