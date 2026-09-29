import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

/**
 * Perícia de 28/09 sobre `fe119e6..ebbebb0` (fornecedores), achado 3: a
 * situação da qualificação é calculada pelo banco na leitura e guardada na
 * loja; a meia-noite de Brasília passava e ela ficava.
 * Medidas na decisão 62, TRAVAS desde o conserto (CTO-D620).
 * O esperado vem da data e da regra do contrato (`situacao_qualificacao`:
 * vencida quando vence antes de hoje; "vence em até 30 dias" quando vence até
 * hoje + 30), não de uma situação fabricada: a loja recebe o que o banco
 * mandaria na hora da carga. Banco falso; o gerador do PDF só anota as seções.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: async () => {} }));
const pdfs = vi.hoisted(() => [] as { secoes: { linhas: string[][] }[]; hoje: string }[]);
vi.mock('../../src/services/pdf/generateFolhasDoAuditor', () => ({
  baixarPdfDosQualificados: async (secoes: { linhas: string[][] }[], hoje: string) => {
    pdfs.push({ secoes, hoje });
  },
}));

import { FornecedoresPage } from '../../src/features/fornecedores/FornecedoresPage';
import { qualificacaoParaEmitir } from '../../src/features/ordens-compra/qualificacaoParaEmitir';
import { normalizeFornecedor } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { LinhaDeQualificacao, Situacao } from '../../src/domain/qualificacao';
import type { Data, Fornecedor } from '../../src/domain/types';

const FILIAL: Fornecedor = {
  ...normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)' }),
  fornece_material: true,
  presta_servico: false,
  empresa_id: 'empresa-a',
};

function carregar(venceEm: string, situacaoDoBancoNaCarga: Situacao) {
  const linha: LinhaDeQualificacao = {
    id: 1, empresaRaizId: 'empresa-a', fornecedorId: null, categoria: 'material', tipo: 'Cimento',
    qualificadaEm: '2025-09-28', venceEm,
    criterios: [{ atende: true, motivo: '' }, { atende: true, motivo: '' }, { atende: true, motivo: '' }],
    nota: 3, minimo: 2, qualificada: true, qualificadoPorNome: '', origem: '',
    situacao: situacaoDoBancoNaCarga, ecrs: [], vigente: true,
  };
  useQualificacaoStore.getState().definir({
    linhas: [linha],
    categorias: [{ categoria: 'material', nome: 'Materiais', minimo: 2, criterios: ['Qualidade', 'Preço', 'Prazo'] }],
    tratativas: [],
    desempenho: [],
  });
}

async function pdfAgora() {
  render(<FornecedoresPage />);
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /PDF dos qualificados/ }));
  });
  expect(pdfs).toHaveLength(1);
  return { linha: pdfs[0]!.secoes[0]!.linhas[0]!, hoje: pdfs[0]!.hoje, lista: screen.getByText('Filial A (teste)').closest('tr')!.textContent };
}

const ANTES_DA_MEIA_NOITE = new Date('2026-09-29T02:59:00Z'); // 28/09, 23:59 em Brasília
const DEPOIS_DA_MEIA_NOITE = new Date('2026-09-29T03:01:00Z'); // 29/09, 00:01 em Brasília

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(ANTES_DA_MEIA_NOITE);
  pdfs.length = 0;
  useDataStore.setState({
    data: { fornecedores: [FILIAL], obras: [], ecrs: [], ordens_compra: [], config: {} } as unknown as Data,
  });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [], fornFilter: { search: '', status: 'todos' } } as never);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Perícia 28/09 (fornecedores), achado 3 — a situação de ontem no PDF de hoje', () => {
  it('controle: antes da meia-noite, a situação da carga é a do dia, e o PDF a diz', async () => {
    carregar('2026-09-28', 'vence_em_30_dias');
    const { linha, hoje } = await pdfAgora();
    expect(hoje).toBe('2026-09-28');
    expect(linha).toContain('Vence em até 30 dias');
  });

  it('último dia válido, carregada às 23:59 de 28/09: às 00:01 de 29/09 o PDF diz "Vencida"', async () => {
    carregar('2026-09-28', 'vence_em_30_dias');
    vi.setSystemTime(DEPOIS_DA_MEIA_NOITE);
    const { linha, hoje } = await pdfAgora();
    expect(hoje).toBe('2026-09-29'); // a data do PDF já é a de hoje
    expect(linha).toContain('Vencida');
  });

  it('o mesmo, no selo da lista aberta depois da meia-noite', async () => {
    carregar('2026-09-28', 'vence_em_30_dias');
    vi.setSystemTime(DEPOIS_DA_MEIA_NOITE);
    const { lista } = await pdfAgora();
    expect(lista).toContain('Vencida desde 28/09/2026');
  });

  it('de 31 para 30 dias: vence em 29/10, carregada como "qualificada" em 28/09; às 00:01 de 29/09 "vence em até 30 dias"', async () => {
    carregar('2026-10-29', 'qualificada');
    vi.setSystemTime(DEPOIS_DA_MEIA_NOITE);
    const { linha, hoje } = await pdfAgora();
    expect(hoje).toBe('2026-09-29');
    expect(linha).toContain('Vence em até 30 dias');
  });

  it('a lista aberta às 23:59 muda o selo sozinha à meia-noite, sem recarga nem clique', async () => {
    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(ANTES_DA_MEIA_NOITE);
    carregar('2026-09-28', 'vence_em_30_dias');
    render(<FornecedoresPage />);
    const linha = () => screen.getByText('Filial A (teste)').closest('tr')!.textContent;
    expect(linha()).toContain('Vence em 28/09/2026');
    await act(async () => vi.advanceTimersByTime(2 * 60_000));
    expect(linha()).toContain('Vencida desde 28/09/2026');
  });

  it('a emissão depois da meia-noite: a trava lê a situação do dia, e recusa o que venceu ontem', () => {
    carregar('2026-09-28', 'vence_em_30_dias');
    const oc = { fornecedor_id: 'filial-a', itens: [{ ecr_id: 12 }] } as never;
    expect(qualificacaoParaEmitir(oc, [FILIAL]).selo!.situacao).toBe('vence_em_30_dias');
    vi.setSystemTime(DEPOIS_DA_MEIA_NOITE);
    const q = qualificacaoParaEmitir(oc, [FILIAL]);
    expect(q.selo!.situacao).toBe('vencida');
    expect(q.trava).toContain('venceu em 28/09/2026');
  });
});
