import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

/**
 * CTO-D680: a busca pelo que bate melhor nas telas que têm caixa de busca
 * própria — Histórico, Obras e Catálogo de ECR. (A escolha de fornecedor e de
 * obra, a tela de Fornecedores e a Qualificação têm os testes delas.) Nomes,
 * números e obras INVENTADOS; nada fala com o banco.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));
vi.mock('../../src/services/supabase/ecrs', () => ({ podeRevisarEcr: async () => false, revisarEcr: vi.fn() }));
vi.mock('../../src/services/pdf/generateEcrPdf', () => ({ baixarPdfDaEcr: vi.fn(async () => {}) }));

import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { ObrasPage } from '../../src/features/obras/ObrasPage';
import { CatalogoPage } from '../../src/features/catalogo-ecr/CatalogoPage';
import { normalizeEcr, normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, Fornecedor } from '../../src/domain/types';

const filial = (id: string, razao: string, apelido: string): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: razao }),
  fornece_material: true,
  bloqueado_para_compra_nova: false,
  empresa_id: `e-${id}`,
  empresa_apelido: apelido,
});
const ABR = filial('abr', 'ABR GESSO E COMERCIO DE ACABAMENTOS LTDA (teste)', 'ABR Gesso (teste)');
const COMARCO = filial('com', 'COMARCO COMERCIAL E INDUSTRIA LTDA (teste)', 'Comarco (teste)');

const oc = (id: string, numero: string, fornecedor: string, criado: string, status: 'emitida' | 'cancelada' = 'emitida') =>
  normalizeOC({
    id, numero, status, fornecedor_id: fornecedor, obra_id: 'ob1', data: criado.slice(0, 10), criado_em: criado,
    itens: [normalizeItem({ descricao: 'Item (teste)', quantidade: 1, unidade: 'un', preco_unit: 1 })],
  });

const obra = (id: string, nome: string, ativa = true) => ({ ...normalizeObra({ id, nome }), ativa });

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: [], texto_condicoes_contratacao: '', texto_envio_nf: '', texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [ABR, COMARCO],
    // A ordem que já vinha: as obras como o banco mandou.
    obras: [obra('ob1', 'Galpão Rezende (teste)'), obra('ob2', 'Residencial Centro (teste)', false), obra('ob3', 'Reforma da Escola (teste)')],
    ecrs: [
      normalizeEcr({ id: 1, codigo: 'ECR 01', nome: 'Argamassa colante (teste)', categoria: 'Cimento e argamassa' }),
      normalizeEcr({ id: 2, codigo: 'ECR 02', nome: 'Cimento CP-II (teste)', categoria: 'Aglomerante' }),
    ],
    // A mais nova primeiro: a da ABR é de ontem; a da Comarco, de antes; a cancelada, de hoje.
    ordens_compra: [
      oc('oc-com', '2026/009', 'com', '2026-10-01T10:00:00Z'),
      oc('oc-abr', '2026/010', 'abr', '2026-10-03T10:00:00Z'),
      oc('oc-can', '2026/011', 'com', '2026-10-04T10:00:00Z', 'cancelada'),
    ],
  } as unknown as Data;
}

const textosDasLinhas = () => [...document.querySelectorAll('tbody tr')].map((tr) => tr.textContent ?? '');

beforeEach(() => {
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({
    toasts: [],
    histFilter: { search: '', status: '', fornecedor: '', obra: '' },
    obraFilter: { search: '', status: 'todas' },
    catalogoFilter: { search: '' },
  });
});

describe('CTO-D680 — o Histórico', () => {
  it('"co": as OCs da Comarco no alto, a cancelada desce, e a da ABR Gesso (que casa só por uma palavra da razão social) por último', () => {
    render(<HistoricoPage />);
    const numeros = () => textosDasLinhas().map((t) => t.match(/2026\/0\d\d/)?.[0]);
    expect(numeros()).toEqual(['2026/011', '2026/010', '2026/009']);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar por número, fornecedor…' }), { target: { value: 'co' } });
    expect(numeros()).toEqual(['2026/009', '2026/011', '2026/010']);
  });
});

describe('CTO-D680 — Obras', () => {
  it('"re": a que começa por "re" no alto, a encerrada desce, e a que só tem uma palavra começando por "re" depois', () => {
    render(<ObrasPage />);
    const nomes = () => [...document.querySelectorAll('tbody tr strong')].map((s) => s.textContent);
    expect(nomes()).toEqual(['Galpão Rezende (teste)', 'Residencial Centro (teste)', 'Reforma da Escola (teste)']);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 're' } });
    expect(nomes()).toEqual(['Reforma da Escola (teste)', 'Residencial Centro (teste)', 'Galpão Rezende (teste)']);
  });
});

describe('CTO-D680 — o Catálogo de ECR', () => {
  it('"cimento": a ECR que se chama Cimento no alto; a que casa só pela categoria, depois', () => {
    render(<CatalogoPage />);
    const codigos = () => screen.getAllByText(/^ECR 0\d$/).map((e) => e.textContent);
    expect(codigos()).toEqual(['ECR 01', 'ECR 02']);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar ECR…' }), { target: { value: 'cimento' } });
    expect(codigos()).toEqual(['ECR 02', 'ECR 01']);
  });
});
