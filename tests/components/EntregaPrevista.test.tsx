import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type jsPDF from 'jspdf';

/**
 * CTO-D696 §3.1, decisão do Pedro: a "Entrega prevista" da OC — uma data
 * opcional que a Nova OC preenche, o banco guarda, o PDF mostra e o cartão do
 * mestre de obra usa como "Combinado para". A gravação é FALSA (nada sai
 * daqui); OC, obra e fornecedor são INVENTADOS.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const salvar = vi.fn(async (...a: unknown[]): Promise<never> => {
  void a;
  throw new Error('parada aqui pelo teste');
});
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarOrdemCompra: (...a: unknown[]) => salvar(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { cabecalhoDaOc } from '../../src/services/supabase/linhas';
import { paraOc } from '../../src/services/supabase/dados';
import { desenhaPdfDaOc } from '../../src/services/pdf/generateOcPdf';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, OrdemCompra } from '../../src/domain/types';

const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });

function oc(p: Partial<OrdemCompra> = {}): OrdemCompra {
  return normalizeOC({
    id: 'oc-teste',
    status: 'rascunho',
    data: '2026-10-04',
    fornecedor_id: 'f1',
    obra_id: OBRA.id,
    condicao_pagamento: 'À vista',
    itens: [normalizeItem({ descricao: 'Cimento (teste)', quantidade: 40, unidade: 'sc', preco_unit: 30 })],
    versao: 1,
    ...p,
  });
}

beforeEach(() => {
  salvar.mockClear();
  useDataStore.setState({
    data: {
      config: { emitentes: [], condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '' },
      fornecedores: [{ id: 'f1', razao_social: 'Fornecedor (teste)', fornece_material: true, bloqueado_para_compra_nova: false }],
      obras: [OBRA],
      ecrs: [],
      ordens_compra: [],
    } as unknown as Data,
  });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useOcEditingStore.getState().stopEditing();
});

describe('a Nova OC', () => {
  it('tem o campo "Entrega prevista", de data e opcional, e ele vai na gravação', async () => {
    useOcEditingStore.getState().startEditing(oc());
    render(<NovaOcPage />);
    const campo = screen.getByLabelText('Entrega prevista') as HTMLInputElement;
    expect(campo.type).toBe('date');
    expect(campo.required).toBe(false);
    fireEvent.change(campo, { target: { value: '2026-10-08' } });
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /Salvar Rascunho/ })[0]!);
    });
    expect(salvar).toHaveBeenCalledTimes(1);
    expect(salvar.mock.calls[0]![0]).toMatchObject({ entrega_prevista: '2026-10-08' });
  });
});

describe('o banco', () => {
  it('a data vai no cabeçalho; esvaziada, vai como null (o apagar pega)', () => {
    expect(cabecalhoDaOc(oc({ entrega_prevista: '2026-10-08' }))['entrega_prevista']).toBe('2026-10-08');
    expect(cabecalhoDaOc(oc({ entrega_prevista: '' }))['entrega_prevista']).toBeNull();
  });

  it('a leitura traz a data; sem a coluna (o banco de hoje), vem vazia', () => {
    expect(paraOc({ id: 'x', entrega_prevista: '2026-10-08' }).entrega_prevista).toBe('2026-10-08');
    expect(paraOc({ id: 'x' }).entrega_prevista).toBe('');
    expect(normalizeOC({ id: 'x' }).entrega_prevista).toBe('');
  });
});

describe('o PDF', () => {
  function texto(o: OrdemCompra, condicao = 'À vista'): string {
    const doc: jsPDF = desenhaPdfDaOc(
      { ...o, condicao_pagamento: condicao },
      { config: { condicoes_pagamento: [condicao], texto_condicoes_contratacao: '' }, fornecedores: [{ id: 'f1', razao_social: 'Fornecedor (teste)' }], obras: [OBRA], ecrs: [] } as never,
      null,
    );
    const pagina = (doc.internal as unknown as { pages: string[][] }).pages[1]!.join('\n');
    return Array.from(pagina.matchAll(/\(((?:\\.|[^\\)])*)\) Tj/g), (m) => m[1]!.replace(/\\(.)/g, '$1')).join(' ');
  }

  it('mostra a entrega prevista, e "—" quando não há', () => {
    expect(texto(oc({ entrega_prevista: '2026-10-08' }))).toContain('ENTREGA PREVISTA: 08/10/2026');
    const semData = texto(oc({ entrega_prevista: '' }));
    expect(semData).toContain('ENTREGA PREVISTA:');
    expect(semData).not.toMatch(/ENTREGA PREVISTA: \d/);
  });
});
