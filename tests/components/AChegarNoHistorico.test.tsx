import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D1036 §2.6: a vista "A chegar" do Histórico. Quem compra vê o que falta
 * chegar, a data combinada, as atrasadas no alto, e o "Marcar entregue" ao
 * lado. Banco falso; fornecedor, obra e OCs inventados.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { fraseDaEntrega, ocsAChegar, quantasAtrasadas, situacaoDaEntrega } from '../../src/domain/aChegar';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useUiStore } from '../../src/stores/useUiStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import type { Data, OrdemCompra } from '../../src/domain/types';

const FORNECEDOR = normalizeFornecedor({ id: 'f1', razao_social: 'Fornecedor (teste)' });
const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });
const HOJE = '2026-11-11';

const oc = (id: string, numero: string, status: string, entrega: string, criado: string) =>
  normalizeOC({
    id, status, numero, data: '2026-11-01', fornecedor_id: FORNECEDOR.id, obra_id: OBRA.id, versao: 1,
    entrega_prevista: entrega, criado_em: criado,
    itens: [normalizeItem({ descricao: 'Cimento (teste)', quantidade: 1, unidade: 'sc', preco_unit: 30 })],
  });

const OCS = [
  oc('a', '2026/010', 'emitida', '2026-11-14', '2026-11-05T10:00:00Z'), // chega sábado
  oc('b', '2026/011', 'emitida', '2026-11-08', '2026-11-06T10:00:00Z'), // atrasada 3 dias
  oc('c', '2026/012', 'emitida', '', '2026-11-07T10:00:00Z'), // sem data
  oc('d', '2026/013', 'emitida', '2026-11-11', '2026-11-08T10:00:00Z'), // hoje
  oc('e', '2026/014', 'entregue', '2026-11-02', '2026-11-09T10:00:00Z'), // já chegou: não entra
  oc('f', '2026/015', 'emitida', '2026-11-10', '2026-11-10T10:00:00Z'), // atrasada 1 dia
];

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [FORNECEDOR],
    obras: [OBRA],
    ecrs: [],
    ordens_compra: OCS,
  } as unknown as Data;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-11T15:00:00Z')); // meio-dia em Brasília
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ histFilter: { search: '', status: '', fornecedor: '', obra: '' } } as never);
  useOcEditingStore.getState().stopEditing();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('D1036 §2.6 — a régua da vista "A chegar"', () => {
  it('só as emitidas, pela data combinada: as atrasadas no alto, as sem data no fim', () => {
    expect(ocsAChegar(OCS as OrdemCompra[]).map((o) => o.numero)).toEqual(['2026/011', '2026/015', '2026/013', '2026/010', '2026/012']);
    expect(quantasAtrasadas(ocsAChegar(OCS as OrdemCompra[]), HOJE)).toBe(2);
  });
  it('a frase de cada uma', () => {
    expect(fraseDaEntrega('2026-11-08', HOJE)).toBe('Atrasada 3 dias');
    expect(fraseDaEntrega('2026-11-10', HOJE)).toBe('Atrasada 1 dia');
    expect(fraseDaEntrega('2026-11-11', HOJE)).toBe('Chega hoje');
    expect(fraseDaEntrega('2026-11-12', HOJE)).toBe('Chega amanhã');
    expect(fraseDaEntrega('2026-11-14', HOJE)).toBe('Chega sábado, 14/11');
    expect(fraseDaEntrega('', HOJE)).toBe('Sem data combinada');
    expect(situacaoDaEntrega('2026-13-40x', HOJE)).toEqual({ tipo: 'sem-data' });
  });
});

describe('D1036 §2.6 — no Histórico', () => {
  const linhas = () => screen.getAllByRole('row').slice(1);

  it('"A chegar, pela data" mostra a data combinada, as atrasadas no alto, e o "Marcar entregue" ao lado', () => {
    render(<HistoricoPage />);
    // Nos outros filtros a tabela fica como era: sem a coluna da entrega.
    expect(screen.queryByRole('columnheader', { name: 'Entrega combinada' })).toBeNull();
    fireEvent.change(screen.getByDisplayValue('Todos os status'), { target: { value: 'a-chegar' } });
    expect(screen.getByRole('columnheader', { name: 'Entrega combinada' })).toBeTruthy();
    expect(screen.getByText('5 a chegar, 2 atrasadas')).toBeTruthy();
    const ls = linhas();
    expect(ls.map((l) => within(l).getByText(/^2026\/0\d\d$/).textContent)).toEqual([
      '2026/011', '2026/015', '2026/013', '2026/010', '2026/012',
    ]);
    expect(ls[0]!.textContent).toContain('08/11/2026');
    expect(within(ls[0]!).getByText('Atrasada 3 dias').closest('[data-entrega]')!.getAttribute('data-entrega')).toBe('atrasada');
    expect(ls[2]!.textContent).toContain('Chega hoje');
    expect(ls[4]!.textContent).toContain('Sem data combinada');
    for (const l of ls) expect(within(l).getByRole('button', { name: 'Marcar entregue' })).toBeTruthy();
  });

  it('o "Marcar entregue" da vista abre a avaliação do recebimento, a mesma de sempre', () => {
    render(<HistoricoPage />);
    fireEvent.change(screen.getByDisplayValue('Todos os status'), { target: { value: 'a-chegar' } });
    fireEvent.click(within(linhas()[0]!).getByRole('button', { name: 'Marcar entregue' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
