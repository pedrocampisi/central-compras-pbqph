import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

/**
 * CTO-D811 §4.3, D812 §2: o papel deste lote que chega por e-mail entra pelo
 * "Anexar papel" na OC. O botão está na OC emitida ou entregue, com ECR, para
 * quem emite OC; a janela guarda pela OC. Banco FALSO; dados inventados.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(() => ({}) as { arquivar: Mock; guardar: Mock; carregar: Mock });
vi.mock('../../src/services/supabase/registrosDoFornecedor', () => ({
  carregarRegistrosDoFornecedor: () => banco.carregar(),
  prepararPapel: async () => ({ base64: 'JVBERg==', mime: 'application/pdf' }),
  lerPapelDoFornecedor: async () => null,
  arquivarPapelDoFornecedor: (...a: unknown[]) => banco.arquivar(...a),
  guardarRegistroDoFornecedor: (...a: unknown[]) => banco.guardar(...a),
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
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useRegistrosStore } from '../../src/stores/useRegistrosStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

const FORNECEDOR = normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)' });
const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });

const oc = (id: string, status: 'rascunho' | 'emitida' | 'entregue' | 'cancelada', ecr: number | null = 12) =>
  normalizeOC({
    id, status, numero: `2026/${id}`, fornecedor_id: FORNECEDOR.id, obra_id: OBRA.id, versao: 4,
    itens: [
      normalizeItem({ descricao: 'Cimento (teste)', quantidade: 1, unidade: 'sc', preco_unit: 30 }),
      { ...normalizeItem({ descricao: 'Tábua (teste)', quantidade: 2, unidade: 'un', preco_unit: 10 }), ecr_id: ecr },
    ],
  });

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [FORNECEDOR], obras: [OBRA],
    ecrs: [{ id: 12, codigo: 'ECR 12', nome: 'Madeira (teste)' }],
    ordens_compra: [
      oc('001', 'emitida'), oc('002', 'entregue'), oc('003', 'rascunho'), oc('004', 'cancelada'), oc('005', 'emitida', null),
    ],
  } as unknown as Data;
}

const linhaDa = (numero: string) => screen.getByText(numero).closest('tr')!;
const temBotao = (numero: string) => !!within(linhaDa(numero)).queryByRole('button', { name: 'Anexar papel' });

beforeEach(() => {
  banco.arquivar = vi.fn(async () => 'doc-novo');
  banco.guardar = vi.fn(async () => 50);
  banco.carregar = vi.fn(async () => ({ registros: [], marcas: [] }));
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useRegistrosStore.setState({ dados: null, erro: '', carregando: false });
});

describe('o "Anexar papel" na lista das OCs', () => {
  it('na emitida e na entregue com ECR; não no rascunho, na cancelada, nem na OC sem ECR', () => {
    render(<HistoricoPage />);
    expect(temBotao('2026/001')).toBe(true);
    expect(temBotao('2026/002')).toBe(true);
    expect(temBotao('2026/003')).toBe(false);
    expect(temBotao('2026/004')).toBe(false);
    expect(temBotao('2026/005')).toBe(false);
  });

  it('quem só lê não vê', () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    render(<HistoricoPage />);
    expect(temBotao('2026/001')).toBe(false);
  });

  it('a janela fala da OC e da ECR dela, e guarda pela OC: o lote entra, e a lista dos papéis lê de novo', async () => {
    render(<HistoricoPage />);
    fireEvent.click(within(linhaDa('2026/001')).getByRole('button', { name: 'Anexar papel' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    expect(janela.textContent).toContain('OC 2026/001 · Filial A (teste)');
    expect(janela.textContent).toContain('ECR 12 — Madeira (teste)');
    fireEvent.change(janela.querySelector('input[type="file"]')!, {
      target: { files: [new File([new Uint8Array([1])], 'gca.pdf', { type: 'application/pdf' })] },
    });
    await waitFor(() => expect(within(janela).getByLabelText<HTMLInputElement>('Deste lote').checked).toBe(true));
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    await waitFor(() => expect(banco.guardar).toHaveBeenCalledTimes(1));
    const ocId = useDataStore.getState().data!.ordens_compra[0]!.id;
    expect(banco.guardar).toHaveBeenCalledWith({
      documentoId: 'doc-novo', ecrId: 12, alcance: 'lote', validoAte: '', onde: { ocId, fornecedorId: 'filial-a' },
    });
    // Uma ao abrir (as marcas), e outra depois de guardar.
    await waitFor(() => expect(banco.carregar).toHaveBeenCalledTimes(2));
  });

  it('na ECR com a marca "a cada entrega", o lote não entra pela OC, e a janela manda à lista das entregas sem papel (D840 §2.3)', async () => {
    banco.carregar = vi.fn(async () => ({ registros: [], marcas: [{ ecrId: 12, porque: 'a GCA de cada transporte (teste)' }] }));
    render(<HistoricoPage />);
    fireEvent.click(within(linhaDa('2026/001')).getByRole('button', { name: 'Anexar papel' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    await waitFor(() => expect(useRegistrosStore.getState().dados).not.toBeNull());
    fireEvent.change(janela.querySelector('input[type="file"]')!, {
      target: { files: [new File([new Uint8Array([1])], 'licenca.pdf', { type: 'application/pdf' })] },
    });
    await waitFor(() => expect(within(janela).getByLabelText('Vale até uma data')).toBeTruthy());
    expect(within(janela).queryByLabelText('Deste lote')).toBeNull();
    expect(janela.textContent).toContain(
      'A ECR 12 pede o papel a cada entrega: anexe pela entrega, em Recebimentos, na lista das entregas sem papel.',
    );
    expect(janela.textContent).toContain('não cobrem as entregas desta ECR');
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    expect(within(janela).getByRole('alert').textContent).toBe('Escolha a quem o papel vale.');
    expect(banco.guardar).not.toHaveBeenCalled();
    fireEvent.click(within(janela).getByLabelText('Vale até uma data'));
    fireEvent.change(within(janela).getByLabelText('Vale até'), { target: { value: '2027-06-30' } });
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    await waitFor(() => expect(banco.guardar).toHaveBeenCalledTimes(1));
    expect(banco.guardar.mock.calls[0]![0]).toMatchObject({ ecrId: 12, alcance: 'vale_ate', validoAte: '2027-06-30' });
  });
});
