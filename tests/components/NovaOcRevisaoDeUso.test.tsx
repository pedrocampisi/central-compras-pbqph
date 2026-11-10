import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';

/**
 * D1034h, o lote (b2): a revisão de uso da Nova OC, uma trava por item.
 * OC, obra e fornecedor são INVENTADOS, e a gravação é falsa.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const salvar = vi.fn(async (...a: unknown[]): Promise<never> => {
  void a;
  throw new Error('não grava');
});
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarOrdemCompra: (...a: unknown[]) => salvar(...a),
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { acoesDoMais } from './maisDaLinha';
import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { normalizeFornecedor, normalizeObra } from '../../src/domain/normalize';
import { fraseDoQueFalta, oQueFaltaParaEmitir } from '../../src/domain/faltaParaEmitir';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

const OBRA = normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' });
const FORNECEDOR = { ...normalizeFornecedor({ id: 'f1', razao_social: 'Fornecedor de teste' }), fornece_material: true, bloqueado_para_compra_nova: false };

beforeEach(() => {
  salvar.mockClear();
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  useDataStore.setState({
    data: {
      config: { emitentes: [], condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '' },
      fornecedores: [FORNECEDOR],
      obras: [OBRA],
      ecrs: [],
      ordens_compra: [],
    } as unknown as Data,
  });
  useAuthStore.setState({ perfil: { user_id: 'pessoa-a', nome: 'Pessoa (teste)', papel: 'admin', ativo: true } });
  useUiStore.setState({ toasts: [] });
  useOcEditingStore.getState().stopEditing();
});

const tsx = readFileSync('src/features/ordens-compra/NovaOcPage.tsx', 'utf-8');
const css = readFileSync('src/features/ordens-compra/NovaOcPage.module.css', 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
const candidatas = readFileSync('src/styles/candidatas.css', 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
const alto = () => document.querySelector<HTMLElement>('.section-header')!;
const pe = () => document.querySelector<HTMLElement>('[data-pe-da-oc]')!;

describe('D1034h — a revisão de uso da Nova OC', () => {
  it('item 1: no alto, só "Salvar rascunho" e o "Mais"; o "Emitir a OC" existe uma vez, no pé', () => {
    render(<NovaOcPage />);
    const botoes = within(alto()).getAllByRole('button').map((b) => b.textContent?.trim());
    expect(botoes).toEqual(['Salvar rascunho', '']); // o "Mais" é ícone, com nome para o leitor de tela
    expect(acoesDoMais(alto())).toEqual(['Tutorial', 'Visualizar o PDF', 'Cancelar']);
    const emitir = screen.getAllByRole('button', { name: /^Emitir/ });
    expect(emitir).toHaveLength(1);
    expect(pe()).toContainElement(emitir[0]!);
    expect(emitir[0]).toHaveTextContent('Emitir a OC');
  });

  it('item 2: o pé gruda embaixo (cc-pe-fixo), com o total geral e as duas ações', () => {
    render(<NovaOcPage />);
    expect(pe()).toHaveClass('cc-pe-fixo');
    expect(within(pe()).getByText('Total geral')).toBeInTheDocument();
    expect(within(pe()).getByRole('button', { name: /Salvar rascunho/ })).toBeInTheDocument();
    // O navegador mede o grudar por dentro da folga de 64 px do miolo: o desconto põe o pé no fundo.
    expect(candidatas).toMatch(/\.cc-pe-fixo\s*\{[^}]*position:\s*sticky;[^}]*bottom:\s*calc\(-1 \* var\(--espaco-8\)\)/);
    // No celular, logo acima da barra de baixo (medido nas fotos: o pé termina em 747 px, onde a barra começa).
    expect(candidatas).toMatch(/@media \(max-width: 960px\)\s*\{\s*\.cc-pe-fixo\s*\{[^}]*bottom:\s*calc\(1px - var\(--espaco-8\)\)/);
  });

  it('item 3: o "Emitir" fica ligado, diz o que falta e, no clique, leva o foco ao primeiro campo, sem aviso', async () => {
    render(<NovaOcPage />);
    const emitir = screen.getByRole('button', { name: /Emitir a OC/ });
    expect(emitir).toBeEnabled();
    const falta = document.querySelector('[data-o-que-falta]')!;
    expect(falta).toHaveTextContent('Falta o fornecedor, a obra e pelo menos 1 item');
    expect(emitir).toHaveAttribute('aria-describedby', falta.id);
    await act(async () => {
      fireEvent.click(emitir);
    });
    expect(useUiStore.getState().toasts).toEqual([]);
    expect(document.activeElement?.id).toBe('oc-fornecedor');
    expect(salvar).not.toHaveBeenCalled();
  });

  it('item 3: a frase, na ordem da tela', () => {
    const oc = { fornecedor_id: 'f1', obra_id: '', itens: [] };
    expect(oQueFaltaParaEmitir(oc)).toEqual(['obra', 'itens']);
    expect(fraseDoQueFalta(['obra', 'itens'])).toBe('Falta a obra e pelo menos 1 item');
    expect(fraseDoQueFalta(['fornecedor'])).toBe('Falta o fornecedor');
    expect(fraseDoQueFalta([])).toBe('');
  });

  it('item 4: na tela vazia há um "+ Adicionar item" só, dentro do vazio', () => {
    render(<NovaOcPage />);
    expect(screen.getAllByRole('button', { name: '+ Adicionar item' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '+ Adicionar item' }));
    // Com item, a fila de baixo aparece, e o vazio sai: continua um só.
    expect(screen.getAllByRole('button', { name: '+ Adicionar item' })).toHaveLength(1);
  });

  it('item 5: "Importar de um orçamento (IA)" é botão de contorno, ao lado do "+ Adicionar item"', () => {
    render(<NovaOcPage />);
    const ia = screen.getByRole('button', { name: /Importar de um orçamento \(IA\)/ });
    expect(ia.parentElement).toContainElement(screen.getByRole('button', { name: '+ Adicionar item' }));
    expect(ia.className).toMatch(/outline|contorno/);
  });

  it('item 6: as Observações saem da identificação e vêm depois dos Totais', () => {
    render(<NovaOcPage />);
    const obs = screen.getByLabelText('Observações');
    const totais = screen.getByText('Totais');
    expect(totais.compareDocumentPosition(obs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('item 7: a primeira OC emitida encerra a oferta do tutorial', () => {
    const depoisDeGravar = tsx.slice(tsx.indexOf('await recarregarDados();\n      // A primeira OC'));
    expect(depoisDeGravar.slice(0, 200)).toContain('marcarTutorialOferecido(idDaPessoa)');
  });

  it('item 8: o cartão dos Totais fica à direita e guarda só as parcelas', () => {
    render(<NovaOcPage />);
    expect(document.querySelector('[data-tutorial="totais"]')).not.toHaveTextContent(/total geral/i);
    expect(css).toMatch(/\.fechoDaOc\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(300px, 380px\)/);
    expect(css).toMatch(/\.cartaoDosTotais\s*\{[^}]*grid-column:\s*2/);
  });

  it('item 9: caixa de frase em tudo o que sobrou', () => {
    for (const velho of ['Salvar Rascunho', 'Adicionar Item', 'Importar Pedido (IA)"', 'Nova Ordem de Compra', 'TOTAL GERAL', 'Condição de Pagamento']) {
      expect(tsx).not.toContain(`${velho}`);
    }
  });
});
