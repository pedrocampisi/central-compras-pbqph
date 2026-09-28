import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D604 §3.1/§3.3/§3.4 e D613 §2: a ficha da empresa (as cinco categorias,
 * o histórico, qualificar e requalificar com o desempenho ao lado), o selo na
 * Nova OC e a coluna do selo na lista. Banco falso: a gravação só é contada.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(() => ({}) as { qualificar: Mock; recarregar: Mock });
vi.mock('../../src/services/supabase/qualificacao', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/qualificacao')>()),
  qualificarEmpresa: (...a: unknown[]) => banco.qualificar(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: () => banco.recarregar() }));

import { FornecedoresPage } from '../../src/features/fornecedores/FornecedoresPage';
import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { DadosDaQualificacao } from '../../src/services/supabase/qualificacao';
import type { LinhaDeQualificacao } from '../../src/domain/qualificacao';
import type { Data, Fornecedor } from '../../src/domain/types';

const MATERIAL: Fornecedor = {
  ...normalizeFornecedor({ id: 'filial-a', razao_social: 'Filial A (teste)' }),
  fornece_material: true,
  presta_servico: false,
  bloqueado_para_compra_nova: false,
  empresa_id: 'empresa-a',
};
const SERVICO: Fornecedor = {
  ...normalizeFornecedor({ id: 'prestador-b', razao_social: 'Prestador B (teste)' }),
  fornece_material: false,
  presta_servico: true,
};

const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [MATERIAL, SERVICO],
    obras: [OBRA],
    ecrs: [
      { id: 12, codigo: 'ECR 12', nome: 'Cimento (teste)' },
      { id: 19, codigo: 'ECR 19', nome: 'Aço (teste)' },
    ],
    ordens_compra: [],
  } as unknown as Data;
}

const linha = (o: Partial<LinhaDeQualificacao>): LinhaDeQualificacao => ({
  id: 1, empresaRaizId: 'empresa-a', fornecedorId: null, categoria: 'material', tipo: 'Cimento',
  qualificadaEm: '2026-05-07', venceEm: '2027-05-07',
  criterios: [
    { atende: true, motivo: 'atende a ECR' },
    { atende: false, motivo: 'mais caro' },
    { atende: true, motivo: 'entrega no prazo' },
  ],
  nota: 2, minimo: 2, qualificada: true, qualificadoPorNome: 'Pessoa de teste', origem: '',
  situacao: 'qualificada', ecrs: [12], vigente: true,
  ...o,
});

const CATEGORIAS: DadosDaQualificacao['categorias'] = [
  { categoria: 'material', nome: 'Materiais', minimo: 2, criterios: ['Qualidade', 'Menor preço', 'Prazo'] },
  { categoria: 'servico', nome: 'Serviços', minimo: 2, criterios: ['Documentação e NR', 'EPI', 'Preço'] },
  { categoria: 'controle_tecnologico', nome: 'Controle tecnológico', minimo: 1, criterios: ['Acreditação', 'NBR 17025', 'ISO 9001'] },
  { categoria: 'projeto', nome: 'Projetos', minimo: 2, criterios: ['Responsabilidade técnica', 'NBR 15575', 'Preço'] },
  { categoria: 'locacao', nome: 'Locação', minimo: 2, criterios: ['Contrato', 'Checklist', 'Preço'] },
];

function qualificacoes(linhas: LinhaDeQualificacao[]): DadosDaQualificacao {
  return {
    linhas,
    categorias: CATEGORIAS,
    tratativas: [],
    desempenho: [{ empresaRaizId: 'empresa-a', fornecedorId: null, entregas: 4, noPrazo: 3, inteiras: 4, conformes: 3, primeira: '', ultima: '' }],
  };
}

/** A empresa A: material vigente (ECR 12) com uma linha velha vencida atrás; serviço desqualificado. */
const HISTORICO = [
  linha({ id: 1, qualificadaEm: '2025-03-01', venceEm: '2026-03-01', situacao: 'vencida', vigente: false, ecrs: [19] }),
  linha({ id: 2 }),
  linha({
    id: 3, categoria: 'servico', tipo: '', nota: 1, qualificada: false, situacao: 'desqualificada', ecrs: [],
    criterios: [{ atende: true, motivo: 'ok' }, { atende: false, motivo: 'sem EPI' }, { atende: false, motivo: 'caro' }],
  }),
];

const caixa = (sel: string) => document.querySelector<HTMLElement>(sel);
const avisos = () => useUiStore.getState().toasts.map((t) => t.message);

beforeEach(() => {
  banco.qualificar = vi.fn(async () => {
    throw new Error('parada aqui pelo teste');
  });
  banco.recarregar = vi.fn(async () => {});
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [], fornFilter: { search: '', status: 'todos' } } as never);
  useQualificacaoStore.getState().definir(qualificacoes(HISTORICO));
  useOcEditingStore.getState().stopEditing();
});

