import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

/**
 * A sigla ECR por extenso (CTO-D728 §1, pedido do Pedro): em cada tela, na
 * primeira vez que ela aparece, vem por extenso ou com o "?" que diz o que é.
 * Um "?" só por tela, no lugar da primeira aparição. Empresa, obra e
 * fornecedor são INVENTADOS; nada sai daqui.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { QualificarDialogo } from '../../src/features/fornecedores/QualificarDialogo';
import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { O_QUE_E_ECR } from '../../src/domain/ecr';
import { normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import type { Data } from '../../src/domain/types';

const PERGUNTA = 'Ajuda: O que é ECR';

const MATERIAL = {
  categoria: 'material' as const,
  nome: 'Materiais',
  minimo: 2,
  criterios: ['Critério um?', 'Critério dois?', 'Critério três?'],
};

function caixa(porque?: string) {
  render(
    <QualificarDialogo
      filial={{ id: 'f1', empresa_id: 'e1', razao_social: 'Fornecedor (teste)' } as never}
      categoria={MATERIAL}
      ecrs={[{ id: 19, codigo: 'ECR 19', nome: 'Material de teste' }]}
      ecrsMarcadas={[19]}
      porque={porque}
      aoGravar={() => {}}
      aoVoltar={() => {}}
    />,
  );
  return document.querySelector('[data-dialogo-qualificar]') as HTMLElement;
}

beforeEach(() => {
  useOcEditingStore.getState().stopEditing();
});

describe('o "?" da sigla diz o que é', () => {
  it('a frase fala da Especificação de Compra e Recebimento, e abre na página', () => {
    expect(O_QUE_E_ECR).toMatch(/^ECR é a Especificação de Compra e Recebimento/);
    const c = caixa();
    fireEvent.click(within(c).getByRole('button', { name: PERGUNTA }));
    expect(within(c).getByRole('note').textContent).toContain(O_QUE_E_ECR);
  });
});

describe('o "Qualificar agora": um "?" só, na primeira vez que a sigla aparece', () => {
  it('aberto pela trava, a frase dela fala de ECR: o "?" vai nela, e não nas ECRs para marcar', () => {
    const c = caixa('Esta OC tem material controlado (ECR 19), e a empresa não tem qualificação de material.');
    expect(within(c).getAllByRole('button', { name: PERGUNTA })).toHaveLength(1);
    expect(c.querySelector('[data-porque]')!.querySelector('button')).not.toBeNull();
  });

  it('aberto pela ficha, sem a frase: o "?" vai nas ECRs para marcar', () => {
    const c = caixa();
    expect(within(c).getAllByRole('button', { name: PERGUNTA })).toHaveLength(1);
    expect(within(c).getByText(/Qualificada para as ECRs/).closest('legend')!.querySelector('button')).not.toBeNull();
  });
});

describe('a Nova OC: o "?" antes da coluna ECR', () => {
  it('sem fornecedor escolhido, o "?" fica no título "Itens", uma vez só', () => {
    const obra = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });
    useDataStore.setState({
      data: {
        config: { emitentes: [], condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '' },
        fornecedores: [],
        obras: [obra],
        ecrs: [{ id: 19, codigo: 'ECR 19', nome: 'Material de teste' }],
        ordens_compra: [],
      } as unknown as Data,
    });
    useAuthStore.setState({ perfil: { papel: 'admin' } as never });
    useOcEditingStore.getState().startEditing(
      normalizeOC({
        id: 'oc-teste', status: 'rascunho', data: '2026-10-05', obra_id: obra.id,
        itens: [normalizeItem({ descricao: 'Item (teste)', quantidade: 1, unidade: 'un', preco_unit: 1 })],
      }),
    );
    render(<NovaOcPage />);
    const botoes = screen.getAllByRole('button', { name: PERGUNTA });
    expect(botoes).toHaveLength(1);
    expect(botoes[0]!.parentElement!.parentElement!.querySelector('h3')!.textContent).toBe('Itens');
  });
});
