import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D604 §3.2: o "Entregue" do Histórico abre a avaliação do recebimento
 * (PS.02), e a OC só vai a entregue com ela — numa escrita só, o
 * `registrar_entrega`. Por comportamento: conta-se a gravação. Banco falso.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(
  () => ({ mascara: null as string | null, pdfs: [] as unknown[][] }) as {
    registrar: Mock; status: Mock; recarregar: Mock; avaliacoes: Mock; mascara: string | null; pdfs: unknown[][];
  },
);
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  registrarEntrega: (...a: unknown[]) => banco.registrar(...a),
  lerAvaliacoesDeEntrega: () => banco.avaliacoes(),
}));
vi.mock('../../src/services/storage/umaObra', async (original) => ({
  ...(await original<typeof import('../../src/services/storage/umaObra')>()),
  obraDaMascara: () => banco.mascara,
}));
vi.mock('../../src/services/pdf/generateFolhasDoAuditor', () => ({
  baixarPdfDasAvaliacoes: async (...a: unknown[]) => {
    banco.pdfs.push(a);
  },
}));
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  definirStatusOc: (...a: unknown[]) => banco.status(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => banco.recarregar() }));

import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { ENTREGUE_SO_COM_AVALIACAO, mudarStatusDaOc } from '../../src/features/ordens-compra/mudarStatusDaOc';
import { hojeEmSaoPaulo } from '../../src/domain/ecr';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

const FORNECEDOR = normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)' });
const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });

const oc = (id: string, status: 'rascunho' | 'emitida' | 'entregue' | 'cancelada') =>
  normalizeOC({
    id, status, numero: `2026/${id}`, fornecedor_id: FORNECEDOR.id, obra_id: OBRA.id, versao: 4,
    itens: [normalizeItem({ descricao: 'Cimento (teste)', quantidade: 1, unidade: 'sc', preco_unit: 30 })],
  });

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [FORNECEDOR], obras: [OBRA], ecrs: [],
    ordens_compra: [oc('001', 'emitida'), oc('002', 'entregue'), oc('003', 'rascunho'), oc('004', 'cancelada')],
  } as unknown as Data;
}

const avisos = () => useUiStore.getState().toasts.map((t) => t.message);
const caixa = () => document.querySelector<HTMLElement>('[data-dialogo-entrega]');
const linhaDa = (numero: string) => screen.getByText(numero).closest('tr')!;

beforeEach(() => {
  banco.registrar = vi.fn(async () => {
    throw new Error('parada aqui pelo teste');
  });
  banco.status = vi.fn(async () => {
    throw new Error('parada aqui pelo teste');
  });
  banco.recarregar = vi.fn(async () => {});
  banco.avaliacoes = vi.fn(async () => []);
  banco.mascara = null;
  banco.pdfs = [];
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
});

function abrir(numero = '2026/001', botao = 'Entregue') {
  render(<HistoricoPage />);
  fireEvent.click(within(linhaDa(numero)).getByRole('button', { name: botao }));
  return caixa()!;
}

function responder(respostas: boolean[]) {
  const c = caixa()!;
  respostas.forEach((r, i) => {
    const p = c.querySelector<HTMLElement>(`[data-pergunta="${i + 1}"]`)!;
    fireEvent.click(within(p).getByRole('radio', { name: r ? 'Conforme' : 'Não Conforme' }));
  });
}
const campo = (rotulo: RegExp) => within(caixa()!).getByLabelText(rotulo);
async function registrar() {
  await act(async () => {
    fireEvent.click(within(caixa()!).getByRole('button', { name: 'Registrar entrega' }));
  });
}

