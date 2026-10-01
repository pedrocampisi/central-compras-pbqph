import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D661: a tela Qualificação, igual à planilha FO 8.4.1.1. As cinco abas,
 * as colunas da planilha, o "+ Qualificar fornecedor" com o mesmo diálogo, o
 * cadastro novo e a volta para qualificar, o requalificar na linha, o PDF e a
 * tela de quem só lê. Empresas e números INVENTADOS; banco falso.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(() => ({}) as { qualificar: Mock; recarregar: Mock; salvar: Mock });
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  qualificarEmpresa: (...a: unknown[]) => banco.qualificar(...a),
}));
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarFornecedor: (...a: unknown[]) => banco.salvar(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => banco.recarregar() }));
const baixados = vi.hoisted(() => [] as { nome: string; tamanho: number }[]);
vi.mock('../../src/services/storage/download', () => ({
  downloadBlob: (b: Blob, nome: string) => baixados.push({ nome, tamanho: b.size }),
}));

import { QualificacaoPage } from '../../src/features/qualificacao/QualificacaoPage';
import { normalizeFornecedor } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { DadosDaQualificacao } from '../../src/services/supabase/qualificacao';
import type { LinhaDeQualificacao } from '../../src/domain/qualificacao';
import type { Data, Fornecedor } from '../../src/domain/types';

const filial = (id: string, empresa: string | undefined, apelido: string): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: `${apelido} filial ${id}` }),
  ativo: true,
  empresa_id: empresa,
  empresa_apelido: empresa ? apelido : undefined,
});

const A1 = filial('a1', 'empresa-a', 'Alfa (teste)');
const A2 = filial('a2', 'empresa-a', 'Alfa (teste)');
const B1 = filial('b1', 'empresa-b', 'Beta (teste)');
const C1 = filial('c1', 'empresa-c', 'Gama (teste)');

function dados(fornecedores: Fornecedor[] = [A1, A2, B1, C1]): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: [], texto_condicoes_contratacao: '', texto_envio_nf: '', texto_qualidade: '', pasta_backups: '',
    },
    fornecedores, obras: [], ordens_compra: [],
    ecrs: [{ id: 12, codigo: 'ECR 12', nome: 'Cimento (teste)' }],
  } as unknown as Data;
}

const linha = (o: Partial<LinhaDeQualificacao>): LinhaDeQualificacao => ({
  id: 1, empresaRaizId: 'empresa-a', fornecedorId: null, categoria: 'material', tipo: 'Cimento',
  qualificadaEm: '2026-05-07', venceEm: '2027-05-07',
  criterios: [
    { atende: true, motivo: 'atende a ECR (teste)' },
    { atende: false, motivo: 'mais caro (teste)' },
    { atende: true, motivo: 'entrega no prazo (teste)' },
  ],
  nota: 2, minimo: 2, qualificada: true, qualificadoPorNome: 'Pessoa de teste', origem: '',
  situacao: 'qualificada', ecrs: [12], vigente: true,
  ...o,
});

const CATEGORIAS: DadosDaQualificacao['categorias'] = [
  { categoria: 'material', nome: 'Materiais', minimo: 2, criterios: ['Atende a ECR', 'Menor preço', 'Prazo'] },
  { categoria: 'servico', nome: 'Serviço', minimo: 2, criterios: ['Documentação', 'EPI', 'Preço'] },
  { categoria: 'controle_tecnologico', nome: 'Controle tecnológico', minimo: 1, criterios: ['Acreditação', 'NBR 17025', 'ISO 9001'] },
  { categoria: 'projeto', nome: 'Projetos', minimo: 2, criterios: ['ART', 'NBR 15575', 'Preço'] },
  { categoria: 'locacao', nome: 'Locação', minimo: 2, criterios: ['Contrato', 'Checklist', 'Preço'] },
];

