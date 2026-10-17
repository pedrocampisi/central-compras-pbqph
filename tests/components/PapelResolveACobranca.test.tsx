import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

/**
 * Perícia de 16/10 (parte C), achado 7 — CTO-D850 §2: o papel guardado pela
 * OC resolve a cobrança. Depois do sucesso, a linha da entrega na lista das OCs
 * e o número do menu leem de novo, sem esperar a página recarregar. Banco
 * FALSO, em que a cobertura muda quando o papel é guardado; dados INVENTADOS.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(() => ({ guardado: false }) as {
  guardado: boolean; guardar: Mock; cobertura: Mock; semPapel: Mock;
});
vi.mock('../../src/services/supabase/registrosDoFornecedor', () => ({
  carregarRegistrosDoFornecedor: async () => ({ registros: [], marcas: [] }),
  prepararPapel: async () => ({ base64: 'JVBERg==', mime: 'application/pdf' }),
  lerPapelDoFornecedor: async () => null,
  arquivarPapelDoFornecedor: async () => 'doc-novo',
  guardarRegistroDoFornecedor: (...a: unknown[]) => banco.guardar(...a),
  corrigirRegistroDoFornecedor: vi.fn(),
}));
vi.mock('../../src/services/supabase/entregasSemPapel', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/entregasSemPapel')>()),
  lerCoberturaDasEntregas: () => banco.cobertura(),
  lerEntregasSemPapel: () => banco.semPapel(),
}));
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  lerAvaliacoesDeEntrega: async () => [{
    id: 31, ocId: OC_ID, intervencaoId: 'obra-teste', notaFiscal: '123', recebidoEm: '2026-10-10',
    prazoConforme: true, integridadeConforme: true, ocEcrConforme: true, naoConformes: 0, observacao: '', tratativa: '',
    avaliadoPorNome: 'Encarregado (teste)', cienciaPorNome: '', cienciaEm: '', cienciaNota: '', chegouTudo: true,
    fotoDocumentoId: '',
  }],
}));
vi.mock('../../src/services/supabase/recebimento', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/recebimento')>()),
  lerLinksDasFotos: async () => new Map(),
}));
vi.mock('../../src/services/storage/umaObra', async (original) => ({
  ...(await original<typeof import('../../src/services/storage/umaObra')>()),
  obraDaMascara: () => null,
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn() }));

const OC_ID = 'oc-001';

import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useEntregasSemPapelStore } from '../../src/stores/useEntregasSemPapelStore';
import { useRegistrosStore } from '../../src/stores/useRegistrosStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

const FORNECEDOR = normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)' });
const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });
const DADOS = {
  schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
  config: {
    emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
    condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '', texto_qualidade: '', pasta_backups: '',
  },
  fornecedores: [FORNECEDOR], obras: [OBRA],
  ecrs: [{ id: 12, codigo: 'ECR 12', nome: 'Madeira (teste)' }],
  ordens_compra: [normalizeOC({
    id: OC_ID, status: 'entregue', numero: '2026/001', fornecedor_id: FORNECEDOR.id, obra_id: OBRA.id, versao: 4,
    itens: [{ ...normalizeItem({ descricao: 'Tábua (teste)', quantidade: 2, unidade: 'un', preco_unit: 10 }), ecr_id: 12 }],
  })],
} as unknown as Data;

const cobertura = (situacao: 'sem_papel' | 'coberta') => [{
  avaliacaoId: 31, ecrId: 12, situacao, documentoId: situacao === 'coberta' ? 'doc-novo' : '',
  alcance: situacao === 'coberta' ? ('lote' as const) : null, validoAte: '', motivo: '',
}];
const pendencia = {
  avaliacaoId: 31, ocId: OC_ID, numero: '2026/001', obra: '', fornecedor: '', fornecedorId: '', recebidoEm: '2026-10-10',
  notaFiscal: '', avaliadoPorNome: '', ecrId: 12, ecr: 'ECR 12', nome: '', posicoes: [1], porque: '', linhas: [],
  observacao: '', aCadaEntrega: false,
};

beforeEach(() => {
  banco.guardado = false;
  banco.guardar = vi.fn(async () => {
    banco.guardado = true;
    return 50;
  });
  banco.cobertura = vi.fn(async () => cobertura(banco.guardado ? 'coberta' : 'sem_papel'));
  banco.semPapel = vi.fn(async () => (banco.guardado ? [] : [pendencia]));
  useDataStore.setState({ data: DADOS });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useRegistrosStore.setState({ dados: null, erro: '', carregando: false });
  useEntregasSemPapelStore.setState({ linhas: [pendencia], erro: '', carregando: false });
});

describe('o papel guardado pela OC resolve a cobrança (achado 7)', () => {
  it('a linha da entrega deixa de dizer "sem papel", e o número do menu lê de novo', async () => {
    render(<HistoricoPage />);
    const linha = () => screen.getByText('2026/001').closest('tr')!;
    await waitFor(() => expect(within(linha()).getByText('ECR 12: sem papel')).toBeTruthy());
    expect(useEntregasSemPapelStore.getState().linhas).toHaveLength(1);
    const coberturasAntes = banco.cobertura.mock.calls.length;

    fireEvent.click(within(linha()).getByRole('button', { name: 'Anexar papel' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    fireEvent.change(janela.querySelector('input[type="file"]')!, {
      target: { files: [new File([new Uint8Array([1])], 'guia.pdf', { type: 'application/pdf' })] },
    });
    await waitFor(() => expect(within(janela).getByLabelText<HTMLInputElement>('Deste lote').checked).toBe(true));
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    await waitFor(() => expect(banco.guardar).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(within(linha()).getByText('ECR 12: deste lote')).toBeTruthy());
    expect(within(linha()).queryByText('ECR 12: sem papel')).toBeNull();
    expect(banco.cobertura.mock.calls.length).toBe(coberturasAntes + 1);
    await waitFor(() => expect(useEntregasSemPapelStore.getState().linhas).toEqual([]));
    expect(banco.semPapel).toHaveBeenCalledTimes(1);
  });
});