describe('D604 §3.2 — o "Entregue" abre a avaliação', () => {
  it('a OC emitida mostra "Entregue"; a entregue, "Outra entrega"; rascunho e cancelada, nenhum', () => {
    render(<HistoricoPage />);
    expect(within(linhaDa('2026/001')).queryByRole('button', { name: 'Entregue' })).toBeTruthy();
    expect(within(linhaDa('2026/002')).queryByRole('button', { name: 'Outra entrega' })).toBeTruthy();
    expect(within(linhaDa('2026/004')).queryByRole('button', { name: /Entregue|Outra entrega/ })).toBeNull();
  });

  it('quem só lê não registra entrega', () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    render(<HistoricoPage />);
    expect(within(linhaDa('2026/001')).queryByRole('button', { name: 'Entregue' })).toBeNull();
  });

  it('clicar em "Entregue" não grava nada sozinho: abre a caixa, com o dia de hoje no recebimento', () => {
    abrir();
    expect(caixa()!.textContent).toContain('Registrar a entrega — OC 2026/001');
    expect((campo(/Recebido em/) as HTMLInputElement).value).toBe(hojeEmSaoPaulo());
    expect(banco.registrar).not.toHaveBeenCalled();
    expect(banco.status).not.toHaveBeenCalled();
  });

  it('sem a nota fiscal, ou sem as três respostas: zero gravação, e a caixa diz o que falta', async () => {
    abrir();
    await registrar();
    expect(within(caixa()!).getByRole('alert').textContent).toBe('Informe o número da nota fiscal.');
    fireEvent.change(campo(/Nota fiscal/), { target: { value: '1234' } });
    responder([true, true]);
    await registrar();
    expect(within(caixa()!).getByRole('alert').textContent).toContain('Responda as três perguntas');
    expect(banco.registrar).not.toHaveBeenCalled();
  });

  it('tudo conforme: uma gravação só, com a OC, a versão e as respostas; nada pelo "definir status"', async () => {
    banco.registrar = vi.fn(async () => ({
      avaliacaoId: 9, status: 'entregue', versao: 5, entregueEm: '2026-09-28', naoConformes: 0, tratativaAberta: false,
    }));
    abrir();
    fireEvent.change(campo(/Nota fiscal/), { target: { value: '1234' } });
    responder([true, true, true]);
    fireEvent.change(campo(/Observação/), { target: { value: 'chegou de manhã' } });
    expect(caixa()!.querySelector('[data-aviso-tratativa]')).toBeNull();
    await registrar();
    expect(banco.registrar).toHaveBeenCalledTimes(1);
    expect(banco.registrar.mock.calls[0]).toEqual([
      '001',
      4,
      {
        notaFiscal: '1234', recebidoEm: hojeEmSaoPaulo(), prazoConforme: true, integridadeConforme: true,
        ocEcrConforme: true, observacao: 'chegou de manhã', tratativa: '',
      },
    ]);
    expect(banco.status).not.toHaveBeenCalled();
    expect(banco.recarregar).toHaveBeenCalledTimes(1);
    expect(caixa()).toBeNull();
    expect(avisos()).toContain('OC 2026/001: entrega registrada.');
  });

  it('duas "Não Conforme": a tratativa aparece e é obrigatória; com ela, grava e avisa que ficou aberta', async () => {
    banco.registrar = vi.fn(async () => ({
      avaliacaoId: 10, status: 'entregue', versao: 5, entregueEm: '2026-09-28', naoConformes: 2, tratativaAberta: true,
    }));
    abrir();
    fireEvent.change(campo(/Nota fiscal/), { target: { value: '55' } });
    responder([false, true, false]);
    expect(caixa()!.querySelector('[data-aviso-tratativa]')!.textContent).toContain('2 respostas "Não Conforme"');
    await registrar();
    expect(banco.registrar).not.toHaveBeenCalled();
    expect(within(caixa()!).getByRole('alert').textContent).toContain('escreva a tratativa');
    fireEvent.change(campo(/Tratativa/), { target: { value: 'devolvido ao fornecedor' } });
    await registrar();
    expect(banco.registrar).toHaveBeenCalledTimes(1);
    expect(banco.registrar.mock.calls[0]![2]).toMatchObject({ tratativa: 'devolvido ao fornecedor' });
    expect(avisos()).toContain('OC 2026/001: entrega registrada. A tratativa ficou aberta para quem revisa as ECRs.');
  });

  it('uma "Não Conforme" só: sem tratativa obrigatória', async () => {
    abrir();
    responder([true, false, true]);
    expect(caixa()!.querySelector('[data-aviso-tratativa]')).toBeNull();
  });

  it('o banco recusou: a frase fica na caixa, que continua aberta com o que foi digitado', async () => {
    banco.registrar = vi.fn(async () => {
      throw new Error('Esta OC mudou desde que você abriu a tela. Recarregue a página e registre de novo.');
    });
    abrir();
    fireEvent.change(campo(/Nota fiscal/), { target: { value: '77' } });
    responder([true, true, true]);
    await registrar();
    expect(within(caixa()!).getByRole('alert').textContent).toContain('Recarregue a página e registre de novo');
    expect((campo(/Nota fiscal/) as HTMLInputElement).value).toBe('77');
  });

  it('a OC já entregue registra outra entrega, pela mesma caixa', async () => {
    abrir('2026/002', 'Outra entrega');
    expect(caixa()!.textContent).toContain('Registrar outra entrega — OC 2026/002');
  });
});

describe('D604 §3.2 — o comando de status não leva a OC a entregue', () => {
  it('mudarStatusDaOc(entregue): zero gravação, e o aviso aponta a avaliação', async () => {
    const avisar = vi.fn();
    await mudarStatusDaOc(oc('001', 'emitida'), 'entregue', [FORNECEDOR], avisar);
    expect(banco.status).not.toHaveBeenCalled();
    expect(avisar).toHaveBeenCalledWith(ENTREGUE_SO_COM_AVALIACAO, 'warning');
  });
});

describe('D604 §3.5 — o PDF das avaliações, pelo Histórico', () => {
  const AVALIACAO = {
    id: 1, ocId: '001', intervencaoId: OBRA.id, notaFiscal: '1234', recebidoEm: '2026-09-20',
    prazoConforme: true, integridadeConforme: true, ocEcrConforme: true, naoConformes: 0, observacao: '', tratativa: '',
    avaliadoPorNome: 'Pessoa de teste', cienciaPorNome: '', cienciaEm: '', cienciaNota: '',
  };
  async function gerar() {
    render(<HistoricoPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /PDF das avaliações/ }));
    });
  }

  it('sem a máscara: as avaliações lidas, "todas as obras"', async () => {
    banco.avaliacoes = vi.fn(async () => [AVALIACAO]);
    await gerar();
    expect(banco.pdfs).toHaveLength(1);
    const [linhas, obra] = banco.pdfs[0]! as [string[][], string | null];
    expect(obra).toBeNull();
    expect(linhas[0]!.slice(0, 4)).toEqual(['2026/001', 'Filial A (teste)', 'Obra de teste', '1234']);
  });

  it('com a máscara da D599: o nome da obra dela vai no PDF', async () => {
    banco.mascara = OBRA.id;
    await gerar();
    expect((banco.pdfs[0]! as [string[][], string | null])[1]).toBe('Obra de teste');
  });

  it('a leitura falhou: aviso de erro, nenhum PDF', async () => {
    banco.avaliacoes = vi.fn(async () => {
      throw new Error('Falha ao ler as avaliações de entrega: rede');
    });
    await gerar();
    expect(banco.pdfs).toHaveLength(0);
    expect(avisos()).toContain('Erro ao gerar o PDF: Falha ao ler as avaliações de entrega: rede');
  });
});