/** Alfa qualificada (com histórico atrás), Beta vencida, Gama desqualificada; um laboratório; Locação vazia. */
const LINHAS = [
  linha({ id: 1, qualificadaEm: '2025-05-07', venceEm: '2026-05-07', situacao: 'vencida', vigente: false }),
  linha({ id: 2 }),
  linha({ id: 3, empresaRaizId: 'empresa-b', qualificadaEm: '2025-08-01', venceEm: '2026-08-01', situacao: 'vencida' }),
  linha({ id: 4, empresaRaizId: 'empresa-c', nota: 1, qualificada: false, situacao: 'desqualificada', ecrs: [] }),
  linha({ id: 5, empresaRaizId: 'empresa-b', categoria: 'controle_tecnologico', tipo: '', minimo: 1, ecrs: [] }),
];

function qualificacoes(linhas = LINHAS): DadosDaQualificacao {
  return {
    linhas, categorias: CATEGORIAS, tratativas: [],
    desempenho: [{ empresaRaizId: 'empresa-a', fornecedorId: null, entregas: 4, noPrazo: 3, inteiras: 4, conformes: 3, primeira: '', ultima: '' }],
  };
}

const tabela = () => document.querySelector<HTMLElement>('[data-tabela-da-qualificacao]')!;
const cabecalho = () => [...tabela().querySelectorAll('thead th')].map((th) => th.textContent!.trim());
const linhaDe = (chave: string) => tabela().querySelector<HTMLElement>(`[data-linha="${chave}"]`)!;
const aba = (c: string) => document.querySelector<HTMLElement>(`[data-aba="${c}"]`)!;
const dialogo = () => document.querySelector<HTMLElement>('[data-dialogo-qualificar]');

beforeEach(() => {
  banco.qualificar = vi.fn(async () => ({ id: 99, nota: 3, minimo: 2, qualificada: true, situacao: 'qualificada', venceEm: '2027-10-01' }));
  banco.recarregar = vi.fn(async () => {});
  banco.salvar = vi.fn(async () => 'novo-1');
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useQualificacaoStore.getState().definir(qualificacoes());
  baixados.length = 0;
});

describe('CTO-D661 — as cinco abas', () => {
  it('na ordem da planilha, cada uma com quantas empresas tem; a que pede ação diz quantas', () => {
    render(<QualificacaoPage />);
    const abas = [...document.querySelectorAll('[role=tab]')].map((t) => t.textContent);
    expect(abas).toEqual(['Materiais3 2', 'Serviço0', 'Controle tecnológico1', 'Projetos0', 'Locação0']);
    expect(aba('material').getAttribute('aria-selected')).toBe('true');
  });

  it('Materiais: uma linha por empresa; o que pede ação primeiro; o histórico não vira linha', () => {
    render(<QualificacaoPage />);
    const linhas = [...tabela().querySelectorAll('tbody tr')].map((tr) => tr.getAttribute('data-linha'));
    expect(linhas).toEqual(['empresa-b', 'empresa-c', 'empresa-a']);
  });

  it('a aba vazia diz que está vazia', () => {
    render(<QualificacaoPage />);
    fireEvent.click(aba('locacao'));
    expect(screen.getByText('Nenhuma empresa qualificada em Locação')).toBeTruthy();
  });
});

