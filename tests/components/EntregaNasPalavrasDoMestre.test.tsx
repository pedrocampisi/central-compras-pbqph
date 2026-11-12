import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D1039: a caixa de entrega do escritório nas palavras do mestre, com o
 * tique por item e o aviso contra o registro duplo. Palavra do Pedro, 12/11:
 * "Sim, as duas" e "e coloca o check em cada item tb". Banco falso; OC,
 * fornecedor, obra e pessoas inventados.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(() => ({}) as { registrar: Mock; avaliacoes: Mock; cobertura: Mock; recarregar: Mock });
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  registrarEntrega: (...a: unknown[]) => banco.registrar(...a),
  lerAvaliacoesDeEntrega: () => banco.avaliacoes(),
}));
vi.mock('../../src/services/supabase/entregasSemPapel', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/entregasSemPapel')>()),
  lerCoberturaDasEntregas: (...a: unknown[]) => banco.cobertura(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => banco.recarregar() }));

import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import {
  PERGUNTAS_DO_MESTRE, SEM_RESPOSTA, cartaoDoEscritorio, contaPorItem, notaParaComparar, problemaDaEntregaDoEscritorio,
  temNotaRepetida,
} from '../../src/domain/recebimento';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { paraOc } from '../../src/services/supabase/dados';
import { linhasDosItens } from '../../src/services/supabase/linhas';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

const FORNECEDOR = normalizeFornecedor({ id: 'f1', razao_social: 'Fornecedor (teste)' });
const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });
const ITENS = [
  normalizeItem({ id: 'i1', posicao: 1, descricao: 'Cimento (teste)', quantidade: 20, unidade: 'sc', preco_unit: 30 }),
  normalizeItem({ id: 'i2', posicao: 2, descricao: 'Areia (teste)', quantidade: 3, unidade: 'm³', preco_unit: 140 }),
];
const oc = (id: string, status: 'emitida' | 'entregue') =>
  normalizeOC({ id, status, numero: `2026/${id}`, fornecedor_id: FORNECEDOR.id, obra_id: OBRA.id, versao: 4, itens: ITENS });

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [FORNECEDOR], obras: [OBRA], ecrs: [],
    ordens_compra: [oc('013', 'emitida'), oc('014', 'entregue')],
  } as unknown as Data;
}

const entrega = (id: number, ocId: string, notaFiscal: string, o: Record<string, unknown> = {}) => ({
  id, ocId, intervencaoId: OBRA.id, notaFiscal, recebidoEm: '2026-11-10', prazoConforme: true, integridadeConforme: true,
  ocEcrConforme: true, naoConformes: 0, observacao: '', tratativa: '', avaliadoPorNome: 'Pessoa de teste',
  cienciaPorNome: '', cienciaEm: '', cienciaNota: '', chegouTudo: true, fotoDocumentoId: '', pelaObra: false, ...o,
});

const caixa = () => document.querySelector<HTMLElement>('[data-dialogo-entrega]')!;
const linhaDa = (numero: string) => screen.getByText(numero).closest('tr')!;
const pergunta = (n: number) => caixa().querySelector<HTMLElement>(`[data-pergunta="${n}"]`)!;

beforeEach(() => {
  banco.registrar = vi.fn(async () => ({
    avaliacaoId: 9, status: 'entregue', versao: 5, entregueEm: '2026-11-12', naoConformes: 0, tratativaAberta: false,
  }));
  banco.avaliacoes = vi.fn(async () => []);
  banco.cobertura = vi.fn(async () => []);
  banco.recarregar = vi.fn(async () => {});
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
});

async function abrir(numero = '2026/013', botao = 'Marcar entregue') {
  await act(async () => {
    render(<HistoricoPage />);
  });
  fireEvent.click(within(linhaDa(numero)).getByRole('button', { name: botao }));
  return caixa();
}
function preencherOResto() {
  fireEvent.change(within(caixa()).getByLabelText(/Nota fiscal/), { target: { value: '4567' } });
  for (const n of [1, 2, 3]) fireEvent.click(within(pergunta(n)).getByRole('radio', { name: 'Sim' }));
}
async function registrar() {
  await act(async () => {
    fireEvent.click(within(caixa()).getByRole('button', { name: 'Registrar entrega' }));
  });
}

