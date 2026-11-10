import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';

/**
 * CTO-D1034f, o lote (a2): as peças novas da revisão de uso. O "Mais" (item 1),
 * a linha que abre a coisa (item 2), o "Filtros" do celular (item 5) e o aviso
 * de erro que fica até a pessoa fechar (item 10). Dados inventados.
 */

import { Mais } from '../../src/components/Mais/Mais';
import { DataTable } from '../../src/components/DataTable/DataTable';
import { ListToolbar, ToggleGroup } from '../../src/components/ListToolbar/ListToolbar';
import { ToastContainer } from '../../src/components/Toast/Toast';
import { useUiStore } from '../../src/stores/useUiStore';

describe('item 1 — o "Mais" (candidata cc-mais)', () => {
  function montar() {
    const escolhidas: string[] = [];
    render(
      <Mais
        rotulo="Mais ações da OC 2026/001"
        acoes={[
          { rotulo: 'Duplicar', aoEscolher: () => escolhidas.push('Duplicar') },
          false,
          { rotulo: 'Enviar', aoEscolher: () => escolhidas.push('Enviar'), desabilitada: true, titulo: 'mandando outra' },
          { rotulo: 'Cancelar', aoEscolher: () => escolhidas.push('Cancelar') },
        ]}
      />,
    );
    return { botao: screen.getByRole('button', { name: 'Mais ações da OC 2026/001' }), escolhidas };
  }

  it('o botão tem nome, diz que abre menu e se está aberto', () => {
    const { botao } = montar();
    expect(botao.getAttribute('aria-haspopup')).toBe('menu');
    expect(botao.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(botao);
    expect(botao.getAttribute('aria-expanded')).toBe('true');
    expect(botao.getAttribute('aria-controls')).toBe(screen.getByRole('menu').id);
  });

  it('abre com o foco na primeira ação; as setas pulam a desabilitada e dão a volta', () => {
    const { botao } = montar();
    fireEvent.click(botao);
    const menu = screen.getByRole('menu');
    expect(document.activeElement!.textContent).toBe('Duplicar');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement!.textContent).toBe('Cancelar');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement!.textContent).toBe('Duplicar');
    fireEvent.keyDown(menu, { key: 'End' });
    expect(document.activeElement!.textContent).toBe('Cancelar');
    fireEvent.keyDown(menu, { key: 'Home' });
    expect(document.activeElement!.textContent).toBe('Duplicar');
  });

  it('o Esc fecha e o foco volta ao botão; o clique fora fecha', () => {
    const { botao } = montar();
    fireEvent.click(botao);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(botao);
    fireEvent.click(botao);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('escolher roda a ação e fecha; a desabilitada não roda, e diz o porquê', () => {
    const { botao, escolhidas } = montar();
    fireEvent.click(botao);
    const enviar = within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Enviar' });
    expect(enviar).toHaveProperty('disabled', true);
    expect(enviar.getAttribute('title')).toBe('mandando outra');
    fireEvent.click(enviar);
    expect(escolhidas).toEqual([]);
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: 'Cancelar' }));
    expect(escolhidas).toEqual(['Cancelar']);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('sem ação nenhuma, não há botão', () => {
    render(<Mais acoes={[false, null]} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('item 2 — a linha que abre a coisa (candidata cc-linha-abre)', () => {
  const linhas = [{ id: 'a', nome: 'Obra A (teste)' }];
  function montar() {
    const abertas: string[] = [];
    const botao = vi.fn();
    render(
      <DataTable
        columns={[{ key: 'nome', label: 'Nome', cartao: 'titulo' }]}
        rows={linhas}
        rowKey={(r) => r.id}
        onRowClick={(r) => abertas.push(r.id)}
        rowLabel={(r) => `Abrir a obra ${r.nome}`}
        rowActions={() => (
          <button type="button" onClick={botao}>
            Outra coisa
          </button>
        )}
      />,
    );
    return { linha: screen.getByRole('row', { name: 'Abrir a obra Obra A (teste)' }), abertas, botao };
  }

  it('a linha recebe o foco, e o clique, o Enter e o Espaço abrem', () => {
    const { linha, abertas } = montar();
    expect(linha.getAttribute('tabindex')).toBe('0');
    expect(linha.classList.contains('cc-linha-abre')).toBe(true);
    fireEvent.click(linha);
    fireEvent.keyDown(linha, { key: 'Enter' });
    fireEvent.keyDown(linha, { key: ' ' });
    expect(abertas).toEqual(['a', 'a', 'a']);
  });

  it('o Enter e o clique num botão de dentro são do botão, e não abrem a linha', () => {
    const { linha, abertas, botao } = montar();
    const outro = within(linha).getByRole('button', { name: 'Outra coisa' });
    fireEvent.keyDown(outro, { key: 'Enter' });
    fireEvent.click(outro);
    expect(abertas).toEqual([]);
    expect(botao).toHaveBeenCalledTimes(1);
  });

  it('a tabela sem clique de linha não põe foco nem nome na linha', () => {
    render(<DataTable columns={[{ key: 'nome', label: 'Nome' }]} rows={linhas} rowKey={(r) => r.id} />);
    const tr = document.querySelector('tbody tr')!;
    expect(tr.getAttribute('tabindex')).toBeNull();
    expect(tr.getAttribute('aria-label')).toBeNull();
  });
});

describe('item 5 — o "Filtros" do celular', () => {
  it('com filtros, o botão diz quantos estão ligados e abre o grupo; sem filtros, nem aparece', () => {
    const { unmount } = render(
      <ListToolbar searchValue="" onSearchChange={() => {}} filtrosLigados={2}>
        <ToggleGroup titulo="Situação" options={['todos', 'ativos'] as const} value="ativos" onChange={() => {}} />
      </ListToolbar>,
    );
    const filtros = screen.getByRole('button', { name: /Filtros/ });
    expect(filtros.textContent).toContain('2');
    fireEvent.click(filtros);
    expect(filtros.getAttribute('aria-expanded')).toBe('true');
    unmount();
    render(<ListToolbar searchValue="" onSearchChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /Filtros/ })).toBeNull();
  });

  it('abaixo de 720 px o botão aparece e os filtros recolhem; no largo, os filtros ficam à vista', () => {
    const css = readFileSync('src/components/ListToolbar/ListToolbar.module.css', 'utf-8');
    expect(css).toMatch(/\.botaoFiltros\s*\{[^}]*display:\s*none/);
    const estreita = css.slice(css.indexOf('@media (max-width: 720px)'));
    expect(estreita).toMatch(/\.botaoFiltros\s*\{[^}]*display:/);
    expect(estreita).toMatch(/\.filtros\s*\{[^}]*display:\s*none/);
  });
});

describe('item 4 — a tabela vira cartões abaixo de 720 px (candidata cc-cartoes)', () => {
  it('a regra mora nas candidatas, sem rolagem de lado, e cada lugar do cartão tem a sua', () => {
    const css = readFileSync('src/styles/candidatas.css', 'utf-8');
    const bloco = css.slice(css.indexOf('@media (max-width: 720px)'));
    expect(bloco).toMatch(/\.cc-cartoes,\s*\.cc-cartoes tbody\s*\{[^}]*display:\s*block[^}]*min-width:\s*0 !important/);
    for (const lugar of ['titulo', 'selo', 'detalhe', 'fora', 'acoes']) {
      expect(bloco, lugar).toContain(`td[data-cartao='${lugar}']`);
    }
    // O detalhe leva o nome da coluna.
    expect(bloco).toMatch(/content:\s*attr\(data-rotulo\)/);
  });
});

describe('item 10 — o aviso de erro fica até a pessoa fechar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useUiStore.setState({ toasts: [] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('o de sucesso some sozinho; o de erro não, e fecha no X', () => {
    render(<ToastContainer />);
    act(() => {
      useUiStore.getState().showToast('Gravado (teste).', 'success');
      useUiStore.getState().showToast('O banco recusou (teste).', 'error');
    });
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    const ficou = screen.getAllByRole('alert');
    expect(ficou.map((t) => t.textContent)).toEqual(['O banco recusou (teste).']);
    fireEvent.click(within(ficou[0]!).getByRole('button', { name: 'Fechar o aviso' }));
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });
});

describe('item 2 — em Obras, a linha abre a ficha e o "Ver / Pasta" saiu', () => {
  it('a tabela tem o clique e o nome da linha, e não tem o botão que repetia o clique', () => {
    const tsx = readFileSync('src/features/obras/ObrasPage.tsx', 'utf-8');
    expect(tsx).toContain('onRowClick={openEdit}');
    expect(tsx).toContain('rowLabel={(o) => `Abrir a obra ${o.nome}`}');
    expect(tsx).not.toContain('Ver / Pasta</Button>');
  });
});
