import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * Perícia do Codex, 27/09/2026, achado 6 (CTO-D607): as duas portas de emissão,
 * por COMPORTAMENTO. O teste de antes procurava o texto `travaDaFilial(…)` no
 * código, e a mutação do perito — chamar a trava, avisar e seguir emitindo —
 * passava por ele. Aqui se conta a gravação: filial bloqueada, zero gravação.
 *
 * A gravação é FALSA (nada sai daqui) e, quando acontece, para com um erro de
 * propósito: o que se mede é se ela foi chamada.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const gravacoes = {
  salvar: vi.fn(async (...a: unknown[]): Promise<never> => {
    void a;
    throw new Error('parada aqui pelo teste');
  }),
  status: vi.fn(async (...a: unknown[]): Promise<never> => {
    void a;
    throw new Error('parada aqui pelo teste');
  }),
};
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarOrdemCompra: (...a: unknown[]) => gravacoes.salvar(...a),
  definirStatusOc: (...a: unknown[]) => gravacoes.status(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { mudarStatusDaOc } from '../../src/features/ordens-compra/mudarStatusDaOc';
import { EMITIR_BLOQUEADA, EMITIR_SEM_CONFIRMACAO } from '../../src/domain/fornecedores';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, Fornecedor } from '../../src/domain/types';

/** Três filiais: a bloqueada, a de bloqueio desconhecido (a carga não trouxe) e a livre. */
const filial = (id: string, bloqueio: boolean | undefined): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: `Filial ${id} (teste)` }),
  fornece_material: true,
  bloqueado_para_compra_nova: bloqueio,
});
const FILIAIS = [filial('bloqueada', true), filial('desconhecida', undefined), filial('livre', false)];

const OBRA = {
  ...normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' }),
  destinatario: {
    nome: 'Destinatário de teste',
    documento: '00000000000000',
    tipo: 'pj' as const,
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
  },
};

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: FILIAIS, obras: [OBRA], ecrs: [], ordens_compra: [],
  } as unknown as Data;
}

function oc(fornecedor: string, status: 'rascunho' | 'emitida' = 'rascunho') {
  return normalizeOC({
    id: `oc-${fornecedor}`,
    status,
    fornecedor_id: fornecedor,
    obra_id: OBRA.id,
    condicao_pagamento: 'À vista',
    itens: [normalizeItem({ descricao: 'Cimento (teste)', quantidade: 1, unidade: 'sc', preco_unit: 30 })],
    versao: 1,
  });
}

const avisos = () => useUiStore.getState().toasts.map((t) => t.message);

beforeEach(() => {
  gravacoes.salvar.mockClear();
  gravacoes.status.mockClear();
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useOcEditingStore.getState().stopEditing();
});

describe('Perícia 27/09, achado 6 — a porta "Emitir OC" da Nova OC', () => {
  async function emitirCom(fornecedor: string) {
    useOcEditingStore.getState().startEditing(oc(fornecedor));
    render(<NovaOcPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Emitir OC \+ Gerar PDF/ }));
    });
  }

  it('filial bloqueada: zero gravação, e o aviso diz o que fazer', async () => {
    await emitirCom('bloqueada');
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(avisos()).toContain(EMITIR_BLOQUEADA);
  });

  it('bloqueio desconhecido: zero gravação (a trava falha fechada)', async () => {
    await emitirCom('desconhecida');
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(avisos()).toContain(EMITIR_SEM_CONFIRMACAO);
  });

  it('a régua: com a filial livre, a gravação É chamada — o teste enxerga a gravação quando ela acontece', async () => {
    await emitirCom('livre');
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
  });
});

describe('Perícia 27/09, achado 6 — a porta "emitida" do Histórico', () => {
  const avisar = vi.fn();
  beforeEach(() => avisar.mockClear());

  it('filial bloqueada: zero gravação, e o aviso diz o que fazer', async () => {
    await mudarStatusDaOc(oc('bloqueada'), 'emitida', FILIAIS, avisar);
    expect(gravacoes.status).not.toHaveBeenCalled();
    expect(avisar).toHaveBeenCalledWith(EMITIR_BLOQUEADA, 'warning');
  });

  it('bloqueio desconhecido: zero gravação (a trava falha fechada)', async () => {
    await mudarStatusDaOc(oc('desconhecida'), 'emitida', FILIAIS, avisar);
    expect(gravacoes.status).not.toHaveBeenCalled();
    expect(avisar).toHaveBeenCalledWith(EMITIR_SEM_CONFIRMACAO, 'warning');
  });

  it('a régua: com a filial livre, a gravação É chamada', async () => {
    await mudarStatusDaOc(oc('livre'), 'emitida', FILIAIS, avisar);
    expect(gravacoes.status).toHaveBeenCalledWith('oc-livre', 'emitida', 1);
  });

  it('cancelar não passa pela trava: a filial bloqueada cancela a OC dela', async () => {
    await mudarStatusDaOc(oc('bloqueada', 'emitida'), 'cancelada', FILIAIS, avisar);
    expect(gravacoes.status).toHaveBeenCalledWith('oc-bloqueada', 'cancelada', 1);
  });

  it('a tela do Histórico usa esta porta: o "Cancelar" da linha chega à gravação', async () => {
    useDataStore.setState({ data: { ...dados(), ordens_compra: [oc('bloqueada', 'emitida')] } });
    render(<HistoricoPage />);
    const linha = screen.getByText('Filial bloqueada (teste)').closest('tr')!;
    await act(async () => {
      fireEvent.click(within(linha).getByRole('button', { name: 'Cancelar' }));
    });
    expect(gravacoes.status).toHaveBeenCalledWith('oc-bloqueada', 'cancelada', 1);
  });
});
