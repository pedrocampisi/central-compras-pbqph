import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

/**
 * CTO-D808, D810: a trava da Data nas duas portas de emissão, por
 * COMPORTAMENTO. A regra mora no banco (`compras.qualificacao_na_data`); aqui
 * a resposta dele é falsa, e o que se mede é:
 * - a tela mostra a frase que o banco devolveu, na moldura da emissão, e não
 *   grava;
 * - a recusa da Data não abre o "Qualificar agora";
 * - a pergunta sai com o fornecedor, as ECRs e a Data da OC.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const gravacoes = vi.hoisted(() => ({}) as { salvar: Mock; status: Mock; naData: Mock; recarregar: Mock });

vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarOrdemCompra: (...a: unknown[]) => gravacoes.salvar(...a),
  definirStatusOc: (...a: unknown[]) => gravacoes.status(...a),
}));
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  qualificacaoNaData: (...a: unknown[]) => gravacoes.naData(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => gravacoes.recarregar() }));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { mudarStatusDaOc } from '../../src/features/ordens-compra/mudarStatusDaOc';
import { travaDaDataParaEmitir } from '../../src/features/ordens-compra/qualificacaoParaEmitir';
import { DICA_DA_DATA, somaDias, type LinhaDeQualificacao, type Situacao } from '../../src/domain/qualificacao';
import { hojeEmSaoPaulo } from '../../src/domain/ecr';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { DadosDaQualificacao } from '../../src/services/supabase/qualificacao';
import type { Data, Fornecedor } from '../../src/domain/types';

const FILIAL: Fornecedor = {
  ...normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)' }),
  fornece_material: true,
  bloqueado_para_compra_nova: false,
  empresa_id: 'empresa-a',
};

const OBRA = {
  ...normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' }),
  destinatario: {
    nome: 'Destinatário de teste',
    documento: '00000000000000',
    tipo: 'pj' as const,
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
  },
};

const ECRS = [
  { id: 12, codigo: 'ECR 12', nome: 'Hidrossanitários (teste)' },
  { id: 19, codigo: 'ECR 19', nome: 'Cimento (teste)' },
];

/** O motivo que o banco devolve. Inventado de propósito: a tela não pode reescrevê-lo. */
const MOTIVO = 'na Data da OC (10/01/2026), o motivo que só o banco sabe (teste)';
const PASSADA = '2026-01-10';

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [FILIAL], obras: [OBRA], ecrs: ECRS, ordens_compra: [],
  } as unknown as Data;
}

function oc(opcoes: { data?: string; semEcr?: boolean; numero?: string } = {}) {
  return normalizeOC({
    id: 'oc-teste',
    status: 'rascunho',
    numero: opcoes.numero ?? '',
    data: opcoes.data ?? hojeEmSaoPaulo(),
    fornecedor_id: FILIAL.id,
    obra_id: OBRA.id,
    condicao_pagamento: 'À vista',
    itens: [
      normalizeItem({
        descricao: 'Tubo (teste)', quantidade: 1, unidade: 'pç', preco_unit: 30,
        ecr_id: opcoes.semEcr ? null : 12,
      }),
      normalizeItem({
        descricao: 'Cimento (teste)', quantidade: 1, unidade: 'sc', preco_unit: 30,
        ecr_id: opcoes.semEcr ? null : 19,
      }),
    ],
    versao: 1,
  });
}

const linha = (situacao: Situacao, ecrs: number[]): LinhaDeQualificacao => ({
  id: 1, empresaRaizId: 'empresa-a', fornecedorId: null, categoria: 'material', tipo: '',
  qualificadaEm: '2026-05-07',
  venceEm: situacao === 'vencida' ? '2026-05-08' : somaDias(hojeEmSaoPaulo(), 200),
  criterios: [{ atende: true, motivo: 'a' }, { atende: true, motivo: 'b' }, { atende: false, motivo: 'c' }],
  nota: 2, minimo: 2, qualificada: situacao !== 'desqualificada', qualificadoPorNome: '', origem: '',
  situacao, ecrs, vigente: true,
});

function qualificacoes(linhas: LinhaDeQualificacao[]): DadosDaQualificacao {
  return {
    linhas,
    categorias: [{ categoria: 'material', nome: 'Materiais', minimo: 2, criterios: ['Qualidade', 'Menor preço', 'Prazo'] }],
    tratativas: [],
    desempenho: [],
  };
}

const avisos = () => useUiStore.getState().toasts.map((t) => t.message);
const caixa = () => document.querySelector<HTMLElement>('[data-dialogo-qualificar]');
const recusa = (numero = '(sem número)', dica = DICA_DA_DATA.emissao) =>
  `A OC ${numero} não pode ser emitida: ${MOTIVO}. ${dica}`;

beforeEach(() => {
  const parada = async (): Promise<never> => {
    throw new Error('parada aqui pelo teste');
  };
  gravacoes.salvar = vi.fn(parada);
  gravacoes.status = vi.fn(parada);
  gravacoes.naData = vi.fn(async () => ({ emite: false, motivo: MOTIVO }));
  gravacoes.recarregar = vi.fn(async () => {});
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useQualificacaoStore.getState().esquecer();
  useOcEditingStore.getState().stopEditing();
});

