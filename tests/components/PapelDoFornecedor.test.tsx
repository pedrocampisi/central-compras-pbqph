import { describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MaterialAChegar, type MaterialAChegarProps } from '../../src/features/recebimento/MaterialAChegar';
import { CHAVES } from '../../src/features/recebimento/fila';
import type { CartaoAChegar } from '../../src/domain/recebimento';
import type { LeituraDoRegistro, RegistroPedido } from '../../src/domain/registroDoFornecedor';
import { guardaNaMemoria } from '../../src/services/guardaDoAparelho';

/**
 * CTO-D811 §3, D812 §2 e D840 §2: o papel do fornecedor no carimbo do
 * encarregado, por COMPORTAMENTO. Ninguém pergunta o papel na entrega: o
 * "Anexar papel do fornecedor" é opcional, para o papel que viaja com o
 * caminhão. O banco é FALSO: o cartão já traz o `pede` e a marca dele, e a
 * leitura do papel é deste teste. Pedido, empresa, obra e o texto das ECRs são
 * INVENTADOS.
 */

const OBRA = { id: 'obra-1', nome: 'Obra de Teste' };
const TITULO = 'Papel do fornecedor para Cimento de teste';
const ANEXAR = 'Anexar papel do fornecedor';

const PEDE_19: RegistroPedido = {
  ecrId: 19, pede: true, aCadaEntrega: false, porque: 'nada guardado ainda', revisao: '00', posicoes: [1],
  linhas: [
    { rotulo: null, texto: 'FISPQ do produto (teste)', numerado: true },
    { rotulo: null, texto: 'Certificado conforme a norma (teste)', numerado: true },
  ],
};

const CARTAO: CartaoAChegar = {
  ocId: 'oc-1',
  intervencaoId: OBRA.id,
  obra: OBRA.nome,
  numero: '2026/101',
  fornecedor: 'Fornecedor de Teste',
  combinadoPara: '2026-10-05',
  total: 1540,
  itens: [
    { posicao: 1, descricao: 'Cimento de teste', quantidade: 40, unidade: 'sc' },
    { posicao: 2, descricao: 'Brita de teste', quantidade: 2, unidade: 'm3' },
  ],
  registros: [
    PEDE_19,
    // O banco disse que não pede (já guardado, ou "Não aplicável"): a tela não oferece.
    {
      ecrId: 6, pede: false, aCadaEntrega: false, porque: 'a licença vale até 30/06/2027', revisao: '00', posicoes: [2],
      linhas: [{ rotulo: null, texto: 'Licença (teste)', numerado: true }],
    },
  ],
};

/** A ECR com a marca "a cada entrega" (como a 02, da madeira): só o papel deste lote a cobre. */
const COM_A_MARCA: CartaoAChegar = { ...CARTAO, registros: [{ ...PEDE_19, ecrId: 2, aCadaEntrega: true, porque: 'a cada entrega' }] };

function montar(extra: Partial<MaterialAChegarProps> = {}) {
  const props: MaterialAChegarProps = {
    obras: [OBRA],
    hoje: '2026-10-05',
    cartoes: [CARTAO],
    lerNumeroDaNota: vi.fn(async () => ''),
    lerRegistro: vi.fn(async (): Promise<LeituraDoRegistro | null> => null),
    aoReceber: vi.fn(async () => undefined),
    aoRegistrarSemPedido: vi.fn(async () => undefined),
    guarda: guardaNaMemoria(true),
    ...extra,
  };
  render(<MaterialAChegar {...props} />);
  return props;
}

const responder = (pergunta: string, resposta: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: pergunta })).getByRole('button', { name: resposta }));
const papel = () => screen.getByRole('group', { name: TITULO });
const pronto = () => fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
const aviso = () => screen.getByRole('alert').textContent;
const FOTO = new File(['p'], 'papel.jpg', { type: 'image/jpeg' });
URL.createObjectURL = vi.fn(() => 'blob:teste');
URL.revokeObjectURL = vi.fn();

/** Abre o pedido, responde as quatro com "Sim" e escreve o número da nota. */
async function chegarAoPapel() {
  await waitFor(() => expect(screen.getAllByRole('button', { expanded: false }).length).toBeGreaterThan(0));
  fireEvent.click(screen.getAllByRole('button', { expanded: false })[0]!);
  fireEvent.click(screen.getByRole('button', { name: 'Receber' }));
  await screen.findByRole('group', { name: 'Veio a quantidade toda?' });
  for (const p of ['Chegou no dia combinado?', 'Chegou sem estrago?', 'Veio o material certo?', 'Veio a quantidade toda?']) {
    responder(p, 'Sim');
  }
  fireEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '4567' } });
}

