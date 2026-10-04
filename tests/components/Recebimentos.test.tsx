import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

/**
 * CTO-D696 §5.2: o lado do escritório do que chegou na obra — a fila do
 * "chegou sem pedido" (ligar a uma OC, ou descartar) e a última entrega no
 * Histórico (quem recebeu, "só uma parte", a foto). Banco falso; obra,
 * fornecedor e pessoas inventados.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(
  () => ({ mascara: null as string | null }) as {
    fila: Mock; links: Mock; ligar: Mock; descartar: Mock; recarregar: Mock; avaliacoes: Mock; mascara: string | null;
  },
);
vi.mock('../../src/services/supabase/recebimento', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/recebimento')>()),
  lerFilaSemPedido: () => banco.fila(),
  lerLinksDasFotos: (ids: string[]) => banco.links(ids),
  ligarSemPedido: (...a: unknown[]) => banco.ligar(...a),
  descartarSemPedido: (...a: unknown[]) => banco.descartar(...a),
}));
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  lerAvaliacoesDeEntrega: () => banco.avaliacoes(),
}));
vi.mock('../../src/services/supabase/pastaDaObra', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/pastaDaObra')>()),
  lerPdfsNaPasta: async () => null,
}));
vi.mock('../../src/services/storage/umaObra', async (original) => ({
  ...(await original<typeof import('../../src/services/storage/umaObra')>()),
  obraDaMascara: () => banco.mascara,
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => banco.recarregar() }));

import { RecebimentosPage } from '../../src/features/recebimento/RecebimentosPage';
import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import type { SemPedidoNaFila } from '../../src/services/supabase/recebimento';
import type { AvaliacaoGravada } from '../../src/services/supabase/qualificacao';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

const FORNECEDOR = normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)', empresa_apelido: 'Apelido A' });
const OBRA = normalizeObra({ id: 'obra-1', nome: 'Obra de Teste' });
const OUTRA = normalizeObra({ id: 'obra-2', nome: 'Outra Obra' });

const oc = (id: string, status: 'rascunho' | 'emitida' | 'entregue' | 'cancelada', obra = OBRA.id) =>
  normalizeOC({
    id, status, numero: `2026/${id}`, fornecedor_id: FORNECEDOR.id, obra_id: obra, versao: 7,
    itens: [normalizeItem({ descricao: 'Areia (teste)', quantidade: 1, unidade: 'm3', preco_unit: 30 })],
  });

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [FORNECEDOR], obras: [OBRA, OUTRA], ecrs: [],
    ordens_compra: [
      oc('101', 'emitida'), oc('102', 'entregue'), oc('103', 'rascunho'), oc('104', 'cancelada'),
      oc('201', 'emitida', OUTRA.id),
    ],
  } as unknown as Data;
}

const ITEM: SemPedidoNaFila = {
  id: 5, intervencaoId: OBRA.id, obra: 'Obra de Teste', recebidoEm: '2026-10-04', fornecedorTexto: 'Areal de teste',
  notaFiscal: '789', oQueChegou: '2 caminhões de areia', chegouComEstrago: false, observacao: '',
  fotoDocumentoId: 'doc-1', registradoPorNome: 'Mestre de Teste', criadoEm: '2026-10-04T13:00:00Z',
  ocInformadaId: '', ocInformadaNumero: '',
};

const avisos = () => useUiStore.getState().toasts.map((t) => t.message);
const caixa = () => document.querySelector<HTMLElement>('[data-dialogo-ligar]')!;
const responder = (legenda: string, opcao: string) =>
  fireEvent.click(within(within(caixa()).getByRole('group', { name: legenda })).getByRole('radio', { name: opcao }));

beforeEach(() => {
  banco.fila = vi.fn(async () => [ITEM]);
  banco.links = vi.fn(async () => new Map([['doc-1', 'https://pasta-de-teste.invalid/foto.jpg']]));
  banco.ligar = vi.fn(async () => undefined);
  banco.descartar = vi.fn(async () => undefined);
  banco.recarregar = vi.fn(async () => {});
  banco.avaliacoes = vi.fn(async () => []);
  banco.mascara = null;
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
});

async function montar() {
  render(<RecebimentosPage />);
  return screen.findByText('2 caminhões de areia');
}

describe('Recebimentos: a fila do sem pedido', () => {
  it('mostra a obra, o dia, o que chegou, de quem, a nota, quem registrou e a foto', async () => {
    await montar();
    const c = document.querySelector<HTMLElement>('[data-sem-pedido="5"]')!;
    expect(within(c).getByText('Obra de Teste')).toBeTruthy();
    expect(within(c).getByText('Chegou em 04/10/2026')).toBeTruthy();
    expect(within(c).getByText('Areal de teste')).toBeTruthy();
    expect(within(c).getByText('789')).toBeTruthy();
    expect(within(c).getByText('Mestre de Teste')).toBeTruthy();
    expect(within(c).getByRole('link', { name: 'Ver a foto da nota' }).getAttribute('href')).toBe(
      'https://pasta-de-teste.invalid/foto.jpg',
    );
    expect(within(c).queryByText('Com estrago')).toBeNull();
  });

  it('a entrega da OC cancelada (D699 §2) diz de qual OC era; o estrago e "só a foto" aparecem', async () => {
    banco.fila = vi.fn(async () => [
      { ...ITEM, notaFiscal: '', chegouComEstrago: true, ocInformadaId: '104', ocInformadaNumero: '2026/104' },
    ]);
    await montar();
    expect(screen.getByText(/Era a entrega da OC 2026\/104/)).toBeTruthy();
    expect(screen.getByText('Com estrago')).toBeTruthy();
    expect(screen.getByText('Só a foto')).toBeTruthy();
  });

  it('com a máscara de uma obra, só os desta obra', async () => {
    banco.mascara = OUTRA.id;
    render(<RecebimentosPage />);
    expect(await screen.findByText('Nenhum recebimento sem pedido esperando o escritório.')).toBeTruthy();
  });

  it('quem só lê não vê os botões', async () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    await montar();
    expect(screen.queryByRole('button', { name: 'Ligar a uma OC' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Descartar' })).toBeNull();
  });
});

describe('Recebimentos: ligar a uma OC', () => {
  it('só OCs emitidas ou entregues da MESMA obra; a que o mestre informou vem primeiro', async () => {
    banco.fila = vi.fn(async () => [{ ...ITEM, ocInformadaId: '102', ocInformadaNumero: '2026/102' }]);
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Ligar a uma OC' }));
    const opcoes = within(caixa()).getAllByRole('option').map((o) => o.textContent);
    expect(opcoes).toEqual(['2026/102 — Filial A (teste) · entregue', '2026/101 — Filial A (teste) · emitida']);
  });

  it('a integridade é a do mestre; sem responder, diz o que falta e não grava', async () => {
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Ligar a uma OC' }));
    expect(caixa().querySelector('[data-integridade-do-mestre]')!.textContent).toMatch(/Integridade do material: Conforme/);
    fireEvent.click(within(caixa()).getByRole('button', { name: 'Ligar à OC' }));
    expect(within(caixa()).getByRole('alert').textContent).toBe('Responda: Prazo de entrega.');
    expect(banco.ligar).not.toHaveBeenCalled();
  });

  it('liga com a OC (sem a informada, a de número maior), a versão dela e as respostas; recarrega, avisa e lê a fila de novo', async () => {
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Ligar a uma OC' }));
    responder('Prazo de entrega', 'Conforme');
    responder('Confere com a OC e com a ECR', 'Conforme');
    responder('Chegou tudo?', 'Só uma parte');
    fireEvent.change(within(caixa()).getByLabelText(/Observação/), { target: { value: 'conferido pelo escritório' } });
    const leituras = banco.fila.mock.calls.length;
    await act(async () => {
      fireEvent.click(within(caixa()).getByRole('button', { name: 'Ligar à OC' }));
    });
    expect(banco.ligar).toHaveBeenCalledWith(5, {
      ocId: '102', versao: 7, notaFiscal: '', prazoConforme: true, ocEcrConforme: true, chegouTudo: false,
      tratativa: '', observacao: 'conferido pelo escritório',
    });
    expect(banco.recarregar).toHaveBeenCalledTimes(1);
    expect(avisos()).toContain('Recebimento ligado à OC 2026/102.');
    await waitFor(() => expect(banco.fila.mock.calls.length).toBeGreaterThan(leituras));
  });

  it('o mestre mandou só a foto: o número da nota é pedido, e vai junto', async () => {
    banco.fila = vi.fn(async () => [{ ...ITEM, notaFiscal: '' }]);
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Ligar a uma OC' }));
    responder('Prazo de entrega', 'Conforme');
    responder('Confere com a OC e com a ECR', 'Conforme');
    responder('Chegou tudo?', 'Sim');
    fireEvent.click(within(caixa()).getByRole('button', { name: 'Ligar à OC' }));
    expect(within(caixa()).getByRole('alert').textContent).toBe('Escreva o número da nota: o mestre mandou só a foto.');
    fireEvent.change(within(caixa()).getByLabelText(/Nota fiscal/), { target: { value: '4321' } });
    await act(async () => {
      fireEvent.click(within(caixa()).getByRole('button', { name: 'Ligar à OC' }));
    });
    expect(banco.ligar).toHaveBeenCalledWith(5, expect.objectContaining({ notaFiscal: '4321', chegouTudo: true }));
  });

  it('com estrago e prazo Não Conforme, são dois: a tratativa é obrigatória, e vai', async () => {
    banco.fila = vi.fn(async () => [{ ...ITEM, chegouComEstrago: true }]);
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Ligar a uma OC' }));
    responder('Prazo de entrega', 'Não Conforme');
    responder('Confere com a OC e com a ECR', 'Conforme');
    responder('Chegou tudo?', 'Sim');
    fireEvent.click(within(caixa()).getByRole('button', { name: 'Ligar à OC' }));
    expect(within(caixa()).getByRole('alert').textContent).toMatch(/escreva a tratativa/);
    fireEvent.change(within(caixa()).getByLabelText(/Tratativa/), { target: { value: 'devolvido ao fornecedor' } });
    await act(async () => {
      fireEvent.click(within(caixa()).getByRole('button', { name: 'Ligar à OC' }));
    });
    expect(banco.ligar).toHaveBeenCalledWith(5, expect.objectContaining({ tratativa: 'devolvido ao fornecedor' }));
  });

  it('a recusa do banco aparece na caixa, e a caixa fica', async () => {
    banco.ligar = vi.fn(async () => {
      throw new Error('A OC e\' de outra obra: o recebimento so\' se liga a pedido da mesma obra.');
    });
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Ligar a uma OC' }));
    responder('Prazo de entrega', 'Conforme');
    responder('Confere com a OC e com a ECR', 'Conforme');
    responder('Chegou tudo?', 'Sim');
    await act(async () => {
      fireEvent.click(within(caixa()).getByRole('button', { name: 'Ligar à OC' }));
    });
    expect(within(caixa()).getByRole('alert').textContent).toMatch(/de outra obra/);
    expect(banco.recarregar).not.toHaveBeenCalled();
  });

  it('sem OC emitida desta obra: diz, e o botão não grava', async () => {
    banco.fila = vi.fn(async () => [{ ...ITEM, intervencaoId: 'obra-sem-oc' }]);
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Ligar a uma OC' }));
    expect(within(caixa()).getByText(/Nenhuma OC emitida desta obra/)).toBeTruthy();
    expect((within(caixa()).getByRole('button', { name: 'Ligar à OC' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Recebimentos: descartar', () => {
  it('o motivo é obrigatório; com ele, descarta e avisa', async () => {
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    const c = document.querySelector<HTMLElement>('[data-dialogo-descartar]')!;
    fireEvent.click(within(c).getByRole('button', { name: 'Descartar' }));
    expect(within(c).getByRole('alert').textContent).toBe('Escreva o motivo de descartar.');
    expect(banco.descartar).not.toHaveBeenCalled();
    fireEvent.change(within(c).getByLabelText(/Motivo/), { target: { value: 'registrado em dobro' } });
    await act(async () => {
      fireEvent.click(within(c).getByRole('button', { name: 'Descartar' }));
    });
    expect(banco.descartar).toHaveBeenCalledWith(5, 'registrado em dobro');
    expect(avisos()).toContain('Recebimento descartado.');
  });
});

describe('o Histórico: a última entrega de cada OC', () => {
  const avaliacao = (extra: Partial<AvaliacaoGravada>): AvaliacaoGravada => ({
    id: 1, ocId: '102', intervencaoId: OBRA.id, notaFiscal: '1', recebidoEm: '2026-10-02', prazoConforme: true,
    integridadeConforme: true, ocEcrConforme: true, naoConformes: 0, observacao: '', tratativa: '',
    avaliadoPorNome: 'Pessoa do Escritório', cienciaPorNome: '', cienciaEm: '', cienciaNota: '',
    chegouTudo: true, fotoDocumentoId: '', ...extra,
  });

  it('quem recebeu e quando; "só uma parte"; e a foto da nota do mestre', async () => {
    banco.avaliacoes = vi.fn(async () => [
      avaliacao({ id: 1 }),
      avaliacao({ id: 2, recebidoEm: '2026-10-04', avaliadoPorNome: 'Mestre de Teste', chegouTudo: false, fotoDocumentoId: 'doc-1' }),
    ]);
    render(<HistoricoPage />);
    const linha = (await screen.findByText(/Recebido 04\/10\/2026/)).closest('[data-recebimento-da-oc]') as HTMLElement;
    expect(linha.textContent).toContain('Mestre de Teste');
    expect(within(linha).getByText('Só uma parte: espera o resto')).toBeTruthy();
    expect(await within(linha).findByRole('link', { name: 'Foto da nota' })).toBeTruthy();
    expect(screen.queryByText(/Pessoa do Escritório/)).toBeNull();
  });

  it('chegou tudo e sem foto: só o dia e quem recebeu', async () => {
    banco.avaliacoes = vi.fn(async () => [avaliacao({})]);
    render(<HistoricoPage />);
    const linha = (await screen.findByText(/Recebido 02\/10\/2026/)).closest('[data-recebimento-da-oc]') as HTMLElement;
    expect(within(linha).queryByText(/Só uma parte/)).toBeNull();
    expect(within(linha).queryByRole('link')).toBeNull();
  });

  it('a leitura das avaliações falhou: o Histórico segue, sem a linha', async () => {
    banco.avaliacoes = vi.fn(async () => {
      throw new Error('sem rede');
    });
    render(<HistoricoPage />);
    expect(await screen.findByText('2026/102')).toBeTruthy();
    expect(document.querySelector('[data-recebimento-da-oc]')).toBeNull();
  });
});
