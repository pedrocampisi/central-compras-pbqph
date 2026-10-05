import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MaterialAChegar, type MaterialAChegarProps } from '../../src/features/recebimento/MaterialAChegar';
import { RecusaDefinitiva, TENTAR_DE_NOVO_MS } from '../../src/features/recebimento/fila';
import type { CartaoAChegar } from '../../src/domain/recebimento';
import { guardaDoAparelho, guardaNaMemoria, type GuardaDoAparelho } from '../../src/services/guardaDoAparelho';

/**
 * CTO-D693 e D696: a tela do mestre de obra, por COMPORTAMENTO. A tela não
 * fala com o banco: as funções de gravar são deste teste, e o "celular" é a
 * guarda na memória (a mesma guarda entre duas montagens = fechar e abrir o
 * app). Pedido, empresa e obra são INVENTADOS.
 */

const OBRA = { id: 'obra-1', nome: 'Obra de Teste' };

const CARTAO: CartaoAChegar = {
  ocId: 'oc-1',
  intervencaoId: OBRA.id,
  obra: OBRA.nome,
  numero: '2026/101',
  fornecedor: 'Fornecedor de Teste',
  combinadoPara: '2026-10-05',
  total: 1540,
  itens: [{ descricao: 'Cimento de teste', quantidade: 40, unidade: 'sc' }],
};

afterEach(() => {
  vi.useRealTimers();
});

function montar(extra: Partial<MaterialAChegarProps> = {}) {
  const props: MaterialAChegarProps = {
    obras: [OBRA],
    hoje: '2026-10-05',
    cartoes: [CARTAO],
    lerNumeroDaNota: vi.fn(async () => '000123'),
    aoReceber: vi.fn(async () => undefined),
    aoRegistrarSemPedido: vi.fn(async () => undefined),
    // Finge o aparelho que guarda (o IndexedDB): durável.
    guarda: guardaNaMemoria(true),
    ...extra,
  };
  render(<MaterialAChegar {...props} />);
  return props;
}

/** Fecha o app e abre de novo, no mesmo celular. */
function reabrir(props: MaterialAChegarProps) {
  cleanup();
  render(<MaterialAChegar {...props} />);
}

const responder = (pergunta: string, resposta: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: pergunta })).getByRole('button', { name: resposta }));

async function abrir() {
  fireEvent.click(await screen.findByRole('button', { name: /Toque para receber|Toque para ver/ }));
  await screen.findByRole('group', { name: 'Chegou tudo?' });
}

async function abrirEResponder(respostas: [string, string][]) {
  await abrir();
  for (const [p, r] of respostas) responder(p, r);
}

const escreverNumero = (n: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: n } });
};

const tudoSim: [string, string][] = [
  ['Chegou no dia combinado?', 'Sim'],
  ['Chegou sem estrago?', 'Sim'],
  ['Chegou o que foi pedido?', 'Sim'],
  ['Chegou tudo?', 'Sim'],
];

describe('Material a chegar: a lista', () => {
  it('mostra o apelido, o dia, os itens e o preço', () => {
    montar();
    expect(screen.getByText('Fornecedor de Teste')).toBeTruthy();
    expect(screen.getByText('hoje')).toBeTruthy();
    expect(screen.getByText('40 sc')).toBeTruthy();
    expect(screen.getByText(/1\.540,00/)).toBeTruthy();
  });

  it('o pedido sem data diz "Sem dia combinado", e não "Combinado para sem dia combinado"', () => {
    montar({ cartoes: [{ ...CARTAO, combinadoPara: '' }, { ...CARTAO, ocId: 'oc-2', combinadoPara: '05/10' }] });
    expect(screen.getAllByText('Sem dia combinado')).toHaveLength(2);
    expect(document.body.textContent).not.toMatch(/Combinado para/);
  });

  it('"Chegou material sem pedido" vem ANTES dos pedidos, à vista (D696 §2.1)', () => {
    montar({ cartoes: Array.from({ length: 10 }, (_, n) => ({ ...CARTAO, ocId: `oc-${n}` })) });
    const semPedido = screen.getByRole('button', { name: 'Chegou material sem pedido' });
    const primeiro = screen.getAllByRole('button', { name: /Toque para receber/ })[0]!;
    expect(semPedido.compareDocumentPosition(primeiro) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('o "Sair" pergunta antes; "Não, ficar" fica, "Sim, sair" sai (D696 §2.2)', () => {
    const aoSair = vi.fn();
    montar({ aoSair });
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(screen.getByRole('alertdialog').textContent).toMatch(/QR novo/);
    expect(aoSair).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Não, ficar' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sim, sair' }));
    expect(aoSair).toHaveBeenCalledTimes(1);
  });
});

