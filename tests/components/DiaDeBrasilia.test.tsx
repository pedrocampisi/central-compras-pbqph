import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D621 §2, junto com o B7 da perícia de 28/09 (a mesma família): primeiro
 * Brasília, depois corta a data. Às 21h30 de 28/09 em Brasília já é 29/09 em
 * UTC, e o Duplicar do Histórico, que cortava o instante em UTC
 * (`toISOString().slice(0, 10)`), fazia a OC nascer com a data de amanhã. E o
 * `todayIso` da Nova OC seguia o relógio do computador: a segunda regra para a
 * mesma coisa. A casa passa a ter um "hoje" só. Banco falso: nada sai daqui.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { todayIso } from '../../src/domain/format';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import type { Data } from '../../src/domain/types';

const FORNECEDOR = normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)' });
const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });

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
    ordens_compra: [
      normalizeOC({
        id: 'oc-1', status: 'emitida', numero: '2026/001', data: '2026-09-01', fornecedor_id: FORNECEDOR.id,
        obra_id: OBRA.id, versao: 1,
        itens: [normalizeItem({ descricao: 'Cimento (teste)', quantidade: 1, unidade: 'sc', preco_unit: 30 })],
      }),
    ],
  } as unknown as Data;
}

const NOITE_DE_28 = new Date('2026-09-29T00:30:00Z'); // 21h30 de 28/09 em Brasília
const fusoDaMaquina = process.env.TZ;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOITE_DE_28);
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useOcEditingStore.getState().stopEditing();
});
afterEach(() => {
  vi.useRealTimers();
  process.env.TZ = fusoDaMaquina;
});

describe('CTO-D621 — das 21h à meia-noite, o dia é o de Brasília', () => {
  it('a OC duplicada às 21h30 nasce com a data de 28/09, e não a de amanhã', () => {
    render(<HistoricoPage />);
    fireEvent.click(within(screen.getByText('2026/001').closest('tr')!).getByRole('button', { name: 'Duplicar' }));
    const rascunho = useOcEditingStore.getState().ocEditing!;
    expect(rascunho.data).toBe('2026-09-28');
    expect(rascunho.ano).toBe(2026);
  });

  it('o "hoje" da Nova OC é o de Brasília, qualquer que seja o relógio do computador', () => {
    process.env.TZ = 'Asia/Tokyo'; // lá já é 29/09, 9h30
    expect(todayIso()).toBe('2026-09-28');
  });
});
