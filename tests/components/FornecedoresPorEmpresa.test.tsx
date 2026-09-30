import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D641: a tela de Fornecedores por empresa. A palavra do Pedro, com a foto
 * da busca de uma empresa: "aqui ainda está com as filiais" — três linhas, uma
 * por filial, com o mesmo selo. A empresa entra uma vez; as filiais abrem
 * dentro dela. Empresas, CNPJs e endereços INVENTADOS; banco falso.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { FornecedoresPage } from '../../src/features/fornecedores/FornecedoresPage';
import { normalizeFornecedor } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { LinhaDeQualificacao } from '../../src/domain/qualificacao';
import type { Data, Fornecedor } from '../../src/domain/types';

const filial = (
  id: string,
  o: { cnpj: string; cidade: string; rua?: string; ativo?: boolean; email?: string; empresa?: string; apelido?: string; razao?: string },
): Fornecedor => ({
  ...normalizeFornecedor({
    id,
    razao_social: o.razao ?? 'AURORA TINTAS LTDA (teste)',
    cnpj: o.cnpj,
    email: o.email ?? '',
    endereco: { logradouro: o.rua ?? '', numero: o.rua ? '100' : '', cidade: o.cidade, uf: 'MG' },
  }),
  ativo: o.ativo ?? true,
  fornece_material: true,
  presta_servico: false,
  bloqueado_para_compra_nova: false,
  empresa_id: o.empresa,
  empresa_apelido: o.apelido,
});

// A empresa da foto: três filiais, duas na mesma cidade, uma inativa.
const AURORA = { empresa: 'emp-aurora', apelido: 'Tintas Aurora (teste)' };
const A1 = filial('a1', { ...AURORA, cnpj: '11222333000181', cidade: 'Uberlândia', rua: 'Rua das Acácias', email: 'matriz@exemplo.invalid' });
const A2 = filial('a2', { ...AURORA, cnpj: '11222333000262', cidade: 'Uberlândia', rua: 'Avenida Brasil', email: 'loja2@exemplo.invalid' });
const A3 = filial('a3', { ...AURORA, cnpj: '11222333000343', cidade: 'Araguari', ativo: false });
// Duas filiais ativas de outra empresa.
const GAMA = { empresa: 'emp-gama', apelido: 'Aço Gama (teste)', razao: 'GAMA SIDERURGICA S/A (teste)' };
const G1 = filial('g1', { ...GAMA, cnpj: '44555666000101', cidade: 'Uberaba' });
const G2 = filial('g2', { ...GAMA, cnpj: '44555666000292', cidade: 'Uberaba', rua: 'Rua do Aço' });
// Sem empresa no banco: vira empresa sozinha.
const BETA = filial('b1', { cnpj: '77888999000155', cidade: 'Patos de Minas', razao: 'Concreto Beta (teste)', email: 'beta@exemplo.invalid' });

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [A1, A2, A3, G1, G2, BETA],
    obras: [], ecrs: [], ordens_compra: [],
  } as unknown as Data;
}

const qualificada: LinhaDeQualificacao = {
  id: 1, empresaRaizId: 'emp-aurora', fornecedorId: null, categoria: 'material', tipo: 'Tintas',
  qualificadaEm: '2026-05-07', venceEm: '2027-05-07', criterios: [], nota: 3, minimo: 2, qualificada: true,
  qualificadoPorNome: 'Pessoa de teste', origem: '', situacao: 'qualificada', ecrs: [], vigente: true,
};

beforeEach(() => {
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [], fornFilter: { search: '', status: 'todos' } } as never);
  useQualificacaoStore.getState().definir({ linhas: [qualificada], categorias: [], tratativas: [], desempenho: [] });
});

