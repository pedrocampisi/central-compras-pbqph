import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

/**
 * CTO-D964: a lista de Fornecedores abre com quem fornece material. A palavra
 * do Pedro, com a foto da lista: "tem alguns fornecedores que são prestadores
 * de serviço e não fornecedores de material". A marca é a do banco; quem só
 * presta serviço e quem não tem marca ficam a um clique. Empresas e CNPJs
 * INVENTADOS; banco falso.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { FornecedoresPage } from '../../src/features/fornecedores/FornecedoresPage';
import { agruparPorEmpresa, empresaDoTipo, empresasDaTela } from '../../src/domain/fornecedores';
import { normalizeFornecedor } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, Fornecedor } from '../../src/domain/types';

const filial = (
  id: string,
  apelido: string,
  cnpj: string,
  marca: { material?: boolean; servico?: boolean },
  o: { empresa?: string; ativo?: boolean } = {},
): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: `${apelido.toUpperCase()} LTDA`, cnpj }),
  ativo: o.ativo ?? true,
  fornece_material: marca.material,
  presta_servico: marca.servico,
  bloqueado_para_compra_nova: false,
  empresa_id: o.empresa ?? `emp-${id}`,
  empresa_apelido: apelido,
});

// Só material, os dois, só serviço, sem marca, e uma empresa de duas filiais em
// que só uma fornece material (a marca da empresa é a de alguma filial).
const SO_MATERIAL = filial('m', 'Areia Norte (teste)', '11111111000111', { material: true, servico: false });
const OS_DOIS = filial('d', 'Elétrica Dupla (teste)', '22222222000122', { material: true, servico: true });
const SO_SERVICO = filial('s', 'Armador Silva (teste)', '33333333000133', { material: false, servico: true });
const SEM_MARCA = filial('x', 'Cadastro Novo (teste)', '44444444000144', {});
const MISTA_1 = filial('k1', 'Ferragens Kappa (teste)', '55555555000155', { material: false, servico: true }, { empresa: 'emp-kappa' });
const MISTA_2 = filial('k2', 'Ferragens Kappa (teste)', '55555555000236', { material: true, servico: false }, { empresa: 'emp-kappa', ativo: false });
const TODAS = [SO_MATERIAL, OS_DOIS, SO_SERVICO, SEM_MARCA, MISTA_1, MISTA_2];

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: TODAS,
    obras: [], ecrs: [], ordens_compra: [],
  } as unknown as Data;
}

/**
 * A ISCA: a conta que parece certa e não é — "material é quem não presta
 * serviço". Ela tira da lista quem faz os dois e põe quem não tem marca. O
 * teste tem de separar as duas, senão não prova nada.
 */
const iscaDeMaterial = (f: Fornecedor) => f.presta_servico !== true;

beforeEach(() => {
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [], fornFilter: { search: '', status: 'todos', tipo: 'material' } } as never);
  useQualificacaoStore.getState().definir({ linhas: [], categorias: [], tratativas: [], desempenho: [] });
});

const naTela = () => [...document.querySelectorAll<HTMLElement>('tr[data-empresa]')].map((l) => l.dataset.empresa);

describe('D964 — a lista mostra quem fornece material', () => {
  it('a lista abre com quem fornece material: só material, os dois, e a empresa em que uma filial fornece', () => {
    expect(useUiStore.getInitialState().fornFilter.tipo).toBe('material');
    render(<FornecedoresPage />);
    expect(naTela()).toEqual(['emp-m', 'emp-d', 'emp-kappa']);
    expect(screen.getByText('3 de 5 empresas · 4 filiais')).toBeTruthy();
    expect(screen.queryByText('Armador Silva (teste)')).toBeNull();
    expect(screen.queryByText('Cadastro Novo (teste)')).toBeNull();
    expect(screen.getByRole('button', { name: 'Material' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('"Serviço" mostra os prestadores: só serviço, os dois, e a empresa em que uma filial presta', () => {
    render(<FornecedoresPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Serviço' }));
    expect(naTela()).toEqual(['emp-s', 'emp-d', 'emp-kappa']);
  });

  it('"Todas as empresas" mostra todas, inclusive a que não tem marca', () => {
    render(<FornecedoresPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Todas as empresas' }));
    expect(naTela()).toEqual(['emp-m', 'emp-s', 'emp-x', 'emp-d', 'emp-kappa']);
    expect(screen.getByText('5 de 5 empresas · 6 filiais')).toBeTruthy();
  });

  it('o filtro de ativos continua valendo junto: material e inativos dá a empresa da filial inativa', () => {
    expect(empresasDaTela(TODAS, '', 'inativos', 'material').empresas.map((g) => g.chave)).toEqual(['emp-kappa']);
    expect(empresasDaTela(TODAS, '', 'ativos', 'material').empresas.map((g) => g.chave)).toEqual(['emp-m', 'emp-d', 'emp-kappa']);
    // A busca não fura o filtro: o prestador não aparece em "Material" nem quando é procurado.
    expect(empresasDaTela(TODAS, 'armador', 'todos', 'material').empresas).toHaveLength(0);
    expect(empresasDaTela(TODAS, 'armador', 'todos', 'servico').empresas).toHaveLength(1);
  });

  it('a isca erra: tira quem faz os dois e põe quem não tem marca', () => {
    const grupos = agruparPorEmpresa(TODAS);
    const certo = grupos.filter((g) => empresaDoTipo(g, 'material')).map((g) => g.chave);
    const isca = grupos.filter((g) => g.filiais.some(iscaDeMaterial)).map((g) => g.chave);
    expect(certo).toEqual(['emp-m', 'emp-d', 'emp-kappa']);
    expect(isca).not.toEqual(certo);
    expect(isca).toContain('emp-x');
    expect(isca).not.toContain('emp-d');
  });
});
