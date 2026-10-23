import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type jsPDF from 'jspdf';

/**
 * CTO-D900, palavra do Pedro: "Pode tirar a coluna PRAZO dos itens, da tela e
 * do PDF." O prazo que vale é a "Entrega prevista" do alto da OC; o prazo por
 * item nunca foi preenchido. O banco não muda: a coluna fica lá, vazia, e a
 * tela para de mostrá-la e de mandá-la. OC, obra e fornecedor INVENTADOS.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { linhasDosItens } from '../../src/services/supabase/linhas';
import { corpoDaTabelaDeItens } from '../../src/services/pdf/tabelaDeItens';
import { desenhaPdfDaOc } from '../../src/services/pdf/generateOcPdf';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import type { Data } from '../../src/domain/types';

const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });
/** Um item de OC antiga, com o prazo preenchido à moda de antes. */
const ITEM_ANTIGO = normalizeItem({
  descricao: 'Cimento (teste)', quantidade: 40, unidade: 'sc', preco_unit: 30, prazo_entrega: '2026-05-30',
});
const OC_ANTIGA = normalizeOC({
  id: 'oc-teste', numero: '2026/001', status: 'emitida', data: '2026-05-20', fornecedor_id: 'f1', obra_id: OBRA.id,
  condicao_pagamento: 'À vista', itens: [ITEM_ANTIGO], versao: 1,
});

function textoDoPdf(doc: jsPDF): string {
  const paginas = (doc.internal as unknown as { pages: string[][] }).pages;
  return paginas
    .slice(1)
    .map((p) => Array.from(p.join('\n').matchAll(/\(((?:\\.|[^\\)])*)\) Tj/g), (m) => m[1]!.replace(/\\(.)/g, '$1')).join(' '))
    .join(' ');
}

beforeEach(() => {
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
  useOcEditingStore.getState().stopEditing();
});

describe('D900 — a coluna PRAZO dos itens saiu', () => {
  it('na Nova OC: a tabela de itens não tem a coluna nem o campo, e a "Entrega prevista" do alto fica', () => {
    useOcEditingStore.getState().startEditing(OC_ANTIGA);
    render(<NovaOcPage />);
    const tabela = screen.getByRole('columnheader', { name: 'Descrição' }).closest('table')!;
    expect(within(tabela).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(
      ['#', 'ECR', 'Descrição', 'Obs.', 'Qtd', 'Un', 'Preço Unit.', 'IPI%', 'Desc%', 'Total', ''],
    );
    expect(screen.queryByPlaceholderText('Ex: 7 dias')).toBeNull();
    expect(screen.getByLabelText('Entrega prevista')).toBeInTheDocument();
  });

  it('no PDF: as linhas da tabela de itens vão até o Total, e o prazo antigo não sai', () => {
    const [linha] = corpoDaTabelaDeItens([ITEM_ANTIGO]);
    expect(linha).toHaveLength(9);
    expect(linha!.at(-1)).toBe('R$ 1.200,00'.replace(' ', ' '));
    expect(linha!.join(' ')).not.toContain('30/05/2026');
  });

  it('o PDF de uma OC antiga, com prazo no item, continua saindo, sem a coluna "Prazo"', () => {
    const texto = textoDoPdf(desenhaPdfDaOc(OC_ANTIGA as never, useDataStore.getState().data as never, null));
    expect(texto).toContain('Cimento (teste)');
    // O cabeçalho acaba no Total, e logo vem a primeira linha.
    expect(texto).toMatch(/Desc ?%\s+Total\s+1\s+Cimento/);
    expect(texto).not.toMatch(/\bPrazo\b/);
    expect(texto).not.toContain('30/05/2026');
  });

  it('na gravação: o prazo por item não vai ao banco', () => {
    const [linha] = linhasDosItens([ITEM_ANTIGO]);
    expect(linha).not.toHaveProperty('prazo_entrega');
    expect(linha).toMatchObject({ descricao: 'Cimento (teste)', quantidade: 40, preco_unit: 30 });
  });
});