describe('CTO-D1039 §2.1 e §2.3 — as perguntas do mestre, lidas de um lugar só', () => {
  it('as quatro perguntas são as do mestre, na ordem dele, com os botões dele; "Conforme" não aparece mais', async () => {
    await abrir();
    const legendas = [...caixa().querySelectorAll('fieldset > legend')];
    expect(legendas).toHaveLength(PERGUNTAS_DO_MESTRE.length);
    for (const [i, p] of PERGUNTAS_DO_MESTRE.entries()) {
      expect(legendas[i]!.textContent!.startsWith(p.texto), p.texto).toBe(true);
      expect(within(pergunta(i + 1)).getByRole('radio', { name: p.sim })).toBeTruthy();
      expect(within(pergunta(i + 1)).getByRole('radio', { name: p.nao })).toBeTruthy();
      if (p.dica) expect(pergunta(i + 1).textContent).toContain(p.dica);
    }
    expect(caixa().textContent).not.toMatch(/Conforme|Prazo de entrega|Integridade|Chegou só uma parte/);
    expect(within(caixa()).getByLabelText(/O que aconteceu\?/)).toBeTruthy();
  });

  it('fica o que é do escritório: a nota digitada, o dia que pode ser passado, e o "?" da ECR na pergunta do material', async () => {
    await abrir();
    expect(within(caixa()).getByLabelText(/Nota fiscal/)).toBeTruthy();
    const dia = within(caixa()).getByLabelText(/Recebido em/) as HTMLInputElement;
    fireEvent.change(dia, { target: { value: '2026-11-03' } });
    expect(dia.value).toBe('2026-11-03');
    expect(pergunta(3).querySelector('legend button, legend [aria-label]')).toBeTruthy();
  });
});

