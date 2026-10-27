import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D953, D954: o rascunho que a IA monta pelo MCP da Central é uma OC comum,
 * com `origem_sistema = 'ia'` e o nome dela no `origem_id`. A IA nunca emite: a
 * tela avisa "Montado pela IA (nome). Confira antes de emitir." no Histórico e
 * na Nova OC. A cópia de uma OC dela é da pessoa, e sai sem a marca. Banco
 * FALSO; nomes inventados.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/registrosDoFornecedor', () => ({
  carregarRegistrosDoFornecedor: async () => ({ registros: [], marcas: [] }),
  prepararPapel: vi.fn(),
  lerPapelDoFornecedor: async () => null,
  arquivarPapelDoFornecedor: vi.fn(),
  guardarRegistroDoFornecedor: vi.fn(),
  corrigirRegistroDoFornecedor: vi.fn(),
}));
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  lerAvaliacoesDeEntrega: async () => [],
}));
vi.mock('../../src/services/storage/umaObra', async (original) => ({
  ...(await original<typeof import('../../src/services/storage/umaObra')>()),
  obraDaMascara: () => null,
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn() }));

import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { avisoDaIa } from '../../src/domain/montadaPelaIa';
import { paraOc } from '../../src/services/supabase/dados';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useRegistrosStore } from '../../src/stores/useRegistrosStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, OrdemCompra } from '../../src/domain/types';

const IA = 'Assistente (teste)';
const FORNECEDOR = { ...normalizeFornecedor({ id: 'f1', razao_social: 'Fornecedor (teste)' }), fornece_material: true };
const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });

const oc = (id: string, status: 'rascunho' | 'emitida', numero: string, daIa: boolean): OrdemCompra => ({
  ...normalizeOC({
    id, status, numero, fornecedor_id: FORNECEDOR.id, obra_id: OBRA.id, versao: 1, condicao_pagamento: 'À vista',
    itens: [normalizeItem({ descricao: 'Cimento (teste)', quantidade: 2, unidade: 'sc', preco_unit: 30 })],
  }),
  ...(daIa ? { montada_pela_ia: IA } : {}),
});
const RASCUNHO_DA_IA = oc('oc-1', 'rascunho', '', true);
const EMITIDA_DA_IA = oc('oc-2', 'emitida', '2026/010', true);
const RASCUNHO_DA_PESSOA = oc('oc-3', 'rascunho', '', false);
const EMITIDA_DA_PESSOA = oc('oc-4', 'emitida', '2026/011', false);

beforeEach(() => {
  useDataStore.setState({
    data: {
      config: { emitentes: [], condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '' },
      fornecedores: [FORNECEDOR],
      obras: [OBRA],
      ecrs: [],
      ordens_compra: [RASCUNHO_DA_IA, EMITIDA_DA_IA, RASCUNHO_DA_PESSOA, EMITIDA_DA_PESSOA],
    } as unknown as Data,
  });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useRegistrosStore.setState({ dados: null, erro: '', carregando: false });
  useOcEditingStore.getState().stopEditing();
});

const avisos = () => [...document.querySelectorAll('[data-montada-pela-ia]')].map((a) => a.textContent?.trim());

describe('D954 — o aviso do rascunho que a IA montou', () => {
  it('a marca vem da origem que o banco carimbou, e só da IA', () => {
    const linha = { id: 'x', status: 'rascunho', itens: [] };
    expect(paraOc({ ...linha, origem_sistema: 'ia', origem_id: IA }).montada_pela_ia).toBe(IA);
    expect(paraOc({ ...linha, origem_sistema: 'ia', origem_id: null }).montada_pela_ia).toBe('');
    expect(paraOc({ ...linha, origem_sistema: null, origem_id: null })).not.toHaveProperty('montada_pela_ia');
    expect(paraOc({ ...linha, origem_sistema: 'onedrive', origem_id: 'oc-velha' })).not.toHaveProperty('montada_pela_ia');
  });

  it('o texto: no rascunho pede a conferência; depois de emitida, diz só de onde veio', () => {
    expect(avisoDaIa(RASCUNHO_DA_IA)).toBe(`Montado pela IA (${IA}). Confira antes de emitir.`);
    expect(avisoDaIa(EMITIDA_DA_IA)).toBe(`Montado pela IA (${IA}).`);
    expect(avisoDaIa({ status: 'rascunho', montada_pela_ia: '' })).toBe('Montado pela IA. Confira antes de emitir.');
    expect(avisoDaIa({ status: 'rascunho', montada_pela_ia: 'x'.repeat(80) })).toMatch(/^Montado pela IA \(x{39}…\)\./);
    expect(avisoDaIa(RASCUNHO_DA_PESSOA)).toBe('');
  });

  it('no Histórico: o aviso nas duas OCs da IA, e em nenhuma da pessoa', () => {
    render(<HistoricoPage />);
    expect(avisos().sort()).toEqual([`Montado pela IA (${IA}).`, `Montado pela IA (${IA}). Confira antes de emitir.`]);
    const daEmitida = within(screen.getByText('2026/010').closest('tr')!);
    expect(daEmitida.getByText(`Montado pela IA (${IA}).`)).toBeInTheDocument();
    expect(within(screen.getByText('2026/011').closest('tr')!).queryByText(/Montado pela IA/)).toBeNull();
  });

  it('na Nova OC: o rascunho da IA abre com o aviso no alto; o da pessoa, sem', () => {
    useOcEditingStore.getState().startEditing(RASCUNHO_DA_IA);
    const { unmount } = render(<NovaOcPage />);
    expect(avisos()).toEqual([`Montado pela IA (${IA}). Confira antes de emitir.`]);
    unmount();
    useOcEditingStore.getState().startEditing(RASCUNHO_DA_PESSOA);
    render(<NovaOcPage />);
    expect(avisos()).toEqual([]);
  });

  it('a cópia de uma OC da IA é da pessoa: sai sem a marca, e sem o aviso', () => {
    render(<HistoricoPage />);
    fireEvent.click(within(screen.getByText('2026/010').closest('tr')!).getByRole('button', { name: 'Duplicar' }));
    const copia = useOcEditingStore.getState().ocEditing!;
    expect(copia.status).toBe('rascunho');
    expect(copia.montada_pela_ia).toBeUndefined();
    expect(avisoDaIa(copia)).toBe('');
  });
});