async function emitir(o = oc()) {
  useOcEditingStore.getState().startEditing(o);
  render(<NovaOcPage />);
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Emitir OC \+ Gerar PDF/ }));
  });
}

describe('D810 — a porta "Emitir OC" da Nova OC pergunta a Data ao banco', () => {
  it('qualificada hoje, mas o banco recusa a Data: zero gravação, e a tela mostra a frase dele, com a dica da emissão', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12, 19])]));
    await emitir(oc({ data: PASSADA }));
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(avisos()).toEqual([recusa()]);
    expect(caixa()).toBeNull();
  });

  it('a pergunta sai com o fornecedor da OC, as ECRs dos itens e a Data da OC', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12, 19])]));
    await emitir(oc({ data: PASSADA }));
    expect(gravacoes.naData).toHaveBeenCalledTimes(1);
    expect(gravacoes.naData).toHaveBeenCalledWith(FILIAL.id, [12, 19], PASSADA);
  });

  it('a régua: o banco diz que emite, e a gravação É chamada', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12, 19])]));
    gravacoes.naData = vi.fn(async () => ({ emite: true, motivo: '' }));
    await emitir(oc({ data: PASSADA }));
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
  });

  it('a Data é passada e a de hoje também recusa: vale a frase da Data, e o "Qualificar agora" NÃO abre', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    await emitir(oc({ data: PASSADA }));
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(caixa()).toBeNull();
    expect(avisos()).toEqual([recusa()]);
  });

  it('a Data é passada, o banco aceita a Data, e a de hoje recusa: o "Qualificar agora" abre, como antes', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('vencida', [12, 19])]));
    gravacoes.naData = vi.fn(async () => ({ emite: true, motivo: '' }));
    await emitir(oc({ data: PASSADA }));
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(caixa()).not.toBeNull();
  });

  it('a Data é hoje e a de hoje recusa: não pergunta ao banco, e o "Qualificar agora" abre (ele resolve as duas)', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    await emitir(oc());
    expect(gravacoes.naData).not.toHaveBeenCalled();
    expect(caixa()).not.toBeNull();
  });

  it('a Data é adiante e a de hoje recusa: também abre o "Qualificar agora", sem perguntar', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    await emitir(oc({ data: somaDias(hojeEmSaoPaulo(), 5) }));
    expect(gravacoes.naData).not.toHaveBeenCalled();
    expect(caixa()).not.toBeNull();
  });

  it('OC sem item de ECR: não pergunta, e grava', async () => {
    await emitir(oc({ semEcr: true, data: PASSADA }));
    expect(gravacoes.naData).not.toHaveBeenCalled();
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
  });

  it('a pergunta falhou (sem rede, sessão caída): segue para a gravação, onde o banco confere de novo', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12, 19])]));
    gravacoes.naData = vi.fn(async () => {
      throw new Error('sem rede (teste)');
    });
    await emitir(oc({ data: PASSADA }));
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
  });
});

describe('D810 — a porta "emitida" do Histórico pergunta a Data ao banco', () => {
  it('o banco recusa a Data: zero gravação, e o aviso é a frase dele', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12, 19])]));
    const avisar = vi.fn();
    await mudarStatusDaOc(oc({ data: PASSADA }), 'emitida', [FILIAL], avisar);
    expect(gravacoes.status).not.toHaveBeenCalled();
    expect(avisar).toHaveBeenCalledWith(recusa(), 'warning');
  });

  it('a régua: o banco aceita a Data, e a gravação É chamada', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12, 19])]));
    gravacoes.naData = vi.fn(async () => ({ emite: true, motivo: '' }));
    await mudarStatusDaOc(oc({ data: PASSADA }), 'emitida', [FILIAL], vi.fn());
    expect(gravacoes.status).toHaveBeenCalledTimes(1);
  });

  it('cancelar não pergunta a Data', async () => {
    await mudarStatusDaOc(oc({ data: PASSADA }), 'cancelada', [FILIAL], vi.fn());
    expect(gravacoes.naData).not.toHaveBeenCalled();
  });
});

describe('D810 — a dica segue a ocasião', () => {
  const q = { trava: '', ecrs: [12] };

  it('a OC já emitida, com número: a frase leva o número e a dica sem o rascunho', async () => {
    const emitida = { ...oc({ data: PASSADA, numero: '2026/099' }), status: 'emitida' as const };
    expect(await travaDaDataParaEmitir(emitida, q)).toBe(recusa('2026/099', DICA_DA_DATA.data_mudou));
  });

  it('a cancelada que volta a emitida é emissão: a dica oferece o rascunho', async () => {
    const cancelada = { ...oc({ data: PASSADA, numero: '2026/099' }), status: 'cancelada' as const };
    expect(await travaDaDataParaEmitir(cancelada, q)).toBe(recusa('2026/099'));
  });

  it('sem Data ou sem fornecedor, não pergunta', async () => {
    expect(await travaDaDataParaEmitir({ ...oc(), data: '' }, q)).toBe('');
    expect(await travaDaDataParaEmitir({ ...oc(), fornecedor_id: '' }, q)).toBe('');
    expect(gravacoes.naData).not.toHaveBeenCalled();
  });
});
