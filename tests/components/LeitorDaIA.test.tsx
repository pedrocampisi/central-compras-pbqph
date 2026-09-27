import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

// As leituras são FALSAS aqui: o que se prova é a tela (CTO-D567). O leitor
// pedido chega no terceiro argumento — é ele que o teste confere.
type Leitura = { itens: unknown[]; confira: Record<string, string>; ignoradas: string[]; leitor: string | null };
const lerPedido = vi.fn<(arquivos: File[], deps: unknown, leitor: string) => Promise<Leitura>>();
const lerLista = vi.fn<(texto: string, enviar: unknown, leitor: string) => Promise<Leitura>>();
vi.mock('../../src/services/ai/lerPedido', async (original) => ({
  ...(await original<typeof import('../../src/services/ai/lerPedido')>()),
  lerPedido: (a: File[], d: unknown, l: string) => lerPedido(a, d, l),
  lerLista: (t: string, e: unknown, l: string) => lerLista(t, e, l),
}));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { ErroDaImportacao } from '../../src/services/ai/lerPedido';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useConfirmStore } from '../../src/stores/useConfirmStore';
import { normalizeItem } from '../../src/domain/normalize';
import type { Data, Item } from '../../src/domain/types';

const DADOS = {
  schema_version: 1, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
  config: {
    emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
    condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
    texto_qualidade: '', pasta_backups: '',
  },
  fornecedores: [], obras: [], ecrs: [], ordens_compra: [], prestadores_servico: [], avaliacoes_prestadores: [],
} as unknown as Data;

const png = () => new File(['png'], 'foto.png', { type: 'image/png' });

function colar(alvo: EventTarget, arquivos: File[]) {
  const e = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'clipboardData', { value: { files: arquivos, getData: () => '' } });
  act(() => {
    alvo.dispatchEvent(e);
  });
}

/** O rápido leu 2 itens (R$ 300,00 + R$ 50,00); o certeiro, 3. */
function leituraDoRapido(leitor: string | null = null): Leitura {
  return {
    itens: [
      normalizeItem({ descricao: 'Cimento CP-II 50kg', quantidade: 10, unidade: 'sc', preco_unit: 30 }),
      normalizeItem({ descricao: 'Areia média', quantidade: 1, unidade: 'm³', preco_unit: 50 }),
    ],
    confira: {},
    ignoradas: [],
    leitor,
  };
}
function leituraDoCerteiro(): Leitura {
  return {
    itens: [
      normalizeItem({ descricao: 'Cimento CP-II 50kg', quantidade: 10, unidade: 'sc', preco_unit: 32 }),
      normalizeItem({ descricao: 'Areia média', quantidade: 1, unidade: 'm³', preco_unit: 50 }),
      normalizeItem({ descricao: 'Brita 1', quantidade: 2, unidade: 'm³', preco_unit: 90 }),
    ],
    confira: {},
    ignoradas: [],
    leitor: 'certeiro',
  };
}

const descricoes = () => (useOcEditingStore.getState().ocEditing?.itens ?? []).map((i: Item) => i.descricao);
const campo = () => screen.getByRole('group', { name: 'Importar pedido pela IA' });
const resultadoNaTela = () => screen.getByRole('region', { name: 'Resultado da leitura' });

async function abrir() {
  render(<NovaOcPage />);
  await userEvent.click(screen.getByRole('button', { name: /Importar Pedido \(IA\)/ }));
}

