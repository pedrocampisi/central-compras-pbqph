import { act, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * D1034k: a triagem do laudo da pintura (Codex, 10/11/2026, commit fdc1b86).
 * Uma medida por achado: cada teste aqui FALHOU no fdc1b86 antes do conserto.
 * Empresas, OCs e textos são INVENTADOS; banco falso.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), getSession: async () => ({ data: { session: null } }) } },
  core: () => ({ rpc: async () => ({ data: false, error: null }) }),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => ({ access_token: 'falso', user: { id: 'prova', email: 'prova@exemplo.invalid' } }),
  perfilAtual: async () => ({ user_id: 'prova', nome: 'Pessoa de Prova', papel: 'admin', ativo: true }),
  sair: async () => {},
}));
vi.mock('../../src/services/supabase/ecrs', () => ({ podeRevisarEcr: async () => false }));
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  assinarMudancas: () => () => {},
  carregarDados: async () => ({
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [], obras: [], ecrs: [], ordens_compra: [],
  }),
}));

import App from '../../src/App';
import { Drawer } from '../../src/components/Drawer/Drawer';
import { ConfirmDialog } from '../../src/components/ConfirmDialog/ConfirmDialog';
import { Mais } from '../../src/components/Mais/Mais';
import { ToastContainer } from '../../src/components/Toast/Toast';
import { DashboardPage } from '../../src/features/dashboard/DashboardPage';
import { normalizeFornecedor, normalizeItem, normalizeOC } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useQualificacaoStore } from '../../src/stores/useQualificacaoStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, Fornecedor } from '../../src/domain/types';

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

async function abrirApp() {
  useUiStore.setState({ activeTab: 'dashboard', toasts: [] });
  render(<App />);
  await screen.findByText('Nenhuma OC ainda');
}

describe('Achado 1 — o teclado não sai da ficha nem da janela aberta', () => {
  it('com a ficha aberta, o "/" não leva o foco à busca de trás', async () => {
    await abrirApp();
    await act(async () => useUiStore.getState().setActiveTab('fornecedores'));
    expect(document.querySelector('main .cc-busca input')).not.toBeNull();
    render(
      <Drawer open title="Ficha (teste)" onClose={() => {}}>
        <p>Conteúdo</p>
      </Drawer>,
    );
    const fechar = screen.getByRole('button', { name: 'Fechar' });
    fechar.focus();
    fireEvent.keyDown(fechar, { key: '/' });
    expect(document.activeElement).toBe(fechar);
  });

  it('o Tab dá a volta dentro da gaveta, e não sai para a página', async () => {
    render(
      <>
        <button type="button">Atrás (teste)</button>
        <Drawer open title="Ficha (teste)" onClose={() => {}}>
          <button type="button">Dentro (teste)</button>
        </Drawer>
      </>,
    );
    screen.getByRole('button', { name: 'Dentro (teste)' }).focus();
    await userEvent.tab();
    expect(document.querySelector('.cc-gaveta')!.contains(document.activeElement)).toBe(true);
    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    expect(document.querySelector('.cc-gaveta')!.contains(document.activeElement)).toBe(true);
  });

  it('o Tab dá a volta dentro da janela de confirmação, e o Esc devolve o foco a quem abriu', async () => {
    function Prova() {
      const [aberta, setAberta] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setAberta(true)}>Abrir (teste)</button>
          <ConfirmDialog open={aberta} title="Certeza?" message="Teste" onConfirm={() => setAberta(false)} onCancel={() => setAberta(false)} />
        </>
      );
    }
    render(<Prova />);
    const abrir = screen.getByRole('button', { name: 'Abrir (teste)' });
    abrir.focus();
    await userEvent.click(abrir);
    const janela = screen.getByRole('dialog');
    screen.getByRole('button', { name: 'Confirmar' }).focus();
    await userEvent.tab();
    expect(janela.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(abrir);
  });

  it('toda janela modal da casa prende o foco: a gaveta, a confirmação e as outras usam a mesma peça', () => {
    const arquivos = (pasta: string): string[] =>
      readdirSync(pasta).flatMap((n) => {
        const c = join(pasta, n);
        return statSync(c).isDirectory() ? arquivos(c) : /\.tsx$/.test(n) ? [c] : [];
      });
    const soltas = arquivos('src').filter((f) => {
      const t = readFileSync(f, 'utf-8');
      // o atributo no JSX (aria-modal solto, sem ="false"); o seletor numa string não conta
      return /\saria-modal(?=[\s>])/.test(t) && !t.includes('useFocoPreso');
    });
    expect(soltas).toEqual([]);
  });
});

describe('Achado 2 — o "Mais" não corta as primeiras ações quando não cabe', () => {
  it('em 667 × 350, com o botão a 110 px do topo e uma lista de 230 px, o topo da lista fica dentro da tela', async () => {
    const alturaAntes = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 350 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 667 });
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains('cc-mais-botao')) return { top: 110, bottom: 146, left: 600, right: 636, width: 36, height: 36, x: 600, y: 110, toJSON() {} } as DOMRect;
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON() {} } as DOMRect;
    });
    const altura = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('cc-mais-lista') ? 230 : 0;
    });
    try {
      render(<Mais rotulo="Mais ações (teste)" acoes={['Duplicar', 'PDF', 'Anexar', 'Enviar', 'Cancelar'].map((r) => ({ rotulo: r, aoEscolher() {} }))} />);
      fireEvent.click(screen.getByRole('button', { name: 'Mais ações (teste)' }));
      const lista = screen.getByRole('menu');
      const s = lista.style;
      const max = s.maxHeight ? parseFloat(s.maxHeight) : 230;
      const visivel = Math.min(230, max);
      const topo = s.top ? parseFloat(s.top) : 350 - parseFloat(s.bottom) - visivel;
      expect(topo).toBeGreaterThanOrEqual(8);
      expect(topo + visivel).toBeLessThanOrEqual(350 - 8);
    } finally {
      rect.mockRestore();
      altura.mockRestore();
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: alturaAntes });
    }
  });
});

describe('Achado 3 — o menu do celular não fica armado ao alargar a janela', () => {
  it('aberto a 959 px e alargado para 1.100, o véu sai e a tela de trabalho volta a responder', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 959 });
    await abrirApp();
    fireEvent.click(screen.getByRole('button', { name: 'Mais: abrir o menu' }));
    expect(document.querySelector('.cp-veu.aberto')).not.toBeNull();
    await act(async () => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1100 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(document.querySelector('.cp-veu.aberto')).toBeNull();
    expect(document.querySelector('[inert]')).toBeNull();
  });
});
