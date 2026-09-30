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
import { normalizeFornecedor } from '../../src/domain/normalize';
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
