import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

// A leitura é FALSA na tela: o que se prova aqui é por onde o arquivo entra.
// Que tipo errado e página demais não saem do navegador está em lerPedido.test.
const lerPedido = vi.fn<(arquivos: File[]) => Promise<unknown[]>>(async () => []);
vi.mock('../../src/services/ai/lerPedido', async (original) => ({
  ...(await original<typeof import('../../src/services/ai/lerPedido')>()),
  lerPedido: (arquivos: File[]) => lerPedido(arquivos),
}));

import { CampoDeImportacao } from '../../src/features/ordens-compra/CampoDeImportacao';
import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import type { Data } from '../../src/domain/types';

const png = (nome = 'image.png') => new File(['png'], nome, { type: 'image/png' });

/** Ctrl+V: o evento de colar com arquivos na área de transferência. */
function colar(alvo: EventTarget, arquivos: File[]) {
  const e = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'clipboardData', { value: { files: arquivos } });
  act(() => {
    alvo.dispatchEvent(e);
  });
  return e;
}

let clique: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  lerPedido.mockReset();
  lerPedido.mockResolvedValue([]);
  clique = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
});
afterEach(() => clique.mockRestore());

describe('D554 — o campo: arrastar, colar, escolher', () => {
  const montar = (lendo = false) => {
    const onArquivos = vi.fn();
    const onFechar = vi.fn();
    render(<CampoDeImportacao lendo={lendo} erro="" onArquivos={onArquivos} onFechar={onFechar} />);
    return { onArquivos, onFechar };
  };

  it('Ctrl+V com o cursor fora de campo de texto: o print vai para a importação', () => {
    const { onArquivos } = montar();
    const print = png();
    const e = colar(document.body, [print]);
    expect(onArquivos).toHaveBeenCalledWith([print]);
    expect(e.defaultPrevented).toBe(true);
  });

  it('Ctrl+V dentro de um campo de texto NÃO vai para a importação', () => {
    const { onArquivos } = montar();
    const descricao = document.createElement('textarea');
    const quantidade = document.createElement('input');
    document.body.append(descricao, quantidade);
    const e = colar(descricao, [png()]);
    colar(quantidade, [png()]);
    expect(onArquivos).not.toHaveBeenCalled();
    expect(e.defaultPrevented).toBe(false);
    descricao.remove();
    quantidade.remove();
  });

  it('colar só texto não faz nada', () => {
    const { onArquivos } = montar();
    colar(document.body, []);
    expect(onArquivos).not.toHaveBeenCalled();
  });

  it('arrastar e soltar: os arquivos entram todos juntos', () => {
    const { onArquivos } = montar();
    const a = png('p1.png');
    const b = new File(['%PDF'], 'pedido.pdf', { type: 'application/pdf' });
    fireEvent.drop(screen.getByRole('group', { name: 'Importar pedido pela IA' }), {
      dataTransfer: { files: [a, b], types: ['Files'] },
    });
    expect(onArquivos).toHaveBeenCalledWith([a, b]);
  });

  it('"Escolher arquivo" abre a pasta, com vários arquivos e só os três tipos', async () => {
    const { container } = render(<CampoDeImportacao lendo={false} erro="" onArquivos={() => {}} onFechar={() => {}} />);
    await userEvent.click(within(container).getByRole('button', { name: 'Escolher arquivo' }));
    expect(clique).toHaveBeenCalledTimes(1);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(true);
    expect(input.accept).toBe('.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png');
  });

  it('fecha pelo X e pelo Esc, sem ler nada', async () => {
    const { onArquivos, onFechar } = montar();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar a importação' }));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onFechar).toHaveBeenCalledTimes(2);
    expect(onArquivos).not.toHaveBeenCalled();
  });

  it('enquanto lê: mostra que está lendo, e colar, soltar e fechar ficam bloqueados', () => {
    const { onArquivos, onFechar } = montar(true);
    expect(screen.getByText('Lendo o pedido…')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Escolher arquivo' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Fechar a importação' })).toBeDisabled();
    colar(document.body, [png()]);
    fireEvent.drop(screen.getByRole('group', { name: 'Importar pedido pela IA' }), {
      dataTransfer: { files: [png()], types: ['Files'] },
    });
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onArquivos).not.toHaveBeenCalled();
    expect(onFechar).not.toHaveBeenCalled();
  });

  it('o computador fala de arrastar e colar; o celular, só de escolher', () => {
    montar();
    expect(screen.getByText('Arraste o pedido para cá ou cole com Ctrl+V')).toBeInTheDocument();
    expect(screen.getByText('Escolha o PDF ou as fotos do pedido')).toBeInTheDocument();
  });
});