describe('D567 — a escolha do leitor, antes de ler', () => {
  beforeEach(() => {
    lerPedido.mockReset();
    lerLista.mockReset();
    useOcEditingStore.getState().stopEditing();
    useDataStore.setState({ data: DADOS });
    useAuthStore.setState({ perfil: { papel: 'admin' } as never });
    useConfirmStore.setState({ open: false, resolve: null });
  });

  it('começa no Rápido; cada opção diz para quê; a dica fica à vista', async () => {
    await abrir();
    const grupo = screen.getByRole('radiogroup', { name: 'Qual leitor da IA lê o pedido?' });
    const rapido = within(grupo).getByRole('radio', { name: /Rápido/ });
    const certeiro = within(grupo).getByRole('radio', { name: /Certeiro/ });
    expect(rapido).toBeChecked();
    expect(certeiro).not.toBeChecked();
    expect(rapido.closest('label')).toHaveTextContent('Para o PDF do fornecedor e papel limpo.');
    expect(certeiro.closest('label')).toHaveTextContent('Para foto, papel escaneado e tabela cheia.');
    expect(certeiro.closest('label')).toHaveTextContent('Leva até 1 minuto.');
    expect(campo()).toHaveTextContent('Foto ou papel escaneado? Use o certeiro.');
  });

  it('o "?" abre a resposta na página; o Esc fecha a resposta e NÃO fecha o campo', async () => {
    await abrir();
    const q = screen.getByRole('button', { name: 'Ajuda: Os dois leitores' });
    await userEvent.click(q);
    expect(q).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('note')).toHaveTextContent('7 de 16');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('note')).toBeNull();
    expect(campo()).toBeInTheDocument();
  });

  it('um clique troca para o Certeiro, e a imagem vai com ele', async () => {
    lerPedido.mockResolvedValueOnce(leituraDoCerteiro());
    await abrir();
    await userEvent.click(screen.getByRole('radio', { name: /Certeiro/ }));
    const foto = png();
    colar(document.body, [foto]);
    await screen.findByDisplayValue('Brita 1');
    expect(lerPedido).toHaveBeenCalledWith([foto], undefined, 'certeiro');
  });

  it('a mesma escolha vale para a caixa de texto', async () => {
    lerLista.mockResolvedValueOnce(leituraDoCerteiro());
    await abrir();
    await userEvent.click(screen.getByRole('radio', { name: /Certeiro/ }));
    fireEvent.change(screen.getByLabelText(/cole aqui a lista de materiais/), { target: { value: '10 sc cimento' } });
    await userEvent.click(screen.getByRole('button', { name: /Organizar com IA \(certeiro\)/ }));
    await screen.findByDisplayValue('Brita 1');
    expect(lerLista).toHaveBeenCalledWith('10 sc cimento', undefined, 'certeiro');
  });

  it('a espera do certeiro diz que pode levar até 1 minuto', async () => {
    let terminar!: (r: Leitura) => void;
    lerPedido.mockReturnValueOnce(new Promise((r) => { terminar = r; }));
    await abrir();
    await userEvent.click(screen.getByRole('radio', { name: /Certeiro/ }));
    colar(document.body, [png()]);
    expect(await screen.findByText('Lendo o pedido com o certeiro…')).toBeInTheDocument();
    expect(campo()).toHaveTextContent('O certeiro pode levar até 1 minuto. A tela não travou');
    await act(async () => terminar(leituraDoCerteiro()));
  });
});

describe('D567 — o resultado: o total lido em destaque, e quem leu', () => {
  beforeEach(() => {
    lerPedido.mockReset();
    lerLista.mockReset();
    useOcEditingStore.getState().stopEditing();
    useDataStore.setState({ data: DADOS });
    useAuthStore.setState({ perfil: { papel: 'admin' } as never });
    useConfirmStore.setState({ open: false, resolve: null });
  });

  it('o rápido: total lido, "lido pelo rápido", o pedido de conferir e o botão do certeiro', async () => {
    lerPedido.mockResolvedValueOnce(leituraDoRapido());
    await abrir();
    colar(document.body, [png()]);
    await screen.findByDisplayValue('Areia média');
    const r = resultadoNaTela();
    expect(r).toHaveTextContent('Total lido');
    expect(r.querySelector('[data-total-lido]')).toHaveTextContent('R$ 350,00');
    expect(r).toHaveTextContent('Lido pelo rápido · 2 itens');
    expect(r).toHaveTextContent('Confira com a soma dos itens no papel');
    expect(within(r).getByRole('button', { name: /Ler de novo com o certeiro/ })).toBeInTheDocument();
    // Nenhum campo para digitar o total do papel: é passo novo, e o Pedro recusa.
    expect(within(r).queryByRole('textbox')).toBeNull();
    expect(within(r).queryByRole('spinbutton')).toBeNull();
  });

  it('o certeiro: "lido pelo certeiro", e sem o botão de ler de novo', async () => {
    lerPedido.mockResolvedValueOnce(leituraDoCerteiro());
    await abrir();
    await userEvent.click(screen.getByRole('radio', { name: /Certeiro/ }));
    colar(document.body, [png()]);
    await screen.findByDisplayValue('Brita 1');
    expect(resultadoNaTela()).toHaveTextContent('Lido pelo certeiro · 3 itens');
    expect(resultadoNaTela().querySelector('[data-total-lido]')).toHaveTextContent('R$ 550,00');
    expect(screen.queryByRole('button', { name: /Ler de novo com o certeiro/ })).toBeNull();
  });
});

