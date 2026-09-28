import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D613 §3: as tratativas abertas num bloco do Painel, só para quem pode
 * revisar ECR. O teste prova as duas coisas que a D613 pede: o bloco não
 * aparece para quem não pode, e a recusa do banco (42501) vira frase de gente.
 *
 * O banco é falso, mas a camada é a de verdade: o `rpc` falso devolve o erro
 * no formato do PostgREST, e a frase sai da tradução real.
 */

const banco = vi.hoisted(() => ({}) as { rpc: Mock; pode: Mock; recarregar: Mock });
vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({ rpc: (...a: unknown[]) => banco.rpc(...a) }),
}));
vi.mock('../../src/services/supabase/ecrs', () => ({ podeRevisarEcr: () => banco.pode() }));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => banco.recarregar() }));

import { DashboardPage } from '../../src/features/dashboard/DashboardPage';
import { normalizeFornecedor, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { DadosDaQualificacao, Tratativa } from '../../src/services/supabase/qualificacao';
import type { Data } from '../../src/domain/types';

const TRATATIVA: Tratativa = {
  avaliacaoId: 7, ocId: 'oc-1', numero: '2026/001', fornecedorId: 'filial-a', intervencaoId: 'obra-teste',
  notaFiscal: '1234', recebidoEm: '2026-09-20', prazoConforme: false, integridadeConforme: true, ocEcrConforme: false,
  naoConformes: 2, observacao: 'chegou tarde', tratativa: 'devolvido ao fornecedor', avaliadoPorNome: 'Pessoa de teste',
};

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: [], texto_condicoes_contratacao: '', texto_envio_nf: '', texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)' })],
    obras: [normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' })],
    ecrs: [],
    ordens_compra: [],
  } as unknown as Data;
}

const qualificacoes = (tratativas: Tratativa[]): DadosDaQualificacao => ({ linhas: [], categorias: [], tratativas, desempenho: [] });
const bloco = () => document.querySelector<HTMLElement>('[data-tratativas-abertas]');
const avisos = () => useUiStore.getState().toasts.map((t) => t.message);

beforeEach(() => {
  banco.rpc = vi.fn(async () => ({ data: {}, error: null }));
  banco.pode = vi.fn(async () => true);
  banco.recarregar = vi.fn(async () => {});
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never, sessao: { user: { id: 'conta-teste' } } as never });
  useUiStore.setState({ toasts: [] });
  useQualificacaoStore.getState().definir(qualificacoes([TRATATIVA]));
});

async function painel() {
  await act(async () => {
    render(<DashboardPage />);
  });
}

describe('D613 §3 — o bloco das tratativas abertas', () => {
  it('quem NÃO revisa ECR não vê o bloco', async () => {
    banco.pode = vi.fn(async () => false);
    await painel();
    expect(bloco()).toBeNull();
    expect(screen.queryByText(/Tratativas abertas/)).toBeNull();
  });

  it('se a pergunta ao banco falhar, o bloco também não aparece (na dúvida, não)', async () => {
    banco.pode = vi.fn(async () => {
      throw new Error('rede');
    });
    await painel();
    expect(bloco()).toBeNull();
  });

  it('quem revisa vê a entrega: OC, fornecedor, obra, o que não conformou e a tratativa', async () => {
    await painel();
    const b = bloco()!;
    expect(b.querySelector('h3')!.textContent).toBe('Tratativas abertas (1)');
    expect(b.textContent).toContain('OC 2026/001 — Filial A (teste)');
    expect(b.textContent).toContain('Obra de teste · NF 1234 · recebida em 20/09/2026');
    expect(b.textContent).toContain('2 "Não Conforme": prazo, OC e ECR.');
    expect(b.textContent).toContain('devolvido ao fornecedor');
  });

  it('sem tratativa aberta, o bloco diz isso', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    await painel();
    expect(bloco()!.textContent).toContain('Nenhuma entrega esperando ciência.');
  });

  it('dar ciência: sem nota não grava; com nota, uma gravação com a avaliação e a nota', async () => {
    await painel();
    const b = bloco()!;
    fireEvent.click(within(b).getByRole('button', { name: 'Dar ciência' }));
    await act(async () => {
      fireEvent.click(within(b).getByRole('button', { name: 'Gravar ciência' }));
    });
    expect(banco.rpc).not.toHaveBeenCalled();
    expect(within(b).getByRole('alert').textContent).toBe('Escreva a nota da ciência.');
    fireEvent.change(within(b).getByLabelText('Nota da ciência da OC 2026/001'), { target: { value: ' visto com o fornecedor ' } });
    await act(async () => {
      fireEvent.click(within(b).getByRole('button', { name: 'Gravar ciência' }));
    });
    expect(banco.rpc).toHaveBeenCalledWith('dar_ciencia_tratativa', { p_avaliacao_id: 7, p_nota: 'visto com o fornecedor' });
    expect(banco.recarregar).toHaveBeenCalledTimes(1);
    expect(avisos()).toContain('Ciência registrada na OC 2026/001.');
  });

  it('o banco recusa com 42501: a frase de gente aparece, e nada se dá por feito', async () => {
    banco.rpc = vi.fn(async () => ({ data: null, error: { code: '42501', message: 'permission denied' } }));
    await painel();
    const b = bloco()!;
    fireEvent.click(within(b).getByRole('button', { name: 'Dar ciência' }));
    fireEvent.change(within(b).getByLabelText('Nota da ciência da OC 2026/001'), { target: { value: 'visto' } });
    await act(async () => {
      fireEvent.click(within(b).getByRole('button', { name: 'Gravar ciência' }));
    });
    expect(within(b).getByRole('alert').textContent).toBe(
      'Só quem revisa as ECRs dá ciência de tratativa. A ciência não foi gravada.',
    );
    expect(banco.recarregar).not.toHaveBeenCalled();
    expect(avisos()).toEqual([]);
  });
});