describe('Material a chegar: receber', () => {
  it('com tudo "Sim" e o número escrito, o "Pronto" grava e diz "Recebido."', async () => {
    const p = montar();
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Recebido.');
    expect(screen.getByText('O escritório já vê.')).toBeTruthy();
    expect(p.aoReceber).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'receber',
        chave: expect.any(String),
        cartao: CARTAO,
        avaliacao: expect.objectContaining({ notaFiscal: '4567', prazoConforme: true, integridadeConforme: true, ocEcrConforme: true }),
        soUmaParte: false,
        foto: null,
      }),
    );
  });

  it('a foto: o número lido aparece para ele conferir', async () => {
    const p = montar();
    await abrirEResponder(tudoSim);
    const foto = new File(['x'], 'nota.jpg', { type: 'image/jpeg' });
    URL.createObjectURL = vi.fn(() => 'blob:teste');
    URL.revokeObjectURL = vi.fn();
    fireEvent.change(document.querySelector('input[type=file]')!, { target: { files: [foto] } });
    await screen.findByText('Confira o número da nota:');
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('000123');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Recebido.');
    expect(p.aoReceber).toHaveBeenCalledWith(
      expect.objectContaining({ avaliacao: expect.objectContaining({ notaFiscal: '000123' }), foto }),
    );
  });

  it('dois toques rápidos, antes da tela redesenhar: as duas respostas ficam', async () => {
    montar();
    await abrir();
    const sim = (pergunta: string) =>
      within(screen.getByRole('group', { name: pergunta })).getByRole('button', { name: 'Sim' });
    const [a, b] = [sim('Chegou no dia combinado?'), sim('Chegou sem estrago?')];
    act(() => {
      a.click();
      b.click();
    });
    expect(screen.getAllByRole('button', { name: 'Sim', pressed: true })).toHaveLength(2);
  });

  it('sem responder tudo, o "Pronto" diz o que falta e não grava', async () => {
    const p = montar();
    await abrirEResponder(tudoSim.slice(0, 2));
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    expect(screen.getByRole('alert').textContent).toBe('Falta responder: Chegou o que foi pedido?');
    expect(p.aoReceber).not.toHaveBeenCalled();
  });

  it('dois "Não" pedem o "O que aconteceu?", e "Só uma parte" vai como entrega parcial', async () => {
    const p = montar();
    await abrirEResponder([
      ['Chegou no dia combinado?', 'Não'],
      ['Chegou sem estrago?', 'Não'],
      ['Chegou o que foi pedido?', 'Sim'],
      ['Chegou tudo?', 'Só uma parte'],
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
    const [numero, caixa] = screen.getAllByRole('textbox') as [HTMLInputElement, HTMLTextAreaElement];
    fireEvent.change(numero, { target: { value: '88' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    expect(screen.getByRole('alert').textContent).toBe('Conte o que aconteceu: tem mais de um "Não".');
    fireEvent.change(caixa, { target: { value: 'atrasou e rasgou' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Recebido.');
    expect(p.aoReceber).toHaveBeenCalledWith(
      expect.objectContaining({
        avaliacao: expect.objectContaining({ tratativa: 'atrasou e rasgou', observacao: '' }),
        soUmaParte: true,
      }),
    );
  });

  it('nenhuma palavra do escritório aparece na tela dele', async () => {
    montar();
    const vistas: string[] = [document.body.textContent ?? ''];
    await abrirEResponder([
      ['Chegou no dia combinado?', 'Não'],
      ['Chegou sem estrago?', 'Não'],
      ['Chegou o que foi pedido?', 'Não'],
      ['Chegou tudo?', 'Só uma parte'],
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    vistas.push(document.body.textContent ?? '');
    expect(vistas.join(' ')).not.toMatch(/conforme|ecr|tratativa/i);
  });
});

describe('Material a chegar: guardado no celular (D696 §5.1)', () => {
  it('o que ele preencheu sobrevive a fechar o app: as respostas, o número e a foto', async () => {
    const p = montar();
    URL.createObjectURL = vi.fn(() => 'blob:teste');
    URL.revokeObjectURL = vi.fn();
    await abrirEResponder(tudoSim.slice(0, 2));
    const foto = new File(['x'], 'nota.jpg', { type: 'image/jpeg' });
    fireEvent.change(document.querySelector('input[type=file]')!, { target: { files: [foto] } });
    await screen.findByText('Confira o número da nota:');
    await waitFor(async () => expect(await p.guarda!.ler('foto:receber:oc-1')).toBe(foto));

    reabrir(p);
    await abrir();
    expect(screen.getAllByRole('button', { name: 'Sim', pressed: true })).toHaveLength(2);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('000123');
    expect(screen.getByRole('img', { name: 'A foto da nota' })).toBeTruthy();
  });

  it('sem sinal: "Guardado no celular.", o cartão fica travado, e vai sozinho quando a rede volta, com a mesma chave', async () => {
    let sinal = false;
    const aoReceber = vi.fn(async () => {
      if (!sinal) throw new Error('Failed to fetch');
    });
    const p = montar({ aoReceber });
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Guardado no celular.');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a lista' }));

    expect(await screen.findByText(/Guardado no celular\. Vai quando tiver sinal\./)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Toque para receber/ })).toBeNull();
    expect(screen.getByText(/1 recebimento guardado no celular/)).toBeTruthy();

    sinal = true;
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    await waitFor(() => expect(screen.queryByText(/guardado no celular/i)).toBeNull());
    expect(aoReceber).toHaveBeenCalledTimes(2);
    const [primeira, segunda] = aoReceber.mock.calls as unknown as [[{ chave: string }], [{ chave: string }]];
    expect(segunda[0].chave).toBe(primeira[0].chave);
    expect(await p.guarda!.chaves('')).toEqual([]);
  });

  it('o celular que não guarda (sem IndexedDB): sem sinal, NÃO diz "Guardado no celular", diz para não fechar (perícia 05/10, achado 6)', async () => {
    const aoReceber = vi.fn(async () => Promise.reject(new Error('Failed to fetch')));
    montar({ aoReceber, guarda: guardaDoAparelho() });
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    expect(await screen.findByText('Ainda não foi.')).toBeTruthy();
    expect(screen.getByText(/Não feche o app/)).toBeTruthy();
    expect(screen.queryByText(/[Gg]uardado no celular/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a lista' }));
    expect(await screen.findByText(/1 recebimento esperando sinal/)).toBeTruthy();
    expect(screen.getByText(/Não feche o app: este celular não está guardando/)).toBeTruthy();
    expect(screen.queryByText(/[Gg]uardado no celular/)).toBeNull();
  });

  it('o guardado vai sozinho também ao abrir o app de novo', async () => {
    const aoReceber = vi.fn(async () => Promise.reject(new Error('sem rede')));
    const p = montar({ aoReceber });
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Guardado no celular.');

    const deNovo = vi.fn(async () => undefined);
    reabrir({ ...p, aoReceber: deNovo });
    await waitFor(() => expect(deNovo).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('button', { name: /Toque para receber/ })).toBeTruthy());
  });

  it('e a cada 30 s, enquanto houver algo esperando', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let sinal = false;
    const aoReceber = vi.fn(async () => {
      if (!sinal) throw new Error('sem rede');
    });
    montar({ aoReceber });
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Guardado no celular.');
    sinal = true;
    await waitFor(() => expect(vi.getTimerCount()).toBeGreaterThan(0));
    expect(aoReceber).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(TENTAR_DE_NOVO_MS);
    });
    await waitFor(() => expect(aoReceber).toHaveBeenCalledTimes(2));
  });

  it('o banco recusa na hora: a tela fica, diz o motivo, e nada do que ele preencheu se perde', async () => {
    const p = montar({ aoReceber: vi.fn(async () => Promise.reject(new RecusaDefinitiva('Este pedido não é da sua obra.'))) });
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Não foi: Este pedido não é da sua obra.'));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('4567');
    expect(screen.getAllByRole('button', { name: 'Sim', pressed: true })).toHaveLength(4);
    expect(await p.guarda!.chaves('fila:')).toEqual([]);
  });

  it('o banco recusa depois, quando o sinal volta: o cartão diz o motivo e abre com o que ele preencheu', async () => {
    let resposta: Error = new Error('sem rede');
    const aoReceber = vi.fn(async () => Promise.reject(resposta));
    montar({ aoReceber });
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Guardado no celular.');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a lista' }));

    resposta = new RecusaDefinitiva('Este pedido já foi recebido.');
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    expect(await screen.findByText(/Não foi: Este pedido já foi recebido\. Toque para ver\./)).toBeTruthy();
    await abrir();
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('4567');
  });
});

