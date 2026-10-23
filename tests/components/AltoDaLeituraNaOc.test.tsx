/**
 * CTO-D805 §2 — na tela: a leitura do orçamento preenche o alto da OC, cada
 * campo com o "Confira", e não pisa no que a pessoa pôs. A leitura é FALSA
 * (o `cabecalho` que o Banco vai mandar); empresas e números INVENTADOS.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
import { normalizeFornecedor, normalizeOC } from '../../src/domain/normalize';
import { somaDias } from '../../src/domain/qualificacao';
import type { CabecalhoLido } from '../../src/domain/cabecalhoLido';
import type { Data } from '../../src/domain/types';

const fornecedor = (id: string, cnpj: string) => ({
  ...normalizeFornecedor({ id, razao_social: `Empresa ${id} (teste)`, cnpj }),
  ativo: true,
  fornece_material: true,
});

const DADOS = {
  schema_version: 1, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
  config: {
    emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
    condicoes_pagamento: ['À vista', 'Boleto 30 dias'], texto_condicoes_contratacao: '', texto_envio_nf: '',
    texto_qualidade: '', pasta_backups: '',
  },
  fornecedores: [fornecedor('b1', '22222222000100')], obras: [], ecrs: [], ordens_compra: [],
} as unknown as Data;

const ITEM = { id: 'i1', descricao: 'Cimento (teste)', observacao: '', quantidade: 10, unidade: 'sc', preco_unit: 100, ipi_pct: 0, desc_pct: 0, ecr_id: null };

const cab = (c: Partial<CabecalhoLido> = {}): CabecalhoLido => ({
  cnpj_emitente: '', condicao_pagamento: '', entrega_texto: '', entrega_dias: null, entrega_data: '',
  frete: null, outras_despesas: null, desconto: null, total: null,
  subtotal: null, desconto_nas_linhas: null, nome_emitente: '', confira: '', ...c,
});
/** O desconto do rodapé é do orçamento inteiro, não está nas linhas: a leitura diz `false` (D890). */
const ORCAMENTO = cab({
  cnpj_emitente: '22222222000100', condicao_pagamento: '28 dias', entrega_texto: '3 dias', entrega_dias: 3,
  frete: 80, desconto: 12.5, desconto_nas_linhas: false, total: 1000,
});

const png = () => new File(['png'], 'orcamento.png', { type: 'image/png' });
const oc = () => useOcEditingStore.getState().ocEditing!;
/** O select da condição (o Field não liga o rótulo ao select). */
const condicao = () => screen.getByRole('option', { name: 'Boleto 30 dias' }).closest('select')!;
const confira = (c: string) => document.querySelector(`[data-confira-do-alto="${c}"]`);

async function lerOrcamento(cabecalho: CabecalhoLido | undefined) {
  lerPedido.mockResolvedValueOnce({ itens: [ITEM], confira: {}, ignoradas: [], cabecalho });
  await userEvent.click(screen.getByRole('button', { name: /Importar Pedido \(IA\)/ }));
  const e = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'clipboardData', { value: { files: [png()] } });
  act(() => {
    document.body.dispatchEvent(e);
  });
  await screen.findByDisplayValue('Cimento (teste)');
}

beforeEach(() => {
  lerPedido.mockReset();
  useOcEditingStore.getState().stopEditing();
  useDataStore.setState({ data: DADOS });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
});