describe('D567 — "Ler de novo com o certeiro": troca os itens, e pergunta se já foram mexidos', () => {
  beforeEach(() => {
    lerPedido.mockReset();
    lerLista.mockReset();
    useOcEditingStore.getState().stopEditing();
    useDataStore.setState({ data: DADOS });
    useAuthStore.setState({ perfil: { papel: 'admin' } as never });
    useConfirmStore.setState({ open: false, resolve: null });
  });

  async function lerComORapido() {
    lerPedido.mockResolvedValueOnce(leituraDoRapido());
    await abrir();
    const foto = png();
    colar(document.body, [foto]);
    await screen.findByDisplayValue('Areia média');
    return foto;
  }

  it('sem nada mexido: não pergunta; relê O MESMO pedido pelo certeiro e troca no lugar', async () => {
    const foto = await lerComORapido();
    // Um item posto à mão DEPOIS da leitura fica onde está.
    act(() => useOcEditingStore.getState().appendItems([normalizeItem({ descricao: 'Posto à mão' })]));
    lerPedido.mockResolvedValueOnce(leituraDoCerteiro());
    await userEvent.click(screen.getByRole('button', { name: /Ler de novo com o certeiro/ }));
    await screen.findByDisplayValue('Brita 1');
    expect(useConfirmStore.getState().open).toBe(false);
    expect(lerPedido).toHaveBeenLastCalledWith([foto], undefined, 'certeiro');
    expect(descricoes()).toEqual(['Cimento CP-II 50kg', 'Areia média', 'Brita 1', 'Posto à mão']);
    expect(resultadoNaTela()).toHaveTextContent('Lido pelo certeiro · 3 itens');
    expect(screen.getByRole('radio', { name: /Certeiro/ })).toBeChecked();
  });

  it('com item mexido: pergunta antes; "Manter os meus" não lê nada e não troca nada', async () => {
    await lerComORapido();
    fireEvent.change(screen.getByDisplayValue('Areia média'), { target: { value: 'Areia média lavada' } });
    await userEvent.click(screen.getByRole('button', { name: /Ler de novo com o certeiro/ }));
    await waitFor(() => expect(useConfirmStore.getState().open).toBe(true));
    const pedido = useConfirmStore.getState().options;
    expect(pedido.title).toBe('Trocar os itens desta leitura?');
    expect(pedido.message).toContain('Você já mexeu em 1 item desta leitura');
    expect(pedido.cancelLabel).toBe('Manter os meus');
    await act(async () => useConfirmStore.getState().settle(false));
    expect(lerPedido).toHaveBeenCalledTimes(1);
    expect(descricoes()).toEqual(['Cimento CP-II 50kg', 'Areia média lavada']);
  });

  it('com item mexido e "Trocar pelos do certeiro": troca', async () => {
    await lerComORapido();
    fireEvent.change(screen.getByDisplayValue('Areia média'), { target: { value: 'Areia média lavada' } });
    lerPedido.mockResolvedValueOnce(leituraDoCerteiro());
    await userEvent.click(screen.getByRole('button', { name: /Ler de novo com o certeiro/ }));
    await waitFor(() => expect(useConfirmStore.getState().open).toBe(true));
    await act(async () => useConfirmStore.getState().settle(true));
    await screen.findByDisplayValue('Brita 1');
    expect(descricoes()).toEqual(['Cimento CP-II 50kg', 'Areia média', 'Brita 1']);
  });

  it('se o certeiro falhar na troca, os itens do rápido ficam como estavam', async () => {
    await lerComORapido();
    lerPedido.mockRejectedValueOnce(Object.assign(new Error('A IA não conseguiu ler itens neste arquivo.'), { status: 422 }));
    await userEvent.click(screen.getByRole('button', { name: /Ler de novo com o certeiro/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('A IA não conseguiu ler itens');
    expect(descricoes()).toEqual(['Cimento CP-II 50kg', 'Areia média']);
  });
});

describe('D567 — o erro do rápido oferece o certeiro', () => {
  beforeEach(() => {
    lerPedido.mockReset();
    lerLista.mockReset();
    useOcEditingStore.getState().stopEditing();
    useDataStore.setState({ data: DADOS });
    useAuthStore.setState({ perfil: { papel: 'admin' } as never });
    useConfirmStore.setState({ open: false, resolve: null });
  });

  it('a resposta cortada (422): a mensagem oferece "Ler com o certeiro", que relê o mesmo pedido', async () => {
    const cortada = new ErroDaImportacao('A resposta da IA foi cortada antes do fim.');
    lerPedido.mockRejectedValueOnce(Object.assign(cortada, { status: 422 }));
    lerPedido.mockResolvedValueOnce(leituraDoCerteiro());
    await abrir();
    const foto = png();
    colar(document.body, [foto]);
    expect(await screen.findByRole('alert')).toHaveTextContent('A resposta da IA foi cortada antes do fim.');
    await userEvent.click(screen.getByRole('button', { name: /Ler com o certeiro/ }));
    await screen.findByDisplayValue('Brita 1');
    expect(lerPedido).toHaveBeenLastCalledWith([foto], undefined, 'certeiro');
  });

  it('nenhum item encontrado pelo rápido: também oferece', async () => {
    lerPedido.mockResolvedValueOnce({ itens: [], confira: {}, ignoradas: [], leitor: null });
    await abrir();
    colar(document.body, [png()]);
    expect(await screen.findByRole('alert')).toHaveTextContent('A IA não encontrou itens no arquivo');
    expect(screen.getByRole('button', { name: /Ler com o certeiro/ })).toBeInTheDocument();
  });

  it('erro que o certeiro não resolve (tipo errado, 400, sessão): não oferece', async () => {
    lerPedido.mockRejectedValueOnce(new ErroDaImportacao('"planilha.xlsx" não é PDF, JPG ou PNG. Nada foi lido.'));
    await abrir();
    colar(document.body, [png()]);
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: /Ler com o certeiro/ })).toBeNull();
  });

  it('o erro do PRÓPRIO certeiro não oferece o certeiro de novo', async () => {
    lerPedido.mockRejectedValueOnce(Object.assign(new Error('fora do ar'), { status: 502 }));
    await abrir();
    await userEvent.click(screen.getByRole('radio', { name: /Certeiro/ }));
    colar(document.body, [png()]);
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: /Ler com o certeiro/ })).toBeNull();
  });
});

