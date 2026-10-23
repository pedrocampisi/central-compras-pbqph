/**
 * CTO-D888, D888b, D889 e D890 — na tela: o papel que o Pedro leu em 23/10,
 * pela resposta de mentira no formato combinado com o Banco (`total_linha`,
 * `subtotal`, `desconto_nas_linhas`, `nome_emitente`). A OC fecha em 456,00, o
 * desconto entra uma vez só, o −0,01 vem declarado, o cartão mostra os dois
 * totais, e o fornecedor sai pelo nome, na matriz. Empresas INVENTADAS.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

const lerPedido = vi.fn<(arquivos: File[]) => Promise<unknown>>();
vi.mock('../../src/services/ai/lerPedido', async (original) => ({
  ...(await original<typeof import('../../src/services/ai/lerPedido')>()),
  lerPedido: (arquivos: File[]) => lerPedido(arquivos),
}));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { normalizeFornecedor } from '../../src/domain/normalize';
import { computeOcTotals } from '../../src/domain/compute';
import { paraResultado } from '../../src/services/ai/extractItems';
import type { Data } from '../../src/domain/types';

const filial = (id: string, cnpj: string) => ({
  ...normalizeFornecedor({ id, razao_social: 'Casa das Conexões Ltda (teste)', cnpj }),
  ativo: true,
  fornece_material: true,
  empresa_id: 'casa',
});

const DADOS = {
  schema_version: 1, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
  config: {
    emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
    condicoes_pagamento: ['À vista', 'Boleto 30 dias'], texto_condicoes_contratacao: '', texto_envio_nf: '',
    texto_qualidade: '', pasta_backups: '',
  },
  // A matriz (0001) não é a primeira da lista: quem escolhe é a regra, não a ordem.
  fornecedores: [filial('c2', '33333333000281'), filial('c1', '33333333000100'), filial('c3', '33333333000362')],
  obras: [], ecrs: [], ordens_compra: [],
} as unknown as Data;

/** [QTD, VALOR TABELA, TOTAL] do papel (D889), e o desconto que a leitura pôs, em duas casas. */
const LINHAS: [number, number, number][] = [
  [6, 9.62, 48.98], [1, 7.02, 5.96], [1, 46.25, 39.24], [1, 3.9, 3.31], [1, 10.34, 8.78], [1, 8.58, 7.28],
  [4, 20.41, 69.28], [4, 11.66, 39.59], [5, 6.5, 27.58], [1, 161.07, 136.68], [1, 81.69, 69.33],
];
const DESC_LIDO = [15.17, 15.08, 15.15, 15.14, 15.13, 15.18, 15.14, 15.18, 15.09, 15.15, 15.13];

const cabecalho = (c: Record<string, unknown> = {}) => ({
  cnpj_emitente: '', condicao_pagamento: '', entrega_texto: '', entrega_dias: null, entrega_data: '',
  frete: null, outras_despesas: null, desconto: null, total: null, confira: '', ...c,
});
const DO_PAPEL = {
  itens: LINHAS.map(([qtd, tabela, total], i) => ({
    descricao: `Item ${i + 1} (teste)`, observacao: '', unidade: 'pç', quantidade: qtd,
    preco_unit: tabela, ipi_pct: 0, desc_pct: DESC_LIDO[i], ecr_id: null, total_linha: total,
  })),
  ignoradas: [],
  cabecalho: cabecalho({
    subtotal: 537.38, desconto: 81.38, total: 456, desconto_nas_linhas: true,
    nome_emitente: 'CASA DAS CONEXÕES LTDA - ME',
  }),
  _meta: { leitor: 'rapido' },
};

const png = () => new File(['png'], 'orcamento.png', { type: 'image/png' });
const oc = () => useOcEditingStore.getState().ocEditing!;
const confira = (c: string) => document.querySelector(`[data-confira-do-alto="${c}"]`);