describe('Material a chegar: sem pedido', () => {
  async function preencher() {
    fireEvent.click(screen.getByRole('button', { name: 'Chegou material sem pedido' }));
    await screen.findByText('Chegou sem pedido');
    fireEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
    const caixas = screen.getAllByRole('textbox');
    fireEvent.change(caixas[0]!, { target: { value: '321' } });
    fireEvent.change(caixas[caixas.length - 1]!, { target: { value: '2 caminhões de brita' } });
    responder('Chegou sem estrago?', 'Sim');
  }

  it('"Sim, sem estrago" vai como sem estrago', async () => {
    const p = montar();
    await preencher();
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Registrado.');
    expect(p.aoRegistrarSemPedido).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'sem-pedido',
        registro: expect.objectContaining({ numeroDaNota: '321', oQueChegou: '2 caminhões de brita', comEstrago: false }),
      }),
    );
  });

  it('guardado sem sinal, o formulário volta limpo para o próximo', async () => {
    const p = montar({ aoRegistrarSemPedido: vi.fn(async () => Promise.reject(new Error('sem rede'))) });
    await preencher();
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Guardado no celular.');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a lista' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Chegou material sem pedido' }));
    await screen.findByText('Chegou sem pedido');
    expect(screen.getAllByRole('textbox').every((c) => (c as HTMLInputElement).value === '')).toBe(true);
    expect(await p.guarda!.chaves('fila:')).toHaveLength(1);
  });

  it('o que o banco recusou volta com "Abrir de novo", como ele deixou', async () => {
    let resposta: Error = new Error('sem rede');
    montar({ aoRegistrarSemPedido: vi.fn(async () => Promise.reject(resposta)) });
    await preencher();
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Guardado no celular.');
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a lista' }));
    resposta = new RecusaDefinitiva('A obra não aceita registro agora.');
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    expect(await screen.findByText(/Um material sem pedido não foi: A obra não aceita registro agora\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir de novo' }));
    await screen.findByText('Chegou sem pedido');
    expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('321');
  });
});

