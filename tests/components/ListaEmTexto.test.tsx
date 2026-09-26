import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

// As leituras são FALSAS aqui: o que se prova é a tela (CTO-D557).
const lerPedido = vi.fn<(arquivos: File[]) => Promise<unknown>>();
const lerLista = vi.fn<(texto: string) => Promise<unknown>>();
vi.mock('../../src/services/ai/lerPedido', async (original) => ({
  ...(await original<typeof import('../../src/services/ai/lerPedido')>()),
  lerPedido: (a: File[]) => lerPedido(a),
  lerLista: (t: string) => lerLista(t),
}));

import { CampoDeImportacao } from '../../src/features/ordens-compra/CampoDeImportacao';
import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { ErroDaImportacao } from '../../src/services/ai/lerPedido';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { normalizeItem } from '../../src/domain/normalize';
import type { Data } from '../../src/domain/types';

const png = () => new File(['png'], 'image.png', { type: 'image/png' });

/** Ctrl+V com o que está na área de transferência: arquivos e/ou texto. */
function colar(alvo: EventTarget, { arquivos = [] as File[], texto = '' } = {}) {
  const e = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'clipboardData', {
    value: { files: arquivos, getData: (t: string) => (t === 'text/plain' ? texto : '') },
  });
  act(() => {
    alvo.dispatchEvent(e);
  });
  return e;
}

const LISTA = 'bom dia pessoal\n10 sacos de cimento\nvergalhão\nareia média 3 m³';