const empresas = () => [...document.querySelectorAll<HTMLElement>('tr[data-empresa]')];
const filiais = () => [...document.querySelectorAll<HTMLElement>('tr[data-filial]')];
const linhaDa = (chave: string) => document.querySelector<HTMLElement>(`tr[data-empresa="${chave}"]`)!;
const buscar = (texto: string) => useUiStore.getState().setFornFilter({ search: texto });
const filtrar = (status: 'todos' | 'ativos' | 'inativos') => useUiStore.getState().setFornFilter({ status });

describe('CTO-D641 — a empresa uma vez', () => {
  it('três filiais da mesma empresa dão uma linha só, com um selo só', () => {
    render(<FornecedoresPage />);
    expect(empresas()).toHaveLength(3); // Aurora, Gama e a Beta sozinha
    expect(screen.getAllByText('Tintas Aurora (teste)')).toHaveLength(1);
    const aurora = linhaDa('emp-aurora');
    expect(aurora.textContent).toContain('AURORA TINTAS LTDA (teste) · 3 filiais · Araguari/MG e Uberlândia/MG');
    expect(within(aurora).getAllByText('Qualificada até 05/2027')).toHaveLength(1);
    // O que é da filial não fica na linha da empresa.
    expect(aurora.textContent).not.toContain('11.222.333');
    expect(aurora.textContent).not.toContain('matriz@exemplo.invalid');
    expect(filiais()).toHaveLength(0);
  });

  it('a ordem é a do apelido, e o contador diz empresas e filiais', () => {
    render(<FornecedoresPage />);
    expect(empresas().map((l) => l.dataset.empresa)).toEqual(['emp-gama', 'filial:b1', 'emp-aurora']);
    expect(screen.getByText('3 de 3 empresas · 6 filiais')).toBeTruthy();
  });

  it('ao clicar na empresa, as filiais abrem logo abaixo: a cidade, a rua quando a cidade empata, o CNPJ, o contato e o "Editar"', () => {
    render(<FornecedoresPage />);
    fireEvent.click(screen.getByRole('button', { name: /Tintas Aurora \(teste\): abrir as 3 filiais/ }));
    const abertas = filiais();
    // Pela cidade, e na mesma cidade pela ordem do CNPJ (a matriz, 0001, primeiro).
    expect(abertas.map((l) => l.dataset.filial)).toEqual(['a3', 'a1', 'a2']);
    // Logo abaixo da empresa, na ordem da tabela.
    const todas = [...document.querySelectorAll<HTMLElement>('tbody tr')];
    expect(todas.indexOf(abertas[0]!)).toBe(todas.indexOf(linhaDa('emp-aurora')) + 1);
    expect(abertas[0]!.textContent).toContain('Araguari/MG');
    expect(abertas[0]!.textContent).not.toContain('Rua');
    expect(abertas[0]!.textContent).toContain('— Inativo');
    expect(abertas[1]!.textContent).toContain('Uberlândia/MG · Rua das Acácias, 100');
    expect(abertas[1]!.textContent).toContain('11.222.333/0001-81');
    expect(abertas[1]!.textContent).toContain('matriz@exemplo.invalid');
    expect(abertas[2]!.textContent).toContain('Uberlândia/MG · Avenida Brasil, 100');
    // O "Editar" da filial abre a gaveta de hoje, com a filial dela.
    fireEvent.click(within(abertas[2]!).getByRole('button', { name: 'Editar' }));
    expect(screen.getByDisplayValue('loja2@exemplo.invalid')).toBeTruthy();
  });

  it('clicar de novo fecha', () => {
    render(<FornecedoresPage />);
    const botao = screen.getByRole('button', { name: /Tintas Aurora \(teste\): abrir/ });
    fireEvent.click(botao);
    expect(botao.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(botao);
    expect(botao.getAttribute('aria-expanded')).toBe('false');
    expect(filiais()).toHaveLength(0);
  });
});

describe('CTO-D641 — a busca', () => {
  it('pelo CNPJ de uma filial, com a pontuação: acha a empresa, abre as filiais sozinha e marca a que casou', () => {
    buscar('11.222.333/0002-62');
    render(<FornecedoresPage />);
    expect(empresas().map((l) => l.dataset.empresa)).toEqual(['emp-aurora']);
    expect(filiais()).toHaveLength(3);
    const achadas = filiais().filter((l) => l.dataset.achada);
    expect(achadas.map((l) => l.dataset.filial)).toEqual(['a2']);
    expect(screen.getAllByText('achada pela busca')).toHaveLength(1);
    expect(screen.getByText('1 de 3 empresas · 3 filiais')).toBeTruthy();
  });

  it('pelo CNPJ sem pontuação e pelo e-mail de uma filial: o mesmo', () => {
    buscar('11222333000262');
    const { unmount } = render(<FornecedoresPage />);
    expect(filiais().filter((l) => l.dataset.achada).map((l) => l.dataset.filial)).toEqual(['a2']);
    unmount();
    buscar('matriz@exemplo');
    render(<FornecedoresPage />);
    expect(filiais().filter((l) => l.dataset.achada).map((l) => l.dataset.filial)).toEqual(['a1']);
  });

  it('pelo apelido: acha a empresa e abre as filiais, sem marcar nenhuma', () => {
    buscar('aurora (TESTE)');
    render(<FornecedoresPage />);
    expect(empresas()).toHaveLength(1);
    expect(filiais()).toHaveLength(3);
    expect(filiais().filter((l) => l.dataset.achada)).toHaveLength(0);
  });

  it('pela cidade, sem acento: acha a empresa da filial de lá', () => {
    buscar('uberlandia');
    render(<FornecedoresPage />);
    expect(empresas().map((l) => l.dataset.empresa)).toEqual(['emp-aurora']);
    expect(filiais().filter((l) => l.dataset.achada).map((l) => l.dataset.filial)).toEqual(['a1', 'a2']);
  });

  it('a busca que dá duas empresas não abre nenhuma sozinha', () => {
    buscar('Ube'); // Uberlândia (Aurora) e Uberaba (Gama)
    render(<FornecedoresPage />);
    expect(empresas().map((l) => l.dataset.empresa)).toEqual(['emp-gama', 'emp-aurora']);
    expect(filiais()).toHaveLength(0);
  });
});

describe('CTO-D641 — ativo', () => {
  it('as filiais discordam: a empresa diz "2 de 3 ativas"; concordam: como antes', () => {
    render(<FornecedoresPage />);
    expect(linhaDa('emp-aurora').textContent).toContain('2 de 3 ativas');
    expect(linhaDa('emp-gama').textContent).toContain('✓ Ativo');
  });

  it('ativo misto aparece nos dois filtros: "Ativos" e "Inativos"', () => {
    filtrar('ativos');
    const { unmount } = render(<FornecedoresPage />);
    expect(empresas().map((l) => l.dataset.empresa)).toEqual(['emp-gama', 'filial:b1', 'emp-aurora']);
    unmount();
    filtrar('inativos');
    render(<FornecedoresPage />);
    // A filial desativada continua achável: a empresa dela aparece.
    expect(empresas().map((l) => l.dataset.empresa)).toEqual(['emp-aurora']);
  });
});

describe('CTO-D641 — a filial sem empresa', () => {
  it('vira empresa sozinha, num nível só: o CNPJ e a cidade na linha, e o "Editar" abre a gaveta direto', () => {
    render(<FornecedoresPage />);
    const beta = linhaDa('filial:b1');
    expect(beta.textContent).toContain('Concreto Beta (teste)');
    expect(beta.textContent).toContain('Patos de Minas/MG');
    expect(beta.textContent).toContain('77.888.999/0001-55');
    expect(within(beta).queryByRole('button', { name: /abrir/ })).toBeNull();
    fireEvent.click(within(beta).getByRole('button', { name: 'Editar' }));
    expect(screen.getByDisplayValue('beta@exemplo.invalid')).toBeTruthy();
  });
});
