import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D605 §5: a trava da qualificação nas duas portas de emissão, por
 * COMPORTAMENTO — clicar em Emitir com empresa sem qualificação dá zero
 * gravação. O mesmo molde do PortasDaEmissao (achado 6 da perícia de 27/09):
 * a gravação é falsa, e o que se mede é se ela foi chamada.
 *
 * Mais o "Qualificar agora": gravou com a nota no mínimo, a emissão segue
 * sozinha; abaixo do mínimo, a empresa fica desqualificada e nada se emite.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const gravacoes = vi.hoisted(() => ({}) as { salvar: Mock; status: Mock; qualificar: Mock; recarregar: Mock });

vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarOrdemCompra: (...a: unknown[]) => gravacoes.salvar(...a),
  definirStatusOc: (...a: unknown[]) => gravacoes.status(...a),
}));
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  qualificarEmpresa: (...a: unknown[]) => gravacoes.qualificar(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => gravacoes.recarregar() }));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { mudarStatusDaOc } from '../../src/features/ordens-compra/mudarStatusDaOc';
import { TravaDoBanco } from '../../src/services/supabase/dados';
import { QUALIFICACAO_SEM_CONFIRMACAO, type LinhaDeQualificacao, type Situacao } from '../../src/domain/qualificacao';
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
  { id: 12, codigo: 'ECR 12', nome: 'Cimento (teste)' },
  { id: 19, codigo: 'ECR 19', nome: 'Aço (teste)' },
];

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

/** A OC de teste: um item de cimento (ECR 12) — ou, com `semEcr`, só um item comum. */
function oc(opcoes: { semEcr?: boolean } = {}) {
  return normalizeOC({
    id: 'oc-teste',
    status: 'rascunho',
    fornecedor_id: FILIAL.id,
    obra_id: OBRA.id,
    condicao_pagamento: 'À vista',
    itens: [
      normalizeItem({
        descricao: 'Cimento (teste)', quantidade: 1, unidade: 'sc', preco_unit: 30,
        ecr_id: opcoes.semEcr ? null : 12,
      }),
    ],
    versao: 1,
  });
}

const linha = (situacao: Situacao, ecrs: number[]): LinhaDeQualificacao => ({
  id: 1, empresaRaizId: 'empresa-a', fornecedorId: null, categoria: 'material', tipo: '',
  qualificadaEm: '2025-05-07', venceEm: '2026-05-07',
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

beforeEach(() => {
  const parada = async (): Promise<never> => {
    throw new Error('parada aqui pelo teste');
  };
  gravacoes.salvar = vi.fn(parada);
  gravacoes.status = vi.fn(parada);
  gravacoes.qualificar = vi.fn(parada);
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

describe('D605 — a porta "Emitir OC" da Nova OC', () => {
  it('as qualificações não carregaram: zero gravação, e o aviso diz que não deu para confirmar (a trava fecha)', async () => {
    await emitir();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(avisos()).toContain(QUALIFICACAO_SEM_CONFIRMACAO);
    expect(caixa()).toBeNull();
  });

  it('empresa sem qualificação: zero gravação, e o "Qualificar agora" abre com a ECR da OC marcada', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    await emitir();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    const porque = caixa()!.querySelector('[data-porque]')!.textContent!;
    expect(porque).toContain('não tem qualificação de material');
    // D614 §2.4: quem lê já está dentro do "Qualificar agora".
    expect(porque).toContain('Qualifique aqui para emitir, ou volte e salve como rascunho.');
    expect(porque).not.toContain('Qualificar agora');
    expect(within(caixa()!).getByRole('checkbox', { name: /ECR 12/ })).toBeChecked();
    expect(within(caixa()!).getByRole('checkbox', { name: /ECR 19/ })).not.toBeChecked();
  });

  it('qualificação vencida: zero gravação, com a data do vencimento no motivo', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('vencida', [12])]));
    await emitir();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(caixa()!.querySelector('[data-porque]')!.textContent).toContain('venceu em 07/05/2026');
  });

  it('desqualificada: zero gravação', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('desqualificada', [12])]));
    await emitir();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(caixa()!.querySelector('[data-porque]')!.textContent).toContain('desqualificada');
  });

  it('qualificada, mas não para a ECR da OC: zero gravação; o "Qualificar agora" soma as que ela já tinha', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [19])]));
    await emitir();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(caixa()!.querySelector('[data-porque]')!.textContent).toContain('não para a ECR 12');
    expect(within(caixa()!).getByRole('checkbox', { name: /ECR 12/ })).toBeChecked();
    expect(within(caixa()!).getByRole('checkbox', { name: /ECR 19/ })).toBeChecked();
  });

  it('a régua: qualificada para a ECR da OC, a gravação É chamada', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12, 19])]));
    await emitir();
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
  });

  it('a régua: vence em 30 dias ainda emite', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('vence_em_30_dias', [12])]));
    await emitir();
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
  });

  it('OC sem item de ECR não pede qualificação, nem com as qualificações fora do ar (D605 §3)', async () => {
    await emitir(oc({ semEcr: true }));
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
  });

  it('salvar rascunho continua livre (D605 §2)', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    useOcEditingStore.getState().startEditing(oc());
    render(<NovaOcPage />);
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /Salvar Rascunho/ })[0]!);
    });
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
    expect(caixa()).toBeNull();
  });
});

