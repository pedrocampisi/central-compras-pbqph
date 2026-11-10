import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';

/**
 * CTO-D644 §4.2: o cartão "Fornecedores" do Dashboard conta EMPRESAS, como a
 * lista de Fornecedores desde a D641 (a regra da D501). Contava filiais: nas
 * fotos da D641 ele dizia 10 com 6 empresas na lista. Empresas e CNPJs
 * INVENTADOS; banco falso.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/ecrs', () => ({ podeRevisarEcr: async () => false }));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { DashboardPage } from '../../src/features/dashboard/DashboardPage';
import { normalizeFornecedor, normalizeItem, normalizeOC } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, Fornecedor } from '../../src/domain/types';

const filial = (id: string, empresa: string | undefined, ativo = true): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: `Filial ${id} (teste)`, cnpj: '' }),
  ativo,
  empresa_id: empresa,
  empresa_apelido: empresa ? `Empresa ${empresa} (teste)` : undefined,
});

function dados(fornecedores: Fornecedor[]): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: [], texto_condicoes_contratacao: '', texto_envio_nf: '', texto_qualidade: '', pasta_backups: '',
    },
    fornecedores, obras: [], ecrs: [], ordens_compra: [],
  } as unknown as Data;
}

async function cartao(fornecedores: Fornecedor[]) {
  useDataStore.setState({ data: dados(fornecedores) });
  await act(async () => {
    render(<DashboardPage />);
  });
  return document.querySelector('[data-fornecedores-ativos]')!.textContent;
}

beforeEach(() => {
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useQualificacaoStore.getState().definir({ linhas: [], categorias: [], tratativas: [], desempenho: [] });
});

describe('CTO-D644 — o cartão "Fornecedores" conta empresas', () => {
  it('três filiais ativas da mesma empresa e uma filial sem empresa: 2', async () => {
    expect(await cartao([filial('a1', 'A'), filial('a2', 'A'), filial('a3', 'A'), filial('b1', undefined)])).toBe('2');
  });

  it('a empresa conta enquanto tiver alguma filial ativa; a de filiais todas inativas não conta', async () => {
    expect(
      await cartao([filial('a1', 'A'), filial('a2', 'A', false), filial('c1', 'C', false), filial('c2', 'C', false)]),
    ).toBe('1');
  });
});

describe('CTO-D1034f item 11 — "Fornecedores com mais compras", por empresa', () => {
  const oc = (id: string, fornecedor: string, preco: number, status = 'emitida') =>
    normalizeOC({
      id, numero: `2026/${id}`, status, fornecedor_id: fornecedor, obra_id: 'obra', data: '2026-09-18', versao: 1,
      itens: [normalizeItem({ descricao: 'Item (teste)', quantidade: 1, unidade: 'un', preco_unit: preco })],
    });

  it('as filiais da mesma empresa somam numa linha só, com o nome da empresa; a cancelada não conta', async () => {
    const data = dados([filial('a1', 'A'), filial('a2', 'A'), filial('b1', undefined)]);
    data.ordens_compra = [oc('001', 'a1', 100), oc('002', 'a2', 250), oc('003', 'b1', 300), oc('004', 'a1', 999, 'cancelada')];
    useDataStore.setState({ data });
    await act(async () => {
      render(<DashboardPage />);
    });
    const titulo = [...document.querySelectorAll('h3')].find((h) => h.textContent === 'Fornecedores com mais compras');
    expect(titulo).toBeTruthy();
    expect(document.body.textContent).not.toContain('Top Fornecedores');
    const lista = titulo!.parentElement!;
    const nomes = [...lista.querySelectorAll('[class*="nome"]')].map((n) => n.textContent);
    expect(nomes).toEqual(['Empresa A (teste)', 'Filial b1 (teste)']);
    expect(lista.textContent).toContain('2 filiais');
    expect(lista.textContent).toMatch(/R\$\s350,00/);
  });
});