function abrirFicha(nome = 'Filial A (teste)') {
  render(<FornecedoresPage />);
  const linhaDaTabela = screen.getByText(nome).closest('tr')!;
  fireEvent.click(within(linhaDaTabela).getByRole('button', { name: 'Editar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Abrir a ficha da empresa' }));
  return caixa('[data-ficha-da-empresa]')!;
}
const categoria = (ficha: HTMLElement, c: string) => ficha.querySelector<HTMLElement>(`[data-categoria="${c}"]`)!;

describe('D604 §3.4 — o selo', () => {
  it('na lista: material para quem fornece material, serviço para quem só presta serviço', () => {
    render(<FornecedoresPage />);
    expect(screen.getByText('Filial A (teste)').closest('tr')!.textContent).toContain('Qualificada até 05/2027');
    expect(screen.getByText('Prestador B (teste)').closest('tr')!.textContent).toContain('Serviço: Sem qualificação');
  });

  it('na lista, com as qualificações fora do ar: diz que não carregou, não "sem qualificação"', () => {
    useQualificacaoStore.getState().falhou('rede');
    render(<FornecedoresPage />);
    expect(screen.getByText('Filial A (teste)').closest('tr')!.textContent).toContain('Qualificação não carregou');
  });

  it('na Nova OC, embaixo da empresa escolhida: o selo de material e as ECRs dele', () => {
    useOcEditingStore.getState().startEditing(
      normalizeOC({
        id: 'oc-teste', status: 'rascunho', fornecedor_id: MATERIAL.id, obra_id: OBRA.id,
        itens: [normalizeItem({ descricao: 'Cimento (teste)', quantidade: 1, unidade: 'sc', preco_unit: 30 })],
      }),
    );
    render(<NovaOcPage />);
    const selo = caixa('[data-selo-do-fornecedor]')!;
    expect(selo.textContent).toContain('Material: Qualificada até 05/2027');
    expect(selo.textContent).toContain('ECR 12');
  });
});

describe('D613 §2 — a ficha da empresa, aberta da gaveta da filial', () => {
  it('as cinco categorias, cada uma com o selo; o botão diz Requalificar onde há histórico', () => {
    const ficha = abrirFicha();
    expect([...ficha.querySelectorAll('[data-categoria]')].map((e) => e.getAttribute('data-categoria'))).toEqual([
      'material', 'servico', 'controle_tecnologico', 'projeto', 'locacao',
    ]);
    expect(categoria(ficha, 'material').textContent).toContain('Qualificada até 05/2027');
    expect(categoria(ficha, 'servico').textContent).toContain('Desqualificada');
    expect(categoria(ficha, 'projeto').textContent).toContain('Sem qualificação');
    expect(within(categoria(ficha, 'material')).getByRole('button', { name: 'Requalificar' })).toBeTruthy();
    expect(within(categoria(ficha, 'projeto')).getByRole('button', { name: 'Qualificar' })).toBeTruthy();
  });

  it('o histórico guarda a linha velha: as duas de material, a que vale marcada, com os motivos', () => {
    const material = categoria(abrirFicha(), 'material');
    expect(material.querySelector('summary')!.textContent).toBe('Histórico (2)');
    const itens = material.querySelectorAll('ol > li');
    expect(itens[0]!.textContent).toContain('07/05/2026 — nota 2, qualificada (a que vale)');
    expect(itens[0]!.textContent).toContain('Menor preço: não atende — mais caro');
    expect(itens[1]!.textContent).toContain('01/03/2025');
    expect(material.textContent).toContain('por Pessoa de teste');
  });

  it('o desempenho dos últimos 12 meses aparece na ficha', () => {
    expect(caixa('[data-ficha-da-empresa] [data-desempenho]')).toBeNull(); // a ficha ainda não abriu
    const ficha = abrirFicha();
    expect(ficha.querySelector('[data-desempenho]')!.textContent).toContain('4 entregas avaliadas — 3 no prazo');
  });

  it('quem só lê não vê Qualificar nem Requalificar', () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    const ficha = abrirFicha();
    expect(within(ficha).queryByRole('button', { name: /Qualificar|Requalificar/ })).toBeNull();
  });

  it('com as qualificações fora do ar, a ficha diz que não carregaram, e não oferece gravar', () => {
    useQualificacaoStore.getState().falhou('rede');
    const ficha = abrirFicha();
    expect(within(ficha).getByRole('alert').textContent).toContain('As qualificações não carregaram (rede)');
    expect(ficha.querySelector('[data-categoria]')).toBeNull();
  });
});

