import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D680: "O nome da OC precisa vir com o apelido e não esse nome
 * gigantesco." As duas portas que dão nome ao PDF — a emissão da Nova OC e o
 * "PDF" do Histórico — por COMPORTAMENTO: o nome que chega a quem salva o
 * arquivo. Empresa, obra e itens INVENTADOS; nada é gerado nem gravado.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const salvos = vi.hoisted(() => [] as string[]);
vi.mock('../../src/services/pdf/generateOcPdf', () => ({
  generateOcPdfBlob: async () => new Blob(['pdf de teste']),
  savePdfToFile: async (_b: Blob, nome: string) => {
    salvos.push(nome);
    return 'downloaded';
  },
}));
vi.mock('../../src/services/storage/handles', () => ({ getObraDirHandle: async () => undefined }));
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarOrdemCompra: async () => ({ id: 'oc-teste', status: 'emitida', numero: '2026/099', ano: 2026, sequencial: 99, versao: 2 }),
  marcarPdfGerado: async () => {},
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, Fornecedor } from '../../src/domain/types';

const COMARCO: Fornecedor = {
  ...normalizeFornecedor({ id: 'com', razao_social: 'COMARCO COMERCIAL ARAGUARI INDUSTRIA E CONSTRUCOES LTDA (teste)' }),
  fornece_material: true,
  bloqueado_para_compra_nova: false,
  empresa_id: 'e-com',
  empresa_apelido: 'Comarco',
};

const OBRA = {
  ...normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' }),
  destinatario: {
    nome: 'Destinatário de teste',
    documento: '00000000000000',
    tipo: 'pj' as const,
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
  },
};

const OC = normalizeOC({
  id: 'oc-teste', numero: '2026/099', status: 'emitida', fornecedor_id: 'com', obra_id: OBRA.id, data: '2026-09-18',
  condicao_pagamento: 'À vista', versao: 1,
  itens: [normalizeItem({ descricao: 'Item de teste', quantidade: 1, unidade: 'un', preco_unit: 263.29 })],
});

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [COMARCO], obras: [OBRA], ecrs: [], ordens_compra: [OC],
  } as unknown as Data;
}

beforeEach(() => {
  salvos.length = 0;
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useOcEditingStore.getState().stopEditing();
});

describe('CTO-D680 — o nome do PDF vem com o apelido, nas duas portas', () => {
  it('a emissão da Nova OC', async () => {
    useOcEditingStore.getState().startEditing({ ...OC, status: 'rascunho', numero: '' });
    render(<NovaOcPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Emitir OC \+ Gerar PDF/ }));
    });
    expect(salvos).toEqual(['comarco 2026-09-18 R-263-29 oc.pdf']);
  });

  it('o "PDF" do Histórico', async () => {
    render(<HistoricoPage />);
    const linha = screen.getByText('2026/099').closest('tr')!;
    await act(async () => {
      fireEvent.click(within(linha).getByRole('button', { name: 'PDF' }));
    });
    expect(salvos).toEqual(['comarco 2026-09-18 R-263-29 oc.pdf']);
  });
});