const escolherFoto = (f: File) => fireEvent.change(papel().querySelector('input[type=file]')!, { target: { files: [f] } });

/** Toca em "Anexar papel do fornecedor", tira a foto e espera a leitura. */
async function anexarOPapel(f = FOTO) {
  expect(within(papel()).getByText(ANEXAR)).toBeTruthy();
  escolherFoto(f);
  await waitFor(() => expect(within(papel()).queryByText('Lendo o papel…')).toBeNull());
}

const registrosEnviados = (p: MaterialAChegarProps) =>
  (p.aoReceber as ReturnType<typeof vi.fn>).mock.calls[0]![0].registros as Record<string, unknown>[];

describe('o papel do fornecedor no carimbo (D811 §3, D840 §2)', () => {
  it('oferece só onde o banco diz que pede, e mostra o que a ECR pede com as palavras dela', async () => {
    montar();
    await chegarAoPapel();
    const g = papel();
    expect(within(g).getByText('FISPQ do produto (teste)')).toBeTruthy();
    expect(within(g).getByText('Certificado conforme a norma (teste)')).toBeTruthy();
    expect(screen.queryByText(/Papel do fornecedor para Brita de teste/)).toBeNull();
    expect(screen.queryByText('Licença (teste)')).toBeNull();
  });

  it('ninguém pergunta o papel: sem "Veio", "Não veio" nem "Não se aplica" (o item 27 morre)', async () => {
    montar();
    await chegarAoPapel();
    for (const b of ['Veio', 'Não veio', 'Não se aplica a esta entrega']) {
      expect(within(papel()).queryByRole('button', { name: b })).toBeNull();
    }
    expect(within(papel()).queryByRole('textbox')).toBeNull();
    expect(within(papel()).getByText(/Se não veio, não precisa fazer nada: o escritório cuida\./)).toBeTruthy();
  });

  it('a moldura fala como o canteiro: sem "ECR", sem "conforme" fora da lista da ECR', async () => {
    montar();
    await chegarAoPapel();
    const g = papel().cloneNode(true) as HTMLElement;
    g.querySelector('[data-palavras-da-ecr]')!.remove();
    expect(g.textContent).not.toMatch(/ecr|conforme|tratativa/i);
  });

  it('as linhas saem como na ECR: a numerada na lista, com o rótulo, e a sem número como nota (D813 §3)', async () => {
    const registros = [{
      ...PEDE_19,
      linhas: [
        { rotulo: 'GCA', texto: 'a guia de cada transporte (teste)', numerado: true },
        { rotulo: null, texto: 'O documento fiscal (teste)', numerado: true },
        { rotulo: 'Atenção', texto: 'exceto compensado (teste)', numerado: false },
      ],
    }];
    montar({ cartoes: [{ ...CARTAO, registros }] });
    await chegarAoPapel();
    const itens = within(papel()).getAllByRole('listitem').map((li) => li.textContent);
    expect(itens).toEqual(['GCA: a guia de cada transporte (teste)', 'O documento fiscal (teste)']);
    const nota = within(papel()).getByText('Atenção: exceto compensado (teste)');
    expect(nota.tagName).toBe('P');
    expect(nota.closest('ul')).toBeNull();
  });

  it('a revisão sem o texto no sistema: o botão vai, sem a caixa vazia (D813 §3, a ECR 04 na revisão 00)', async () => {
    montar({ cartoes: [{ ...CARTAO, registros: [{ ...PEDE_19, linhas: [] }] }] });
    await chegarAoPapel();
    expect(within(papel()).getByText(ANEXAR)).toBeTruthy();
    expect(within(papel()).queryByText('O que o fornecedor tem de mandar:')).toBeNull();
    expect(papel().querySelector('[data-palavras-da-ecr]')).toBeNull();
  });

  it('o cartão sem `registros` (o banco de antes, ou a lista guardada por uma versão antiga): não oferece, e grava como antes', async () => {
    const p = montar({ cartoes: [{ ...CARTAO, registros: undefined }] });
    await chegarAoPapel();
    expect(screen.queryByText(/Papel do fornecedor/)).toBeNull();
    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)).toEqual([]);
  });

  it('sem papel em mãos, ele não faz nada, e o "Pronto" grava: o papel não segura a entrega', async () => {
    const p = montar();
    await chegarAoPapel();
    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)).toEqual([]);
  });

  it('anexou: a leitura diz o alcance, ele confere com "Está certo", e vai só o "veio"', async () => {
    const lido = { alcance: 'vale_ate' as const, validoAte: '2027-06-30', confira: '' };
    const p = montar({ lerRegistro: vi.fn(async () => lido) });
    await chegarAoPapel();
    await anexarOPapel();
    expect(p.lerRegistro).toHaveBeenCalledWith(FOTO);
    expect(within(papel()).getByText('O papel diz: vale até 30/06/2027.')).toBeTruthy();
    pronto();
    expect(aviso()).toBe('Confira o que o papel de Cimento de teste diz: toque em "Está certo", ou escolha o certo.');
    fireEvent.click(within(papel()).getByRole('button', { name: 'Está certo' }));
    expect(within(papel()).getByText('Vale até 30/06/2027')).toBeTruthy();
    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)).toEqual([
      { ecrId: 19, resposta: 'veio', alcance: 'vale_ate', validoAte: '2027-06-30', lido, foto: FOTO },
    ]);
  });

  it('sem leitura, conta como deste lote; "Não está" deixa ele escolher outro, e vai o que ele escolheu (D812 §2, ajuste 3)', async () => {
    const p = montar();
    await chegarAoPapel();
    await anexarOPapel();
    expect(within(papel()).getByText('Não consegui ler o papel. Ele conta como deste lote.')).toBeTruthy();
    fireEvent.click(within(papel()).getByRole('button', { name: 'Não está' }));
    fireEvent.click(within(papel()).getByRole('button', { name: 'Vale para o produto, sem prazo' }));
    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)).toEqual([{ ecrId: 19, resposta: 'veio', alcance: 'produto', lido: null, foto: FOTO }]);
  });

  it('"Vale até" escolhido à mão pede a data', async () => {
    const p = montar();
    await chegarAoPapel();
    await anexarOPapel();
    fireEvent.click(within(papel()).getByRole('button', { name: 'Não está' }));
    fireEvent.click(within(papel()).getByRole('button', { name: 'Vale até uma data' }));
    pronto();
    expect(aviso()).toBe('Escreva até quando vale o papel de Cimento de teste.');
    fireEvent.change(papel().querySelector('input[type=date]')!, { target: { value: '2027-01-31' } });
    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)[0]).toMatchObject({ alcance: 'vale_ate', validoAte: '2027-01-31' });
  });

  it('na ECR com a marca "a cada entrega": deste lote, sem escolha, e a tela diz que vale para esta entrega', async () => {
    const lido = { alcance: 'vale_ate' as const, validoAte: '2027-06-30', confira: '' };
    const p = montar({ cartoes: [COM_A_MARCA], lerRegistro: vi.fn(async () => lido) });
    await chegarAoPapel();
    await anexarOPapel();
    expect(within(papel()).getByText('Este papel vale para esta entrega.')).toBeTruthy();
    for (const b of ['Está certo', 'Não está', 'Vale até uma data', 'Vale para o produto, sem prazo', 'Mudar']) {
      expect(within(papel()).queryByRole('button', { name: b })).toBeNull();
    }
    expect(papel().querySelector('input[type=date]')).toBeNull();
    pronto();
    await screen.findByText('Recebido.');
    // A leitura disse "vale até", e vai deste lote: ali, só o lote que nomeia a entrega cobre (Banco-D840, escolha 1).
    expect(registrosEnviados(p)).toEqual([{ ecrId: 2, resposta: 'veio', alcance: 'lote', lido, foto: FOTO }]);
  });

  it('"Tirar" volta ao começo: sem foto, sem trava, e o "Pronto" grava sem o papel', async () => {
    const guarda = guardaNaMemoria(true);
    const p = montar({ guarda });
    await chegarAoPapel();
    await anexarOPapel();
    await waitFor(async () => expect(await guarda.chaves(CHAVES.fotoDoRegistro('oc-1'))).toHaveLength(1));
    fireEvent.click(within(papel()).getByRole('button', { name: 'Tirar' }));
    expect(within(papel()).getByText(ANEXAR)).toBeTruthy();
    expect(within(papel()).queryByRole('img')).toBeNull();
    await waitFor(async () => expect(await guarda.chaves(CHAVES.fotoDoRegistro('oc-1'))).toEqual([]));
    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)).toEqual([]);
  });

  it('"Tirar" no meio da leitura: a leitura que chega depois não traz o papel de volta', async () => {
    const respostas: ((l: LeituraDoRegistro | null) => void)[] = [];
    const p = montar({ lerRegistro: vi.fn(() => new Promise<LeituraDoRegistro | null>((r) => respostas.push(r))) });
    await chegarAoPapel();
    escolherFoto(FOTO);
    await waitFor(() => expect(respostas).toHaveLength(1));
    fireEvent.click(within(papel()).getByRole('button', { name: 'Tirar' }));
    act(() => respostas[0]!({ alcance: 'produto', validoAte: '', confira: '' }));
    await new Promise((r) => setTimeout(r, 0));
    expect(within(papel()).getByText(ANEXAR)).toBeTruthy();
    expect(within(papel()).queryByText('Lendo o papel…')).toBeNull();
    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)).toEqual([]);
  });

  it('a foto nova lê de novo, e a conferência de antes não vale para ela', async () => {
    const leituras = [
      { alcance: 'lote' as const, validoAte: '', confira: '' },
      { alcance: 'produto' as const, validoAte: '', confira: '' },
    ];
    montar({ lerRegistro: vi.fn(async () => leituras.shift() ?? null) });
    await chegarAoPapel();
    await anexarOPapel();
    fireEvent.click(within(papel()).getByRole('button', { name: 'Está certo' }));
    escolherFoto(FOTO);
    expect(await within(papel()).findByText('O papel diz: vale para o produto, sem prazo.')).toBeTruthy();
    expect(within(papel()).getByRole('button', { name: 'Está certo' })).toBeTruthy();
  });

  it('trocou a foto no meio da leitura: vale só a leitura da última, e a da primeira, que chega depois, não cai em cima (D818 §2)', async () => {
    const respostas: ((l: LeituraDoRegistro | null) => void)[] = [];
    const p = montar({ lerRegistro: vi.fn(() => new Promise<LeituraDoRegistro | null>((r) => respostas.push(r))) });
    await chegarAoPapel();
    const segunda = new File(['q'], 'papel-2.jpg', { type: 'image/jpeg' });
    escolherFoto(FOTO);
    escolherFoto(segunda);
    await waitFor(() => expect(respostas).toHaveLength(2));
    act(() => respostas[1]!({ alcance: 'produto', validoAte: '', confira: '' }));
    expect(await within(papel()).findByText('O papel diz: vale para o produto, sem prazo.')).toBeTruthy();
    act(() => respostas[0]!({ alcance: 'vale_ate', validoAte: '2027-06-30', confira: '' }));
    await new Promise((r) => setTimeout(r, 0));
    expect(within(papel()).getByText('O papel diz: vale para o produto, sem prazo.')).toBeTruthy();
    fireEvent.click(within(papel()).getByRole('button', { name: 'Está certo' }));
    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)).toEqual([
      { ecrId: 19, resposta: 'veio', alcance: 'produto', lido: { alcance: 'produto', validoAte: '', confira: '' }, foto: segunda },
    ]);
  });

  it('o papel anexado e a foto sobrevivem a fechar o app; depois de ir, a foto sai do celular', async () => {
    const guarda = guardaNaMemoria(true);
    const p = montar({ guarda, lerRegistro: vi.fn(async () => ({ alcance: 'produto' as const, validoAte: '', confira: '' })) });
    await chegarAoPapel();
    await anexarOPapel();
    fireEvent.click(within(papel()).getByRole('button', { name: 'Está certo' }));
    await waitFor(async () => expect(await guarda.chaves(CHAVES.fotoDoRegistro('oc-1'))).toEqual(['foto:registro:oc-1:19']));

    cleanup();
    render(<MaterialAChegar {...p} />);
    await waitFor(() => expect(screen.getAllByRole('button', { expanded: false }).length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByRole('button', { expanded: false })[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Receber' }));
    expect(await within(await screen.findByRole('group', { name: TITULO })).findByText('Vale para o produto, sem prazo')).toBeTruthy();
    expect(within(papel()).getByRole('img', { name: 'A foto do papel de Cimento de teste' })).toBeTruthy();

    pronto();
    await screen.findByText('Recebido.');
    expect(registrosEnviados(p)).toEqual([
      { ecrId: 19, resposta: 'veio', alcance: 'produto', lido: { alcance: 'produto', validoAte: '', confira: '' }, foto: FOTO },
    ]);
    await waitFor(async () => expect(await guarda.chaves(CHAVES.fotoDoRegistro('oc-1'))).toEqual([]));
  });
});