describe('D604 §3.1/§3.3 — qualificar e requalificar pela ficha', () => {
  function preencher(atendem: boolean[]) {
    const c = caixa('[data-dialogo-qualificar]')!;
    atendem.forEach((a, i) => {
      const k = c.querySelector<HTMLElement>(`[data-criterio="${i + 1}"]`)!;
      fireEvent.click(within(k).getByRole('radio', { name: a ? 'Atende' : 'Não atende' }));
      fireEvent.change(within(k).getByRole('textbox'), { target: { value: `motivo ${i + 1}` } });
    });
  }

  it('requalificar material: traz as ECRs que valem e o desempenho; grava para a EMPRESA, e a ficha recarrega', async () => {
    banco.qualificar = vi.fn(async () => ({
      qualificacaoId: 40, nota: 3, minimo: 2, qualificada: true, situacao: 'qualificada', venceEm: '2027-09-28',
    }));
    const ficha = abrirFicha();
    fireEvent.click(within(categoria(ficha, 'material')).getByRole('button', { name: 'Requalificar' }));
    const d = caixa('[data-dialogo-qualificar]')!;
    expect(d.textContent).toContain('Requalificar — Materiais');
    expect(d.querySelector('[data-desempenho]')!.textContent).toContain('4 entregas avaliadas');
    expect(within(d).getByRole('checkbox', { name: /ECR 12/ })).toBeChecked();
    expect(within(d).getByRole('checkbox', { name: /ECR 19/ })).not.toBeChecked();
    fireEvent.click(within(d).getByRole('checkbox', { name: /ECR 19/ }));
    preencher([true, true, true]);
    await act(async () => {
      fireEvent.click(within(d).getByRole('button', { name: 'Gravar qualificação' }));
    });
    expect(banco.qualificar).toHaveBeenCalledTimes(1);
    expect(banco.qualificar.mock.calls[0]![0]).toMatchObject({
      sujeito: { empresa_raiz_id: 'empresa-a' },
      categoria: 'material',
      ecrs: [12, 19],
    });
    expect(banco.recarregar).toHaveBeenCalledTimes(1);
    expect(caixa('[data-dialogo-qualificar]')).toBeNull();
    expect(avisos()).toContain('Materiais: Qualificada até 09/2027.');
  });

  it('qualificar projeto: sem ECR na caixa, e nenhuma ECR vai ao banco', async () => {
    banco.qualificar = vi.fn(async () => ({
      qualificacaoId: 41, nota: 1, minimo: 2, qualificada: false, situacao: 'desqualificada', venceEm: '2027-09-28',
    }));
    const ficha = abrirFicha();
    fireEvent.click(within(categoria(ficha, 'projeto')).getByRole('button', { name: 'Qualificar' }));
    const d = caixa('[data-dialogo-qualificar]')!;
    expect(within(d).queryByRole('checkbox')).toBeNull();
    preencher([true, false, false]);
    expect(d.textContent).toContain('Com esta nota, a empresa fica desqualificada.');
    await act(async () => {
      fireEvent.click(within(d).getByRole('button', { name: 'Gravar qualificação' }));
    });
    expect(banco.qualificar.mock.calls[0]![0]).toMatchObject({ categoria: 'projeto', ecrs: [] });
    expect(avisos()).toContain('Projetos: nota 1 (o mínimo é 2) — a empresa ficou desqualificada.');
  });

  it('o laboratório segue o PS.02: um critério basta (D606 2), e a nota ao vivo diz isso', () => {
    const ficha = abrirFicha();
    fireEvent.click(within(categoria(ficha, 'controle_tecnologico')).getByRole('button', { name: 'Qualificar' }));
    preencher([true, false, false]);
    expect(caixa('[data-dialogo-qualificar]')!.textContent).toContain('Nota 1 de 3 — o mínimo é 1. Qualificada até');
  });

  it('o fornecedor sem empresa cadastrada grava para ele mesmo', async () => {
    banco.qualificar = vi.fn(async () => ({
      qualificacaoId: 42, nota: 2, minimo: 2, qualificada: true, situacao: 'qualificada', venceEm: '2027-09-28',
    }));
    const ficha = abrirFicha('Prestador B (teste)');
    expect(ficha.textContent).toContain('a qualificação vale só para ele');
    fireEvent.click(within(categoria(ficha, 'servico')).getByRole('button', { name: 'Qualificar' }));
    preencher([true, true, false]);
    await act(async () => {
      fireEvent.click(within(caixa('[data-dialogo-qualificar]')!).getByRole('button', { name: 'Gravar qualificação' }));
    });
    expect(banco.qualificar.mock.calls[0]![0]).toMatchObject({ sujeito: { fornecedor_id: 'prestador-b' }, categoria: 'servico' });
  });
});