describe('CTO-D1039 §2.2 — o tique em cada item, com as peças do mestre', () => {
  it('"Sim" de uma vez: cada item vai com a quantidade pedida', async () => {
    await abrir();
    preencherOResto();
    fireEvent.click(within(pergunta(4)).getByRole('radio', { name: 'Sim' }));
    await registrar();
    expect(banco.registrar).toHaveBeenCalledTimes(1);
    const [, , , chegouTudo, itens] = banco.registrar.mock.calls[0]!;
    expect(chegouTudo).toBe(true);
    expect(itens).toEqual([{ posicao: 1, quantidade: 20 }, { posicao: 2, quantidade: 3 }]);
  });

  it('D1036e: as peças já vêm abertas; todas ticadas é o "Sim"; a sem tique vira "Só uma parte" e pede quanto veio', async () => {
    await abrir();
    preencherOResto();
    expect(within(pergunta(4)).queryByRole('button', { name: /item por item/ })).toBeNull();
    const tiques = within(pergunta(4)).getAllByRole('checkbox');
    expect(tiques).toHaveLength(2);
    expect(pergunta(4).textContent).toContain('Pedido: 20 sc');
    fireEvent.click(tiques[0]!);
    // Conferindo: uma ticada ainda não responde.
    expect((within(pergunta(4)).getByRole('radio', { name: 'Sim' }) as HTMLInputElement).checked).toBe(false);
    expect((within(pergunta(4)).getByRole('radio', { name: 'Só uma parte' }) as HTMLInputElement).checked).toBe(false);
    expect(within(pergunta(4)).queryByLabelText('Quanto veio de Areia (teste)')).toBeNull();
    fireEvent.click(tiques[1]!);
    expect((within(pergunta(4)).getByRole('radio', { name: 'Sim' }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(tiques[1]!);
    expect((within(pergunta(4)).getByRole('radio', { name: 'Só uma parte' }) as HTMLInputElement).checked).toBe(true);
    const campo = within(pergunta(4)).getByLabelText('Quanto veio de Areia (teste)') as HTMLInputElement;
    expect(campo.value).toBe('');
    await registrar();
    expect(banco.registrar).not.toHaveBeenCalled();
    expect(within(caixa()).getByRole('alert').textContent).toBe('Escreva quanto veio de Areia (teste). Se não veio, escreva 0.');
    fireEvent.change(campo, { target: { value: '1,5' } });
    await registrar();
    const [, , , chegouTudo, itens] = banco.registrar.mock.calls[0]!;
    expect(chegouTudo).toBe(false);
    expect(itens).toEqual([{ posicao: 1, quantidade: 20 }, { posicao: 2, quantidade: 1.5 }]);
  });

  it('D1036e: "Só uma parte" direto: as peças sem tique pedem quanto veio, dentro da pergunta; sem a lista de antes', async () => {
    await abrir();
    preencherOResto();
    fireEvent.click(within(pergunta(4)).getByRole('radio', { name: 'Só uma parte' }));
    expect(caixa().querySelector('[data-contagem-por-item]')).toBeNull();
    const cimento = within(pergunta(4)).getByLabelText('Quanto veio de Cimento (teste)') as HTMLInputElement;
    expect(cimento.value).toBe('');
    fireEvent.change(cimento, { target: { value: '0' } });
    fireEvent.click(within(pergunta(4)).getAllByRole('checkbox')[1]!);
    await registrar();
    expect(banco.registrar.mock.calls[0]![4]).toEqual([{ posicao: 1, quantidade: 0 }, { posicao: 2, quantidade: 3 }]);
  });

  it('a OC cujos itens não sabem a posição: a pergunta fica, a lista não, e a entrega vai sem itens', async () => {
    const semPosicao = { ...oc('013', 'emitida'), itens: ITENS.map((i) => ({ ...i, posicao: undefined })) };
    useDataStore.setState({ data: { ...dados(), ordens_compra: [semPosicao] } });
    await abrir();
    expect(within(pergunta(4)).queryByRole('checkbox')).toBeNull();
    preencherOResto();
    fireEvent.click(within(pergunta(4)).getByRole('radio', { name: 'Só uma parte' }));
    expect(caixa().querySelector('[data-contagem-por-item]')).toBeNull();
    await registrar();
    expect(banco.registrar.mock.calls[0]!.slice(3)).toEqual([false, []]);
  });
});

describe('CTO-D1039 §2.4 — o aviso contra o registro duplo', () => {
  it('sem entrega antes: nenhum aviso', async () => {
    await abrir();
    expect(caixa().querySelector('[data-aviso-entrega-anterior]')).toBeNull();
  });

  it('com entrega antes: o dia, a nota e quem registrou, no alto da caixa, e a frase de só registrar outra parte', async () => {
    banco.avaliacoes = vi.fn(async () => [
      entrega(1, '014', '1234', { pelaObra: true, avaliadoPorNome: 'Encarregado de teste', chegouTudo: false }),
      entrega(2, '014', '1300', { recebidoEm: '2026-11-11' }),
    ]);
    await abrir('2026/014', 'Outra entrega');
    const aviso = caixa().querySelector<HTMLElement>('[data-aviso-entrega-anterior]')!;
    expect(caixa().firstElementChild!.nextElementSibling!.nextElementSibling).toBe(aviso);
    expect(aviso.textContent).toContain('Esta OC já tem 2 entregas registradas:');
    const [a, b] = [...aviso.querySelectorAll('li')].map((l) => l.textContent);
    expect(a).toBe('10/11/2026 · nota 1234 · pelo encarregado (Encarregado de teste) · só uma parte');
    expect(b).toBe('11/11/2026 · nota 1300 · pelo escritório (Pessoa de teste)');
    expect(aviso.textContent).toContain('Só registre de novo se chegou outra parte.');
  });

  it('no Histórico: duas entregas com a mesma nota (com ou sem os zeros da frente) levam o aviso; notas diferentes, não', async () => {
    banco.avaliacoes = vi.fn(async () => [
      entrega(1, '014', '001234'), entrega(2, '014', 'NF 1234', { pelaObra: true }),
      entrega(3, '013', '55'), entrega(4, '013', '56'),
    ]);
    await act(async () => {
      render(<HistoricoPage />);
    });
    expect(within(linhaDa('2026/014')).getByText('Duas entregas com a mesma nota: confira')).toBeTruthy();
    expect(within(linhaDa('2026/013')).queryByText(/mesma nota/)).toBeNull();
  });
});

describe('CTO-D1039 — a régua', () => {
  it('a nota para comparar: só os dígitos, sem os zeros da frente; e a repetida', () => {
    expect(notaParaComparar('NF 001.234')).toBe('1234');
    expect(notaParaComparar('0')).toBe('0');
    expect(temNotaRepetida([{ notaFiscal: '1234' }, { notaFiscal: '01234' }])).toBe(true);
    expect(temNotaRepetida([{ notaFiscal: '1234' }, { notaFiscal: '1235' }, { notaFiscal: '' }, { notaFiscal: '' }])).toBe(false);
  });

  it('o que falta, na ordem da caixa', () => {
    const tudo = { noDia: true, semEstrago: true, oQueFoiPedido: true, tudo: true };
    expect(problemaDaEntregaDoEscritorio(tudo, ' ', '2026-11-12', '2026-11-12', '')).toBe('Informe o número da nota fiscal.');
    expect(problemaDaEntregaDoEscritorio(tudo, '1', '2026-11-13', '2026-11-12', '')).toBe('O dia do recebimento não pode ser depois de hoje.');
    expect(problemaDaEntregaDoEscritorio(SEM_RESPOSTA, '1', '2026-11-12', '2026-11-12', '')).toBe('Falta responder: Chegou no dia combinado?');
    const doisNao = { ...tudo, noDia: false, semEstrago: false };
    expect(problemaDaEntregaDoEscritorio(doisNao, '1', '2026-11-12', '2026-11-12', '')).toBe('Conte o que aconteceu: tem mais de um "Não".');
    expect(problemaDaEntregaDoEscritorio(doisNao, '1', '2026-11-12', '2026-11-12', 'devolvido')).toBe('');
  });

  it('a posição do item chega do banco e da normalização, e não vai na gravação da OC (que numera de novo)', () => {
    const lida = paraOc({ id: 'x', itens: [{ id: 'b', posicao: 2, quantidade: 1 }, { id: 'a', posicao: 1, quantidade: 1 }] });
    expect(lida.itens.map((i) => [i.id, i.posicao])).toEqual([['a', 1], ['b', 2]]);
    expect(normalizeItem({ id: 'z', posicao: 3 }).posicao).toBe(3);
    expect(normalizeItem({ id: 'z' }).posicao).toBeUndefined();
    expect(normalizeItem({ id: 'z', posicao: 0 }).posicao).toBeUndefined();
    expect(linhasDosItens([lida.itens[1]!, lida.itens[0]!]).map((l) => l['posicao'])).toEqual([1, 2]);
    expect(contaPorItem(cartaoDoEscritorio(lida, '', ''))).toBe(true);
    expect(contaPorItem(cartaoDoEscritorio({ ...lida, itens: [{ descricao: 'x', quantidade: 1, unidade: 'un' }] }, '', ''))).toBe(false);
  });
});