describe('D557 — o campo: a caixa de texto e o Ctrl+V que decide pelo que veio', () => {
  const montar = (props: Partial<Parameters<typeof CampoDeImportacao>[0]> = {}) => {
    const onArquivos = vi.fn();
    const onTexto = vi.fn();
    const onOrganizar = vi.fn();
    const r = render(
      <CampoDeImportacao
        lendo={false}
        erro=""
        onArquivos={onArquivos}
        onFechar={() => {}}
        texto=""
        onTexto={onTexto}
        onOrganizar={onOrganizar}
        {...props}
      />,
    );
    return { onArquivos, onTexto, onOrganizar, caixa: screen.getByLabelText(/cole aqui a lista de materiais/), ...r };
  };

  it('imagem colada COM O CURSOR NA CAIXA de texto do campo: importa a imagem', () => {
    const { onArquivos, onTexto, caixa } = montar();
    const print = png();
    const e = colar(caixa, { arquivos: [print] });
    expect(onArquivos).toHaveBeenCalledWith([print]);
    expect(onTexto).not.toHaveBeenCalled();
    expect(e.defaultPrevented).toBe(true);
  });

  it('texto colado fora de campo de texto: vai para a caixa (no fim do que já está)', () => {
    const { onTexto, onArquivos } = montar({ texto: 'cal 5 sacos' });
    const e = colar(document.body, { texto: LISTA });
    expect(onTexto).toHaveBeenCalledWith(`cal 5 sacos\n${LISTA}`);
    expect(onArquivos).not.toHaveBeenCalled();
    expect(e.defaultPrevented).toBe(true);
  });

  it('texto colado DENTRO da caixa: o navegador cola onde está o cursor (o campo não mexe)', () => {
    const { onTexto, caixa } = montar();
    const e = colar(caixa, { texto: LISTA });
    expect(onTexto).not.toHaveBeenCalled();
    expect(e.defaultPrevented).toBe(false);
  });

  it('fora do campo, num campo de texto da OC (Descrição, Observações): colar não muda', () => {
    const { onTexto, onArquivos } = montar();
    const descricao = document.createElement('textarea');
    document.body.append(descricao);
    const e1 = colar(descricao, { texto: LISTA });
    const e2 = colar(descricao, { arquivos: [png()] });
    expect(onTexto).not.toHaveBeenCalled();
    expect(onArquivos).not.toHaveBeenCalled();
    expect(e1.defaultPrevented).toBe(false);
    expect(e2.defaultPrevented).toBe(false);
    descricao.remove();
  });

  it('planilha copiada (texto e a foto das células): vale o texto', () => {
    const { onTexto, onArquivos } = montar();
    colar(document.body, { arquivos: [png()], texto: 'Cimento\t10\tsc\r\nAreia\t3\tm3' });
    expect(onTexto).toHaveBeenCalledWith('Cimento\t10\tsc\r\nAreia\t3\tm3');
    expect(onArquivos).not.toHaveBeenCalled();
  });

  it('"Organizar com IA" fica cinza com a caixa vazia, e chama a leitura com texto', async () => {
    const { onOrganizar, unmount } = montar({ texto: '  \n ' });
    expect(screen.getByRole('button', { name: /Organizar com IA/ })).toBeDisabled();
    unmount();
    const m = montar({ texto: LISTA });
    await userEvent.click(within(m.container).getByRole('button', { name: /Organizar com IA/ }));
    expect(m.onOrganizar).toHaveBeenCalledTimes(1);
    expect(onOrganizar).not.toHaveBeenCalled();
  });

  it('as linhas ignoradas aparecem, como vieram', () => {
    montar({ ignoradas: ['bom dia pessoal', 'segue a lista'] });
    const bloco = screen.getByRole('status', { name: 'Linhas ignoradas' });
    expect(bloco).toHaveTextContent('2 linhas ficaram de fora');
    expect(within(bloco).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['bom dia pessoal', 'segue a lista']);
  });

  it('enquanto organiza: diz que está organizando, e colar texto não mexe na caixa', () => {
    const onTexto = vi.fn();
    render(
      <CampoDeImportacao lendo oQueLe="texto" erro="" onArquivos={() => {}} onFechar={() => {}} texto="x" onTexto={onTexto} />,
    );
    expect(screen.getByText('Organizando a lista…')).toBeInTheDocument();
    colar(document.body, { texto: 'mais uma linha' });
    expect(onTexto).not.toHaveBeenCalled();
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

const DUVIDA = 'a lista não diz a bitola';
function resultado() {
  const cimento = normalizeItem({ descricao: 'Cimento CP-II 50kg', quantidade: 10, unidade: 'sc' });
  const vergalhao = normalizeItem({ descricao: 'Vergalhão CA-50', quantidade: 0, unidade: 'un' });
  return { itens: [cimento, vergalhao], confira: { [vergalhao.id]: DUVIDA }, ignoradas: ['bom dia pessoal'] };
}

const caixaAgora = () => screen.getByLabelText(/cole aqui a lista de materiais/) as HTMLTextAreaElement;

async function abrirECarregar(texto: string) {
  render(<NovaOcPage />);
  await userEvent.click(screen.getByRole('button', { name: /Importar Pedido \(IA\)/ }));
  const caixa = screen.getByLabelText(/cole aqui a lista de materiais/) as HTMLTextAreaElement;
  fireEvent.change(caixa, { target: { value: texto } });
  return caixa;
}

describe('D557 — na Nova OC', () => {
  beforeEach(() => {
    lerPedido.mockReset();
    lerLista.mockReset();
    useOcEditingStore.getState().stopEditing();
    useDataStore.setState({ data: DADOS });
    useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  });

  it('organizar: os itens entram, a caixa esvazia, a linha duvidosa é marcada e as ignoradas ficam à vista', async () => {
    lerLista.mockResolvedValueOnce(resultado());
    await abrirECarregar(LISTA);
    await userEvent.click(screen.getByRole('button', { name: /Organizar com IA/ }));

    expect(lerLista).toHaveBeenCalledWith(LISTA);
    expect(await screen.findByDisplayValue('Cimento CP-II 50kg')).toBeInTheDocument();
    expect(caixaAgora().value).toBe('');
    const marca = document.querySelector('[data-confira]') as HTMLElement;
    expect(marca).toHaveAttribute('title', DUVIDA);
    expect(marca).toHaveTextContent(DUVIDA);
    expect(marca.closest('tr')).toContainElement(screen.getByDisplayValue('Vergalhão CA-50'));
    expect(screen.getByRole('status', { name: 'Linhas ignoradas' })).toHaveTextContent('bom dia pessoal');
  });

  it('o "confira" NÃO entra no item da OC — o que vai ao banco e ao PDF', async () => {
    lerLista.mockResolvedValueOnce(resultado());
    await abrirECarregar(LISTA);
    await userEvent.click(screen.getByRole('button', { name: /Organizar com IA/ }));
    await screen.findByDisplayValue('Vergalhão CA-50');
    const itens = useOcEditingStore.getState().ocEditing!.itens;
    expect(itens).toHaveLength(2);
    expect(JSON.stringify(itens)).not.toContain('bitola');
    for (const it of itens) expect(it).not.toHaveProperty('confira');
  });

  it('editar a linha tira a marca', async () => {
    lerLista.mockResolvedValueOnce(resultado());
    await abrirECarregar(LISTA);
    await userEvent.click(screen.getByRole('button', { name: /Organizar com IA/ }));
    const vergalhao = await screen.findByDisplayValue('Vergalhão CA-50');
    fireEvent.change(vergalhao, { target: { value: 'Vergalhão CA-50 10mm' } });
    expect(document.querySelector('[data-confira]')).toBeNull();
  });

  it('a leitura que falha NÃO apaga o texto, e o erro do servidor aparece como veio', async () => {
    lerLista.mockRejectedValueOnce(new ErroDaImportacao('A lista passa de 6000 caracteres. Mande em duas partes.'));
    await abrirECarregar(LISTA);
    await userEvent.click(screen.getByRole('button', { name: /Organizar com IA/ }));
    expect((await screen.findByRole('alert')).textContent).toBe('A lista passa de 6000 caracteres. Mande em duas partes.');
    expect(caixaAgora().value).toBe(LISTA);
    expect(useOcEditingStore.getState().ocEditing!.itens).toHaveLength(0);
  });

  it('nenhum item no texto também não apaga, e mostra as ignoradas', async () => {
    lerLista.mockResolvedValueOnce({ itens: [], confira: {}, ignoradas: ['bom dia pessoal'] });
    await abrirECarregar('bom dia pessoal');
    await userEvent.click(screen.getByRole('button', { name: /Organizar com IA/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('A IA não encontrou itens no texto.');
    expect(caixaAgora().value).toBe('bom dia pessoal');
    expect(screen.getByRole('status', { name: 'Linhas ignoradas' })).toHaveTextContent('bom dia pessoal');
  });

  it('o print colado com o cursor na caixa continua indo para a importação (as linhas da D554)', async () => {
    lerPedido.mockResolvedValueOnce({ itens: [normalizeItem({ descricao: 'Tinta acrílica' })], confira: {}, ignoradas: [] });
    const caixa = await abrirECarregar('');
    const print = png();
    colar(caixa, { arquivos: [print] });
    expect(lerPedido).toHaveBeenCalledWith([print]);
    expect(lerLista).not.toHaveBeenCalled();
    expect(await screen.findByDisplayValue('Tinta acrílica')).toBeInTheDocument();
  });
});
