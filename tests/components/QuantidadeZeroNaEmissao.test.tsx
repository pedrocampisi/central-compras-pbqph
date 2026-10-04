import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

/**
 * CTO-D680: a OC 2026/010 foi emitida com o item 1 em quantidade 0 e preço 0.
 * As duas portas de emissão, por COMPORTAMENTO (como a perícia de 27/09
 * ensinou): linha com quantidade 0, zero gravação, e o aviso diz qual linha; a
 * linha em branco de verdade some na Nova OC e não vai para o banco.
 *
 * A gravação é FALSA e, quando acontece, para com um erro de propósito: o que
 * se mede é se ela foi chamada, e com o quê. Itens e obra INVENTADOS.
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
import { mudarStatusDaOc } from '../../src/features/ordens-compra/mudarStatusDaOc';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, Fornecedor, Item, OrdemCompra } from '../../src/domain/types';

const LIVRE: Fornecedor = {
  ...normalizeFornecedor({ id: 'livre', razao_social: 'Filial livre (teste)' }),
  fornece_material: true,
  bloqueado_para_compra_nova: false,
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

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [LIVRE], obras: [OBRA], ecrs: [], ordens_compra: [],
  } as unknown as Data;
}

const item = (descricao: string, quantidade: number, preco_unit: number) =>
  normalizeItem({ descricao, quantidade, unidade: 'un', preco_unit });
const EM_BRANCO = () => item('', 0, 0);
const ZERADA = () => item('Luva de raspa (teste)', 0, 0);
const CIMENTO = () => item('Cimento (teste)', 2, 30);

function oc(itens: Item[]): OrdemCompra {
  return normalizeOC({
    id: 'oc-teste', status: 'rascunho', fornecedor_id: 'livre', obra_id: OBRA.id,
    condicao_pagamento: 'À vista', itens, versao: 1,
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

describe('CTO-D680 — a porta "Emitir OC" da Nova OC', () => {
  async function emitir(itens: Item[]) {
    useOcEditingStore.getState().startEditing(oc(itens));
    render(<NovaOcPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Emitir OC \+ Gerar PDF/ }));
    });
  }

  it('a linha com quantidade 0: zero gravação, e o aviso diz qual é', async () => {
    await emitir([EM_BRANCO(), ZERADA(), CIMENTO()]);
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(avisos()).toContain(
      'O item 2 (Luva de raspa (teste)) está com quantidade 0. Informe a quantidade ou apague a linha, e emita de novo.',
    );
  });

  it('a linha em branco some sozinha: a gravação vai só com o item de verdade', async () => {
    await emitir([CIMENTO(), EM_BRANCO()]);
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
    const enviada = gravacoes.salvar.mock.calls[0]![0] as OrdemCompra;
    expect(enviada.status).toBe('emitida');
    expect(enviada.itens.map((i) => i.descricao)).toEqual(['Cimento (teste)']);
  });

  it('só linhas em branco: é OC sem item, e não emite', async () => {
    await emitir([EM_BRANCO()]);
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(avisos()).toContain('Adicione ao menos um item.');
  });
});

describe('CTO-D680 — a porta "emitida" do Histórico', () => {
  const avisar = vi.fn();
  beforeEach(() => avisar.mockClear());

  it('o rascunho com uma linha de quantidade 0 (mesmo em branco): zero gravação, e o aviso manda editar', async () => {
    await mudarStatusDaOc(oc([CIMENTO(), EM_BRANCO()]), 'emitida', [LIVRE], avisar);
    expect(gravacoes.status).not.toHaveBeenCalled();
    expect(avisar).toHaveBeenCalledWith(
      'O item 2 está com quantidade 0. Abra a OC em Editar, informe a quantidade ou apague a linha, e emita de novo.',
      'warning',
    );
  });

  it('a régua: com as quantidades certas, a gravação É chamada', async () => {
    await mudarStatusDaOc(oc([CIMENTO()]), 'emitida', [LIVRE], avisar);
    expect(gravacoes.status).toHaveBeenCalledWith('oc-teste', 'emitida', 1);
  });

  it('cancelar não passa pela trava: a OC com linha zerada cancela', async () => {
    await mudarStatusDaOc({ ...oc([ZERADA()]), status: 'emitida' }, 'cancelada', [LIVRE], avisar);
    expect(gravacoes.status).toHaveBeenCalledWith('oc-teste', 'cancelada', 1);
  });
});