describe('D605 — o "Qualificar agora"', () => {
  function preencher(atendem: boolean[]) {
    const c = caixa()!;
    atendem.forEach((a, i) => {
      const criterio = c.querySelector<HTMLElement>(`[data-criterio="${i + 1}"]`)!;
      fireEvent.click(within(criterio).getByRole('radio', { name: a ? 'Atende' : 'Não atende' }));
      fireEvent.change(within(criterio).getByRole('textbox'), { target: { value: `motivo ${i + 1}` } });
    });
  }
  async function gravar() {
    await act(async () => {
      fireEvent.click(within(caixa()!).getByRole('button', { name: 'Gravar qualificação' }));
    });
  }

  it('sem motivo não grava: a qualificação não sai e a OC não emite', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    await emitir();
    const c = caixa()!;
    fireEvent.click(within(c.querySelector<HTMLElement>('[data-criterio="1"]')!).getByRole('radio', { name: 'Atende' }));
    await gravar();
    expect(gravacoes.qualificar).not.toHaveBeenCalled();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(within(caixa()!).getByRole('alert').textContent).toContain('critério 2');
  });

  it('gravou com a nota no mínimo: a qualificação vai com as ECRs, e a emissão segue sozinha', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    gravacoes.qualificar = vi.fn(async () => ({
      qualificacaoId: 30, nota: 2, minimo: 2, qualificada: true, situacao: 'qualificada', venceEm: '2027-09-28',
    }));
    // O recarregar traz a linha nova, como o banco traria.
    gravacoes.recarregar = vi.fn(async () => {
      useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12])]));
    });
    await emitir();
    preencher([true, true, false]);
    await gravar();
    expect(gravacoes.qualificar).toHaveBeenCalledTimes(1);
    expect(gravacoes.qualificar.mock.calls[0]![0]).toMatchObject({
      sujeito: { empresa_raiz_id: 'empresa-a' },
      categoria: 'material',
      ecrs: [12],
      criterios: [
        { atende: true, motivo: 'motivo 1' },
        { atende: true, motivo: 'motivo 2' },
        { atende: false, motivo: 'motivo 3' },
      ],
    });
    expect(gravacoes.salvar).toHaveBeenCalledTimes(1);
    expect(caixa()).toBeNull();
  });

  it('gravou abaixo do mínimo: a empresa fica desqualificada, e zero gravação da OC', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    gravacoes.qualificar = vi.fn(async () => ({
      qualificacaoId: 31, nota: 1, minimo: 2, qualificada: false, situacao: 'desqualificada', venceEm: '2027-09-28',
    }));
    await emitir();
    preencher([true, false, false]);
    await gravar();
    expect(gravacoes.qualificar).toHaveBeenCalledTimes(1);
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(avisos().join(' ')).toContain('a empresa ficou desqualificada');
  });

  it('o banco recusou a qualificação: a caixa fica aberta com a frase, e a OC não emite', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    gravacoes.qualificar = vi.fn(async () => {
      throw new Error('Só quem pode emitir OC qualifica uma empresa.');
    });
    await emitir();
    preencher([true, true, true]);
    await gravar();
    expect(gravacoes.salvar).not.toHaveBeenCalled();
    expect(within(caixa()!).getByRole('alert').textContent).toContain('Só quem pode emitir OC');
  });
});

describe('D605 — a porta "emitida" do Histórico', () => {
  const avisar = vi.fn();
  beforeEach(() => avisar.mockClear());

  it('as qualificações não carregaram: zero gravação (a trava fecha)', async () => {
    await mudarStatusDaOc(oc(), 'emitida', [FILIAL], avisar);
    expect(gravacoes.status).not.toHaveBeenCalled();
    expect(avisar).toHaveBeenCalledWith(QUALIFICACAO_SEM_CONFIRMACAO, 'warning');
  });

  it('empresa sem qualificação: zero gravação', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([]));
    await mudarStatusDaOc(oc(), 'emitida', [FILIAL], avisar);
    expect(gravacoes.status).not.toHaveBeenCalled();
    expect(avisar.mock.calls[0]![0]).toContain('não tem qualificação de material');
    // O Histórico não tem o "Qualificar agora": a frase manda à ficha da empresa.
    expect(avisar.mock.calls[0]![0]).toContain('Qualifique a empresa na ficha dela, em Fornecedores');
    expect(avisar.mock.calls[0]![0]).not.toContain('Qualificar agora');
  });

  it('a régua: qualificada para a ECR, a gravação É chamada', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12])]));
    await mudarStatusDaOc(oc(), 'emitida', [FILIAL], avisar);
    expect(gravacoes.status).toHaveBeenCalledWith('oc-teste', 'emitida', 1);
  });

  it('cancelar não passa pela trava', async () => {
    await mudarStatusDaOc(oc(), 'cancelada', [FILIAL], avisar);
    expect(gravacoes.status).toHaveBeenCalledWith('oc-teste', 'cancelada', 1);
  });

  it('a trava do banco (23514) chega como aviso, sem o "Erro ao alterar status"', async () => {
    useQualificacaoStore.getState().definir(qualificacoes([linha('qualificada', [12])]));
    gravacoes.status = vi.fn(async () => {
      throw new TravaDoBanco('A OC 2026/009 não pode ser emitida: a qualificação venceu. Requalifique a empresa.');
    });
    await mudarStatusDaOc(oc(), 'emitida', [FILIAL], avisar);
    expect(avisar).toHaveBeenCalledWith(
      'A OC 2026/009 não pode ser emitida: a qualificação venceu. Requalifique a empresa.',
      'warning',
    );
  });
});