async function ler(resposta: unknown) {
  lerPedido.mockResolvedValueOnce(paraResultado(resposta));
  await userEvent.click(screen.getByRole('button', { name: /Importar Pedido \(IA\)/ }));
  const e = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'clipboardData', { value: { files: [png()] } });
  act(() => {
    document.body.dispatchEvent(e);
  });
  await screen.findByDisplayValue('Item 1 (teste)');
}

beforeEach(() => {
  lerPedido.mockReset();
  useOcEditingStore.getState().stopEditing();
  useDataStore.setState({ data: DADOS });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
});

describe('D888 — o papel de 23/10 na Nova OC', () => {
  it('a OC fecha em 456,00: as linhas no total impresso, o desconto uma vez só, o −0,01 declarado', async () => {
    render(<NovaOcPage />);
    await ler(DO_PAPEL);
    expect(Math.round(computeOcTotals(oc()).total_geral * 100)).toBe(45600);
    expect(oc().desconto_material).toBe(0.01);
    expect(oc().outras_despesas).toBe(0);
    expect(confira('desconto')).toHaveTextContent('Com o arredondamento do orçamento (veja acima). Confira.');
    const conta = document.querySelector('[data-conta-do-papel]');
    expect(conta).toHaveTextContent(/O desconto do orçamento \(R\$\s81,38\) já está nos preços das linhas\./);
    expect(conta).toHaveTextContent(/a diferença de R\$\s0,01 entra como arredondamento do orçamento/);
    expect(document.querySelector('[data-conferencia-do-total]')).toHaveAttribute('data-conferencia-do-total', 'bate');
  });

  it('o cartão "Total lido" põe o que o orçamento diz ao lado do que a OC soma', async () => {
    render(<NovaOcPage />);
    await ler(DO_PAPEL);
    const dois = document.querySelector('[data-dois-totais]');
    expect(dois).toHaveAttribute('data-dois-totais', 'bate');
    expect(dois).toHaveTextContent(/O orçamento diz R\$\s456,00/);
    expect(dois).toHaveTextContent(/A OC soma R\$\s456,00/);
    expect(dois).toHaveTextContent('Os dois batem.');
  });

  it('sem CNPJ, o fornecedor sai pelo nome impresso, e entra a matriz', async () => {
    render(<NovaOcPage />);
    await ler(DO_PAPEL);
    expect(oc().fornecedor_id).toBe('c1');
    expect(confira('fornecedor')).toHaveTextContent('Escolhido pelo nome do orçamento. Confira.');
    expect(confira('fornecedor')).not.toHaveTextContent(/filial/i);
  });

  it('a função de hoje (sem `total_linha` e sem a marca), com o 81,38 no cabeçalho e o desconto nas linhas: o "Desconto material" fica vazio (D892)', async () => {
    render(<NovaOcPage />);
    await ler({
      ...DO_PAPEL,
      itens: DO_PAPEL.itens.map((it) => ({ ...it, total_linha: undefined })),
      cabecalho: cabecalho({ desconto: 81.38, total: 456 }),
    });
    expect(oc().desconto_material).toBe(0);
    expect(confira('desconto')).toBeNull();
    expect(oc().itens.every((it) => it.desc_pct > 15)).toBe(true);
    expect(document.querySelector('[data-conta-do-papel]')).toHaveTextContent(/desconto de R\$\s81,38, e a leitura não soube/);
  });

  it('a leitura que não sabe se o desconto está nas linhas (`null`): ele não entra, e a tela pede à pessoa', async () => {
    render(<NovaOcPage />);
    await ler({
      itens: [{ descricao: 'Item 1 (teste)', quantidade: 2, unidade: 'pç', preco_unit: 50, desc_pct: 0 }],
      cabecalho: cabecalho({ desconto: 12.5, total: 87.5 }),
    });
    expect(oc().desconto_material).toBe(0);
    expect(confira('desconto')).toBeNull();
    expect(document.querySelector('[data-conta-do-papel]')).toHaveTextContent(
      /O orçamento diz um desconto de R\$\s12,50, e a leitura não soube se ele já está nos preços das linhas\./,
    );
  });
});