describe('D805 §2 — a leitura monta o alto da OC', () => {
  it('o CNPJ bate: fornecedor, condição, entrega, frete e desconto entram, cada um com o "Confira"', async () => {
    render(<NovaOcPage />);
    await lerOrcamento(ORCAMENTO);
    expect(oc().fornecedor_id).toBe('b1');
    expect(oc().condicao_pagamento).toBe('28 dias');
    expect(oc().entrega_prevista).toBe(somaDias(oc().data, 3));
    expect(oc().frete).toBe(80);
    expect(oc().desconto_material).toBe(12.5);
    expect(oc().outras_despesas).toBe(0);
    for (const c of ['fornecedor', 'condicao', 'entrega', 'frete', 'desconto']) expect(confira(c), c).not.toBeNull();
    expect(confira('outras')).toBeNull();
    expect(confira('fornecedor')).toHaveTextContent('Escolhido pelo CNPJ do orçamento. Confira.');
    expect(confira('entrega')).toHaveTextContent('3 dias corridos a partir da Data da OC');
    // A condição como o papel escreve entra na lista, escolhida.
    expect(screen.getByRole('option', { name: '28 dias' })).toHaveProperty('selected', true);
  });

  it('"Está certo" e mexer no campo tiram o "Confira"', async () => {
    render(<NovaOcPage />);
    await lerOrcamento(ORCAMENTO);
    await userEvent.click(confira('fornecedor')!.querySelector('button')!);
    expect(confira('fornecedor')).toBeNull();
    expect(oc().fornecedor_id).toBe('b1');
    fireEvent.change(screen.getByLabelText('Entrega prevista'), { target: { value: '2026-12-01' } });
    expect(confira('entrega')).toBeNull();
    expect(confira('condicao')).not.toBeNull();
  });

  it('o campo posto à mão fica, e o resumo diz o que o orçamento dizia', async () => {
    render(<NovaOcPage />);
    await userEvent.selectOptions(condicao(), 'Boleto 30 dias');
    await lerOrcamento(ORCAMENTO);
    expect(oc().condicao_pagamento).toBe('Boleto 30 dias');
    expect(confira('condicao')).toBeNull();
    expect(document.querySelector('[data-nao-pisou="condicao"]')).toHaveTextContent(
      'Condição de pagamento: ficou o que você já tinha posto. O orçamento diz "28 dias".',
    );
    // O resto, que estava livre, entrou.
    expect(oc().fornecedor_id).toBe('b1');
  });

  it('o rascunho salvo: o "À vista" e o frete que já estavam gravados ficam', async () => {
    useOcEditingStore.getState().startEditing(normalizeOC({
      id: 'oc1', data: '2026-10-16', condicao_pagamento: 'À vista', frete: 50, entrega_prevista: '2026-10-30', versao: 1,
    }));
    render(<NovaOcPage />);
    await lerOrcamento(ORCAMENTO);
    expect(oc().condicao_pagamento).toBe('À vista');
    expect(oc().frete).toBe(50);
    expect(oc().entrega_prevista).toBe('2026-10-30');
    expect(document.querySelector('[data-nao-pisou="condicao"]')).toHaveTextContent('"28 dias"');
    expect(document.querySelector('[data-nao-pisou="frete"]')).toHaveTextContent('R$ 80,00');
    expect(document.querySelector('[data-nao-pisou="entrega"]')).not.toBeNull();
    // O vazio do rascunho entra.
    expect(oc().fornecedor_id).toBe('b1');
    expect(oc().desconto_material).toBe(12.5);
  });

  it('a segunda leitura não pisa no campo que a pessoa conferiu e mudou', async () => {
    render(<NovaOcPage />);
    await lerOrcamento(ORCAMENTO);
    await userEvent.selectOptions(condicao(), 'À vista');
    await lerOrcamento(cab({ ...ORCAMENTO, condicao_pagamento: '30/60 dias' }));
    expect(oc().condicao_pagamento).toBe('À vista');
    expect(document.querySelector('[data-nao-pisou="condicao"]')).toHaveTextContent('"30/60 dias"');
  });

  it('o CNPJ que não está no cadastro: o fornecedor fica vazio, e a tela diz por quê', async () => {
    render(<NovaOcPage />);
    await lerOrcamento(cab({ ...ORCAMENTO, cnpj_emitente: '33333333000100' }));
    expect(oc().fornecedor_id).toBe('');
    expect(confira('fornecedor')).toBeNull();
    expect(document.querySelector('[data-sem-fornecedor]')).toHaveTextContent(
      'Fornecedor: ficou vazio, porque o CNPJ do orçamento não está no cadastro. Escolha na lista.',
    );
    expect(useDataStore.getState().data!.fornecedores).toHaveLength(1);
  });

  it('o total do orçamento ao lado do da OC, com a diferença', async () => {
    render(<NovaOcPage />);
    await lerOrcamento(ORCAMENTO);
    const conf = document.querySelector('[data-conferencia-do-total]')!;
    expect(conf.getAttribute('data-conferencia-do-total')).toBe('difere');
    expect(conf).toHaveTextContent('Total do orçamento: R$ 1.000,00');
    expect(conf).toHaveTextContent('Total da OC: R$ 1.067,50');
    expect(conf.querySelector('[data-diferenca]')).toHaveTextContent('Diferença: R$ 67,50 (a OC passa do orçamento)');
  });

  it('a OC abaixo do orçamento: a diferença sem sinal, e a frase diz o lado', async () => {
    render(<NovaOcPage />);
    await lerOrcamento(cab({ ...ORCAMENTO, total: 1072.5 }));
    expect(document.querySelector('[data-diferenca]')).toHaveTextContent(/^Diferença: R\$\s5,00 \(a OC fica abaixo do orçamento\)$/);
  });

  it('sem cabeçalho (a leitura de hoje): o alto não muda, a entrega fica a Data mais um dia', async () => {
    render(<NovaOcPage />);
    await lerOrcamento(undefined);
    expect(oc().fornecedor_id).toBe('');
    expect(oc().condicao_pagamento).toBe('À vista');
    expect(oc().entrega_prevista).toBe(somaDias(oc().data, 1));
    expect(document.querySelector('[data-resumo-do-alto]')).toBeNull();
    expect(document.querySelector('[data-conferencia-do-total]')).toBeNull();
  });

  it('nada grava nem emite: a OC continua rascunho na tela, sem número', async () => {
    render(<NovaOcPage />);
    await lerOrcamento(ORCAMENTO);
    expect(oc().versao).toBe(0);
    expect(oc().numero ?? '').toBe('');
    expect(useDataStore.getState().data!.ordens_compra).toHaveLength(0);
  });
});