describe('CTO-D661 — as colunas da planilha', () => {
  it('Materiais: as colunas na ordem, com a Permissão para compra no fim (as ações embaixo do nome)', () => {
    render(<QualificacaoPage />);
    expect(cabecalho()).toEqual([
      'Fornecedor', 'Tipo', 'Qualificada em', 'Requalificar em',
      '1. Atende a ECR', '2. Menor preço', '3. Prazo',
      'Nota de desempenho', 'Situação', 'Permissão para compra',
    ]);
    const a = linhaDe('empresa-a').textContent!;
    expect(a).toContain('Alfa (teste)');
    expect(a).toContain('CimentoECR 12');
    expect(a).toContain('07/05/2026');
    expect(a).toContain('07/05/2027');
    expect(a).toContain('2 de 3mínimo 2');
    // As entregas dos últimos 12 meses, curtas, na coluna da nota; inteiras no passar do mouse.
    const entregas = linhaDe('empresa-a').querySelector<HTMLElement>('[data-entregas]')!;
    expect(entregas.textContent).toBe('4 entregas, 3 no prazo');
    expect(entregas.title).toBe('Nos últimos 12 meses: 4 entregas avaliadas — 3 no prazo, 4 inteiras, 3 conformes com a OC e a ECR.');
    expect(a).toContain('Qualificada até 05/2027');
    expect(within(linhaDe('empresa-a')).getByText('Sim')).toBeTruthy();
    expect(within(linhaDe('empresa-b')).getByText('Não')).toBeTruthy();
    expect(within(linhaDe('empresa-c')).getByText('Não')).toBeTruthy();
  });

  it('Controle tecnológico: sem Tipo, a coluna se chama "Desempenho" e não há Permissão', () => {
    render(<QualificacaoPage />);
    fireEvent.click(aba('controle_tecnologico'));
    expect(cabecalho()).toEqual([
      'Fornecedor', 'Qualificada em', 'Requalificar em', '1. Acreditação', '2. NBR 17025', '3. ISO 9001',
      'Desempenho', 'Situação',
    ]);
  });

  it('o critério: "atende" ou "não atende", o texto e o motivo no passar do mouse e num clique', () => {
    render(<QualificacaoPage />);
    const botao = within(linhaDe('empresa-a')).getByRole('button', { name: 'Não atende' });
    expect(botao.getAttribute('title')).toBe('Menor preço: não atende — mais caro (teste)');
    fireEvent.click(botao);
    const aberto = document.querySelector<HTMLElement>('[data-criterios-de="empresa-a"]')!;
    expect(aberto.textContent).toContain('Atende a ECR: atende — atende a ECR (teste)');
    expect(aberto.textContent).toContain('Menor preço: não atende — mais caro (teste)');
    expect(aberto.textContent).toContain('Qualificada por Pessoa de teste');
  });

  it('o filtro "pedem ação" deixa só a vencida e a desqualificada', () => {
    render(<QualificacaoPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Pedem ação' }));
    const linhas = [...tabela().querySelectorAll('tbody tr')].map((tr) => tr.getAttribute('data-linha'));
    expect(linhas).toEqual(['empresa-b', 'empresa-c']);
  });
});

describe('CTO-D661 — qualificar e requalificar, com o mesmo diálogo', () => {
  it('"Requalificar" na linha abre o diálogo da categoria, com as ECRs que ela tinha', () => {
    render(<QualificacaoPage />);
    fireEvent.click(within(linhaDe('empresa-a')).getByRole('button', { name: 'Requalificar' }));
    expect(dialogo()!.querySelector('h3')!.textContent).toBe('Requalificar — Materiais');
    expect(screen.getByRole('checkbox', { name: /ECR 12/ })).toHaveProperty('checked', true);
  });

  it('"+ Qualificar fornecedor": escolhe a empresa pela busca; quem tem linha é "Requalificar"', () => {
    render(<QualificacaoPage />);
    fireEvent.click(screen.getByRole('button', { name: '+ Qualificar fornecedor' }));
    const escolha = document.querySelector<HTMLElement>('[data-escolher-fornecedor]')!;
    expect(escolha.textContent).toContain('Qualificar fornecedor — Materiais');
    const campo = within(escolha).getByRole('combobox');
    fireEvent.change(campo, { target: { value: 'Beta' } });
    fireEvent.keyDown(campo, { key: 'Enter' });
    fireEvent.click(within(escolha).getByRole('button', { name: 'Continuar' }));
    expect(dialogo()!.querySelector('h3')!.textContent).toBe('Requalificar — Materiais');
  });

  it('na aba de Locação, a empresa sem linha ali é "Qualificar", e o diálogo grava na categoria da aba', async () => {
    render(<QualificacaoPage />);
    fireEvent.click(aba('locacao'));
    fireEvent.click(screen.getByRole('button', { name: '+ Qualificar fornecedor' }));
    const escolha = document.querySelector<HTMLElement>('[data-escolher-fornecedor]')!;
    const campo = within(escolha).getByRole('combobox');
    fireEvent.change(campo, { target: { value: 'Alfa' } });
    fireEvent.keyDown(campo, { key: 'Enter' });
    fireEvent.click(within(escolha).getByRole('button', { name: 'Continuar' }));
    const d = dialogo()!;
    expect(d.querySelector('h3')!.textContent).toBe('Qualificar — Locação');
    d.querySelectorAll<HTMLInputElement>('input[type=radio]').forEach((r, i) => i % 2 === 0 && fireEvent.click(r));
    d.querySelectorAll('textarea').forEach((t) => fireEvent.change(t, { target: { value: 'motivo (teste)' } }));
    fireEvent.click(within(d).getByRole('button', { name: 'Gravar qualificação' }));
    await vi.waitFor(() => expect(banco.qualificar).toHaveBeenCalledTimes(1));
    expect(banco.qualificar.mock.calls[0]![0]).toMatchObject({ sujeito: { empresa_raiz_id: 'empresa-a' }, categoria: 'locacao' });
    await vi.waitFor(() => expect(useUiStore.getState().toasts.map((t) => t.message)).toContain('Locação: Qualificada até 10/2027.'));
  });

  it('o fornecedor que não está no cadastro: cadastra sem sair da tela e volta para qualificar', async () => {
    const NOVO = filial('novo-1', undefined, 'Blocos Novos (teste)');
    banco.recarregar = vi.fn(async () => useDataStore.setState({ data: dados([A1, A2, B1, C1, NOVO]) }));
    render(<QualificacaoPage />);
    fireEvent.click(screen.getByRole('button', { name: '+ Qualificar fornecedor' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar novo fornecedor' }));
    expect(screen.getByText('Novo Fornecedor')).toBeTruthy();
    // O campo da gaveta não liga o rótulo ao input: acha pelo bloco do rótulo.
    let bloco: HTMLElement | null = screen.getByText(/Razão Social/);
    while (bloco && !bloco.querySelector('input')) bloco = bloco.parentElement;
    fireEvent.change(bloco!.querySelector('input')!, { target: { value: 'Blocos Novos (teste)' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar' }));
    await vi.waitFor(() => expect(dialogo()).not.toBeNull());
    expect(dialogo()!.querySelector('h3')!.textContent).toBe('Qualificar — Materiais');
    expect(dialogo()!.textContent).toContain('Blocos Novos (teste) filial novo-1');
  });

  it('"Histórico" abre a ficha da empresa', () => {
    render(<QualificacaoPage />);
    fireEvent.click(within(linhaDe('empresa-a')).getByRole('button', { name: 'Histórico' }));
    expect(document.querySelector('[data-ficha-da-empresa]')).not.toBeNull();
  });

  it('o PDF dos qualificados, com o mesmo gerador', async () => {
    render(<QualificacaoPage />);
    fireEvent.click(screen.getByRole('button', { name: /PDF dos qualificados/ }));
    await vi.waitFor(() => expect(baixados).toHaveLength(1));
    expect(baixados[0]!.nome).toMatch(/\.pdf$/);
  });
});

describe('CTO-D661 — quem só lê', () => {
  it('vê as qualificações, sem "+ Qualificar fornecedor" e sem "Requalificar"', () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    render(<QualificacaoPage />);
    expect(document.querySelector('[data-so-leitura]')!.textContent).toBe(
      'Só quem emite OC qualifica. Aqui você vê as qualificações.',
    );
    expect(screen.queryByRole('button', { name: '+ Qualificar fornecedor' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Requalificar' })).toBeNull();
    expect(within(linhaDe('empresa-a')).getByRole('button', { name: 'Histórico' })).toBeTruthy();
  });

  it('sem as qualificações carregadas: diz que não carregou', () => {
    useQualificacaoStore.getState().falhou('rede');
    render(<QualificacaoPage />);
    expect(screen.getByRole('alert').textContent).toContain('As qualificações não carregaram (rede)');
  });
});