// ── A página ────────────────────────────────────────────────────────────────

const DADOS = {
  schema_version: 1, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
  config: {
    emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
    condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
    texto_qualidade: '', pasta_backups: '',
  },
  fornecedores: [], obras: [], ecrs: [], ordens_compra: [], prestadores_servico: [], avaliacoes_prestadores: [],
} as unknown as Data;

describe('D554 — o botão "Importar Pedido (IA)" abre o campo, e não a pasta', () => {
  beforeEach(() => {
    useOcEditingStore.getState().stopEditing();
    useDataStore.setState({ data: DADOS });
    useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  });

  it('clicar no botão: o campo aparece no lugar do vazio, e o input de arquivo NÃO é clicado', async () => {
    render(<NovaOcPage />);
    expect(screen.getByText('Nenhum item adicionado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Importar Pedido \(IA\)/ }));
    expect(clique).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Importar pedido pela IA' })).toBeInTheDocument();
    expect(screen.queryByText('Nenhum item adicionado')).toBeNull();
  });

  it('a Nova OC não tem mais input de arquivo próprio, nem clique programado', () => {
    const fonte = readFileSync('src/features/ordens-compra/NovaOcPage.tsx', 'utf-8');
    expect(fonte).not.toMatch(/type="file"/);
    expect(fonte).not.toMatch(/\.click\(\)/);
    expect(fonte).not.toContain('fileInputRef');
  });

  it('com o campo fechado, o Ctrl+V da página não importa nada', () => {
    render(<NovaOcPage />);
    colar(document.body, [png()]);
    expect(lerPedido).not.toHaveBeenCalled();
  });

  it('com o campo aberto: colar lê; os itens entram, o campo fecha, e Esc não reabre nada', async () => {
    lerPedido.mockResolvedValueOnce([
      { id: 'i1', descricao: 'Cimento CP-II', observacao: '', quantidade: 10, unidade: 'sc', preco_unit: 30, ipi_pct: 0, desc_pct: 0, ecr_id: null },
    ]);
    render(<NovaOcPage />);
    await userEvent.click(screen.getByRole('button', { name: /Importar Pedido \(IA\)/ }));
    const print = png();
    colar(document.body, [print]);
    expect(lerPedido).toHaveBeenCalledWith([print]);
    expect(await screen.findByDisplayValue('Cimento CP-II')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Importar pedido pela IA' })).toBeNull();
  });

  it('o erro da leitura fica escrito no campo, que continua aberto', async () => {
    const { ErroDaImportacao } = await import('../../src/services/ai/lerPedido');
    lerPedido.mockRejectedValueOnce(new ErroDaImportacao('Chegaram 6 páginas, e o limite de uma leitura é 5.'));
    render(<NovaOcPage />);
    await userEvent.click(screen.getByRole('button', { name: /Importar Pedido \(IA\)/ }));
    colar(document.body, [png()]);
    expect(await screen.findByRole('alert')).toHaveTextContent('Chegaram 6 páginas');
    expect(screen.getByRole('group', { name: 'Importar pedido pela IA' })).toBeInTheDocument();
  });
});