describe('Material a chegar: ligado ao banco (D696 §5.2)', () => {
  it('a OC foi cancelada antes de o envio chegar: o "Pronto" mostra o recado do banco', async () => {
    const msg = 'A OC 2026/101 foi cancelada antes deste recebimento chegar. Ele foi para o escritório resolver.';
    montar({ aoReceber: vi.fn(async () => msg) });
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    expect(await screen.findByText(msg)).toBeTruthy();
    expect(screen.queryByText('O escritório já vê.')).toBeNull();
  });

  async function preencherSemPedido(estrago: 'Sim' | 'Não') {
    fireEvent.click(screen.getByRole('button', { name: 'Chegou material sem pedido' }));
    await screen.findByText('Chegou sem pedido');
    fireEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
    const caixas = screen.getAllByRole('textbox');
    fireEvent.change(caixas[0]!, { target: { value: '321' } });
    fireEvent.change(caixas[caixas.length - 1]!, { target: { value: 'Areia' } });
    responder('Chegou sem estrago?', estrago);
  }

  it('com mais de uma obra, o sem pedido pergunta "Em qual obra?", e vai com a que ele escolheu', async () => {
    const p = montar({ obras: [OBRA, { id: 'obra-2', nome: 'Outra Obra' }] });
    await preencherSemPedido('Sim');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    expect(screen.getByRole('alert').textContent).toBe('Falta responder: Em qual obra?');
    expect(p.aoRegistrarSemPedido).not.toHaveBeenCalled();
    responder('Em qual obra?', 'Outra Obra');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Registrado.');
    expect(p.aoRegistrarSemPedido).toHaveBeenCalledWith(
      expect.objectContaining({ intervencaoId: 'obra-2', recebidoEm: '2026-10-05' }),
    );
  });

  it('com uma obra só, não pergunta, e vai com ela', async () => {
    const p = montar();
    await preencherSemPedido('Não');
    expect(screen.queryByRole('group', { name: 'Em qual obra?' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Registrado.');
    expect(p.aoRegistrarSemPedido).toHaveBeenCalledWith(expect.objectContaining({ intervencaoId: OBRA.id }));
  });

  it('com mais de uma obra, o cartão diz de qual obra é o pedido', () => {
    montar({ obras: [OBRA, { id: 'obra-2', nome: 'Outra Obra' }] });
    const cartao = screen.getByRole('button', { name: /Toque para receber/ });
    expect(within(cartao).getByText('Obra de Teste')).toBeTruthy();
    cleanup();
    montar();
    expect(within(screen.getByRole('button', { name: /Toque para receber/ })).queryByText('Obra de Teste')).toBeNull();
  });

  it('em nenhuma obra: diz para falar com o engenheiro, e não oferece o sem pedido', () => {
    montar({ obras: [], cartoes: [] });
    expect(screen.getByText('Você ainda não está em nenhuma obra. Fale com o engenheiro.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Chegou material sem pedido' })).toBeNull();
  });

  it('recusado, e o pedido saiu da lista (ele foi tirado da obra): fica à vista, e apagar pergunta antes', async () => {
    let resposta: Error = new Error('sem rede');
    const p = montar({ aoReceber: vi.fn(async () => Promise.reject(resposta)) });
    await abrirEResponder(tudoSim);
    escreverNumero('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Guardado no celular.');

    // o pedido some da lista dele, e o banco recusa quando ele abre o app de novo
    cleanup();
    resposta = new RecusaDefinitiva('Este pedido não é da sua obra.');
    render(<MaterialAChegar {...p} cartoes={[]} />);
    expect(
      await screen.findByText(
        'O recebimento do pedido 2026/101 (Fornecedor de Teste) não foi: Este pedido não é da sua obra. Mostre ao engenheiro da obra.',
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Apagar do celular' }));
    fireEvent.click(screen.getByRole('button', { name: 'Não, deixar' }));
    expect(await p.guarda!.chaves('fila:')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Apagar do celular' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sim, apagar' }));
    await waitFor(() => expect(screen.queryByText(/O recebimento do pedido/)).toBeNull());
    expect(await p.guarda!.chaves('fila:')).toEqual([]);
  });

  it('o recado da lista (sem sinal, é a de antes) aparece debaixo do título', () => {
    montar({ aviso: 'Sem sinal. Esta é a lista das 14h05.' });
    expect(screen.getByText('Sem sinal. Esta é a lista das 14h05.').getAttribute('role')).toBe('status');
  });
});

describe('a guarda do celular', () => {
  it('na memória: grava, lê, lista pelo começo da chave e apaga', async () => {
    const g: GuardaDoAparelho = guardaNaMemoria();
    await g.gravar('fila:b', 2);
    await g.gravar('fila:a', 1);
    await g.gravar('rascunho:x', 3);
    expect(await g.chaves('fila:')).toEqual(['fila:a', 'fila:b']);
    expect(await g.ler('fila:a')).toBe(1);
    await g.apagar('fila:a');
    expect(await g.ler('fila:a')).toBeUndefined();
  });
});