describe('D567 — a trava: a leitura do rápido nunca aparece como se fosse do certeiro', () => {
  beforeEach(() => {
    lerPedido.mockReset();
    lerLista.mockReset();
    useOcEditingStore.getState().stopEditing();
    useDataStore.setState({ data: DADOS });
    useAuthStore.setState({ perfil: { papel: 'admin' } as never });
    useConfirmStore.setState({ open: false, resolve: null });
  });

  it('escolheu o certeiro e a resposta não diz "certeiro" (a v4): avisa, e NADA entra', async () => {
    lerPedido.mockResolvedValueOnce(leituraDoRapido(null));
    await abrir();
    await userEvent.click(screen.getByRole('radio', { name: /Certeiro/ }));
    colar(document.body, [png()]);
    expect(await screen.findByRole('alert')).toHaveTextContent('O leitor certeiro não está disponível agora');
    expect(descricoes()).toEqual([]);
    expect(screen.queryByRole('region', { name: 'Resultado da leitura' })).toBeNull();
  });

  it('a resposta que diz "rapido" ao pedido do certeiro, no texto: o mesmo aviso, e o texto fica', async () => {
    lerLista.mockResolvedValueOnce(leituraDoRapido('rapido'));
    await abrir();
    await userEvent.click(screen.getByRole('radio', { name: /Certeiro/ }));
    fireEvent.change(screen.getByLabelText(/cole aqui a lista de materiais/), { target: { value: '10 sc cimento' } });
    await userEvent.click(screen.getByRole('button', { name: /Organizar com IA/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('O leitor certeiro não está disponível agora');
    expect(descricoes()).toEqual([]);
    expect((screen.getByLabelText(/cole aqui a lista de materiais/) as HTMLTextAreaElement).value).toBe('10 sc cimento');
  });

  it('na troca: a resposta que não é do certeiro não troca nada', async () => {
    lerPedido.mockResolvedValueOnce(leituraDoRapido());
    await abrir();
    colar(document.body, [png()]);
    await screen.findByDisplayValue('Areia média');
    lerPedido.mockResolvedValueOnce({ ...leituraDoCerteiro(), leitor: null });
    await userEvent.click(screen.getByRole('button', { name: /Ler de novo com o certeiro/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('O leitor certeiro não está disponível agora');
    expect(descricoes()).toEqual(['Cimento CP-II 50kg', 'Areia média']);
  });
});
