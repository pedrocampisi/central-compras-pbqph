import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MaterialAChegar, type MaterialAChegarProps } from '../../src/features/recebimento/MaterialAChegar';
import type { CartaoAChegar } from '../../src/domain/recebimento';

/**
 * CTO-D693: a tela do mestre de obra, por COMPORTAMENTO. A tela não fala com
 * o banco: as funções de gravar são deste teste. Pedido, empresa e obra são
 * INVENTADOS.
 */

const CARTAO: CartaoAChegar = {
  ocId: 'oc-1',
  numero: '2026/101',
  fornecedor: 'Fornecedor de Teste',
  combinadoPara: '2026-10-05',
  total: 1540,
  itens: [{ descricao: 'Cimento de teste', quantidade: 40, unidade: 'sc' }],
};

function montar(extra: Partial<MaterialAChegarProps> = {}) {
  const props: MaterialAChegarProps = {
    obra: 'Obra de Teste',
    hoje: '2026-10-05',
    cartoes: [CARTAO],
    lerNumeroDaNota: vi.fn(async () => '000123'),
    aoReceber: vi.fn(async () => undefined),
    aoRegistrarSemPedido: vi.fn(async () => undefined),
    ...extra,
  };
  render(<MaterialAChegar {...props} />);
  return props;
}

const responder = (pergunta: string, resposta: string) =>
  fireEvent.click(within(screen.getByRole('group', { name: pergunta })).getByRole('button', { name: resposta }));

function abrirEResponder(respostas: [string, string][]) {
  fireEvent.click(screen.getByRole('button', { name: /Toque para receber/ }));
  for (const [p, r] of respostas) responder(p, r);
}

const tudoSim: [string, string][] = [
  ['Chegou no dia combinado?', 'Sim'],
  ['Chegou sem estrago?', 'Sim'],
  ['Chegou o que foi pedido?', 'Sim'],
  ['Chegou tudo?', 'Sim'],
];

describe('Material a chegar', () => {
  it('a lista mostra o apelido, o dia, os itens e o preço', () => {
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

  it('com tudo "Sim" e o número escrito, o "Pronto" grava e diz "Recebido."', async () => {
    const p = montar();
    abrirEResponder(tudoSim);
    fireEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '4567' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Recebido.');
    expect(screen.getByText('O escritório já vê.')).toBeTruthy();
    expect(p.aoReceber).toHaveBeenCalledWith(
      CARTAO,
      expect.objectContaining({ notaFiscal: '4567', prazoConforme: true, integridadeConforme: true, ocEcrConforme: true }),
      false,
      null,
    );
  });

  it('a foto: o número lido aparece para ele conferir', async () => {
    const p = montar();
    abrirEResponder(tudoSim);
    const foto = new File(['x'], 'nota.jpg', { type: 'image/jpeg' });
    URL.createObjectURL = vi.fn(() => 'blob:teste');
    URL.revokeObjectURL = vi.fn();
    fireEvent.change(document.querySelector('input[type=file]')!, { target: { files: [foto] } });
    await screen.findByText('Confira o número da nota:');
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('000123');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Recebido.');
    expect(p.aoReceber).toHaveBeenCalledWith(CARTAO, expect.objectContaining({ notaFiscal: '000123' }), false, foto);
  });

  it('dois toques rápidos, antes da tela redesenhar: as duas respostas ficam', () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: /Toque para receber/ }));
    const sim = (pergunta: string) =>
      within(screen.getByRole('group', { name: pergunta })).getByRole('button', { name: 'Sim' });
    const [a, b] = [sim('Chegou no dia combinado?'), sim('Chegou sem estrago?')];
    act(() => {
      a.click();
      b.click();
    });
    expect(screen.getAllByRole('button', { name: 'Sim', pressed: true })).toHaveLength(2);
  });

  it('sem responder tudo, o "Pronto" diz o que falta e não grava', () => {
    const p = montar();
    abrirEResponder(tudoSim.slice(0, 2));
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    expect(screen.getByRole('alert').textContent).toBe('Falta responder: Chegou o que foi pedido?');
    expect(p.aoReceber).not.toHaveBeenCalled();
  });

  it('dois "Não" pedem o "O que aconteceu?", e "Só uma parte" vai como entrega parcial', async () => {
    const p = montar();
    abrirEResponder([
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
      CARTAO,
      expect.objectContaining({ tratativa: 'atrasou e rasgou', observacao: '' }),
      true,
      null,
    );
  });

  it('sinal fraco: a gravação falha, a tela fica, e nada do que ele preencheu se perde', async () => {
    montar({ aoReceber: vi.fn(async () => Promise.reject(new Error('sem rede'))) });
    abrirEResponder(tudoSim);
    fireEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '4567' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/continua aqui/));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('4567');
    expect(screen.getAllByRole('button', { name: 'Sim', pressed: true })).toHaveLength(4);
  });

  it('chegou sem pedido: "Sim, sem estrago" vai como sem estrago', async () => {
    const p = montar();
    fireEvent.click(screen.getByRole('button', { name: 'Chegou material sem pedido' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sem foto? Escreva o número' }));
    const caixas = screen.getAllByRole('textbox');
    fireEvent.change(caixas[0]!, { target: { value: '321' } });
    fireEvent.change(caixas[caixas.length - 1]!, { target: { value: '2 caminhões de brita' } });
    responder('Chegou sem estrago?', 'Sim');
    fireEvent.click(screen.getByRole('button', { name: 'Pronto' }));
    await screen.findByText('Registrado.');
    expect(p.aoRegistrarSemPedido).toHaveBeenCalledWith(
      expect.objectContaining({ numeroDaNota: '321', oQueChegou: '2 caminhões de brita', comEstrago: false }),
    );
  });

  it('nenhuma palavra do escritório aparece na tela dele', () => {
    montar();
    const vistas: string[] = [document.body.textContent ?? ''];
    abrirEResponder([
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
