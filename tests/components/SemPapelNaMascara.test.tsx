import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

/**
 * Perícia de 16/10 (parte C), achado 2 — CTO-D850 §2: a lista das entregas sem
 * papel e o número do menu, quando a máscara "mostrar só uma obra" liga com
 * as duas obras já carregadas e uma busca sem máscara ainda a caminho. A lista
 * e o número só podem mostrar a obra ativa, também enquanto a busca nova não
 * volta. Banco FALSO, que segura cada resposta até o teste soltar; obras e
 * pessoas INVENTADAS.
 */

const banco = vi.hoisted(() => ({
  pedidos: [] as { obra: string | null; soltar: (l: unknown[]) => void }[],
}));
vi.mock('../../src/services/supabase/client', () => ({ supabase: {}, core: () => ({}), compras: () => ({}) }));
vi.mock('../../src/services/supabase/entregasSemPapel', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/entregasSemPapel')>()),
  lerEntregasSemPapel: (obra: string | null) =>
    new Promise((soltar) => banco.pedidos.push({ obra, soltar: soltar as (l: unknown[]) => void })),
}));

import { EntregasSemPapel } from '../../src/features/recebimento/EntregasSemPapel';
import { janelaEscolhida } from '../../src/domain/umaObra';
import { normalizeOC } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useEntregasSemPapelStore } from '../../src/stores/useEntregasSemPapelStore';
import { useUmaObraStore } from '../../src/stores/useUmaObraStore';
import type { Data } from '../../src/domain/types';
import type { EntregaSemPapel as Linha } from '../../src/domain/entregasSemPapel';

const DADOS = {
  schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
  config: {
    emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
    condicoes_pagamento: [], texto_condicoes_contratacao: '', texto_envio_nf: '', texto_qualidade: '', pasta_backups: '',
  },
  fornecedores: [], ecrs: [],
  obras: [{ id: 'obra-a', nome: 'Obra Alfa (teste)' }, { id: 'obra-b', nome: 'Obra Beta (teste)' }],
  ordens_compra: [
    normalizeOC({ id: 'oc-a', numero: '2026/001', obra_id: 'obra-a', status: 'entregue' }),
    normalizeOC({ id: 'oc-b', numero: '2026/002', obra_id: 'obra-b', status: 'entregue' }),
  ],
} as unknown as Data;

const linha = (avaliacaoId: number, ocId: string): Linha => ({
  avaliacaoId, ocId, numero: ocId === 'oc-a' ? '2026/001' : '2026/002', obra: '', fornecedor: 'Fornecedor (teste)',
  fornecedorId: '', recebidoEm: '2026-10-10', notaFiscal: '', avaliadoPorNome: '', ecrId: 6, ecr: 'ECR 06', nome: '',
  posicoes: [], porque: 'a ECR pede (teste)', linhas: [], observacao: '', aCadaEntrega: false,
});
const DA_A = linha(1, 'oc-a');
const DA_B = linha(2, 'oc-b');

const { inicio, fim } = janelaEscolhida('2026-11-16', '00:00', '2026-11-17', '23:59');
const ligarAMascara = () =>
  act(() => {
    useUmaObraStore.getState().armar({
      obraId: 'obra-a', obraNome: 'Obra Alfa (teste)', inicio: new Date(Date.now() - 1000).toISOString(),
      fim: fim.toISOString(), ensaio: true,
    });
  });
const ocsNaLista = () => (useEntregasSemPapelStore.getState().linhas ?? []).map((l) => l.ocId);

beforeEach(() => {
  banco.pedidos = [];
  localStorage.clear();
  useUmaObraStore.getState().desarmar();
  useDataStore.setState({ data: DADOS });
  useEntregasSemPapelStore.setState({ linhas: null, erro: '', carregando: false });
  void inicio;
});

describe('a máscara liga com a lista das duas obras já carregada (achado 2)', () => {
  it('a outra obra sai na hora da virada, antes da busca filtrada voltar', async () => {
    const primeira = useEntregasSemPapelStore.getState().carregar();
    await act(async () => {
      banco.pedidos[0]!.soltar([DA_A, DA_B]);
      await primeira;
    });
    expect(ocsNaLista()).toEqual(['oc-a', 'oc-b']);

    ligarAMascara();
    expect(useUmaObraStore.getState().obraAtiva).toBe('obra-a');
    // Ainda sem nenhuma busca nova: só a obra ativa.
    expect(ocsNaLista()).not.toContain('oc-b');
  });

  it('a busca sem máscara que chega depois da filtrada não traz a outra obra de volta, nem à tela', async () => {
    const primeira = useEntregasSemPapelStore.getState().carregar();
    await act(async () => {
      banco.pedidos[0]!.soltar([DA_A, DA_B]);
      await primeira;
    });
    render(<EntregasSemPapel />);
    // A tela lê ao abrir: esta busca, sem máscara, fica presa.
    expect(banco.pedidos).toHaveLength(2);
    expect(banco.pedidos[1]!.obra).toBeNull();

    ligarAMascara();
    const filtrada = useEntregasSemPapelStore.getState().carregar();
    expect(banco.pedidos[2]!.obra).toBe('obra-a');
    await act(async () => {
      banco.pedidos[2]!.soltar([DA_A]);
      await filtrada;
    });
    expect(ocsNaLista()).toEqual(['oc-a']);

    // A busca antiga, sem máscara, chega por último.
    await act(async () => {
      banco.pedidos[1]!.soltar([DA_A, DA_B]);
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(ocsNaLista()).toEqual(['oc-a']);
    expect(screen.queryByText('OC 2026/002')).toBeNull();
    expect(screen.getByText('OC 2026/001')).toBeTruthy();
  });

  it('a busca mais nova manda: uma resposta mais velha que chega depois não a troca, mesmo sem máscara', async () => {
    const velha = useEntregasSemPapelStore.getState().carregar();
    const nova = useEntregasSemPapelStore.getState().carregar();
    await act(async () => {
      banco.pedidos[1]!.soltar([DA_A]);
      await nova;
    });
    await act(async () => {
      banco.pedidos[0]!.soltar([DA_A, DA_B]);
      await velha;
    });
    expect(ocsNaLista()).toEqual(['oc-a']);
    expect(useEntregasSemPapelStore.getState().carregando).toBe(false);
  });
});
