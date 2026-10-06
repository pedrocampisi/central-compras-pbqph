import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * CTO-D739 §4 — a Rev. 01 pela mão do Pedro, na página do PS.02. Só quem revisa
 * ECR vê o rascunho e o "Gravar"; o "Gravar" chama a porta do Banco com a
 * revisão de onde o rascunho partiu ('00'). O banco é falso: a leitura devolve
 * a Rev. 00 do dado de teste, e a porta é uma função que só anota a chamada.
 */

const pode = vi.fn();
const porta = vi.fn();
const ler = vi.fn();
const carregou = vi.fn();
vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({
    rpc: async (nome: string, args: Record<string, unknown>) => {
      if (nome === 'pode_revisar_ecr') return { data: pode(), error: null };
      if (nome === 'revisar_procedimento') return porta(args);
      throw new Error(`rpc inesperada: ${nome}`);
    },
  }),
  compras: () => ({}),
}));
vi.mock('../../src/services/supabase/procedimento', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/procedimento')>()),
  lerProcedimento: (c: string) => ler(c),
}));
vi.mock('../../src/features/procedimento/rev01', async (original) => {
  const real = await original<typeof import('../../src/features/procedimento/rev01')>();
  return {
    carregarRascunho: () => {
      carregou();
      return real.carregarRascunho();
    },
  };
});

import { ProcedimentoPage } from '../../src/features/procedimento/ProcedimentoPage';
import { useUiStore } from '../../src/stores/useUiStore';
import { procedimentoDoBanco } from '../../src/domain/procedimentoDoBanco';
import type { Procedimento } from '../../src/domain/procedimento';
import { ps02Rev00 } from '../fixtures/ps02Rev00';

const json = (caminho: string): unknown => JSON.parse(readFileSync(join(__dirname, caminho), 'utf-8'));
const DOCUMENTO = json('../../src/features/procedimento/rev01/documento.json');
const MUDANCAS = json('../../src/features/procedimento/rev01/mudancas.json') as {
  descricao: string;
  mudancas: { ancora: string; motivo: string }[];
};
const MARCADOS = new Set(MUDANCAS.mudancas.map((m) => m.ancora)).size;

/** A Rev. 00 como a leitura do banco a devolve (o documento do Banco, o histórico do dado de teste). */
function vigente(revisao = '00'): Procedimento {
  const { codigo, titulo, data, revisoes } = ps02Rev00();
  return procedimentoDoBanco(
    { codigo, titulo, revisao, emitida_em: data, documento: json('../fixtures/ps02Rev00DoBanco.json') },
    (revisoes ?? []).map((r, i) => ({
      id: i + 1,
      revisao: r.revisao,
      emitida_em: r.data,
      descricao: r.descricao,
      revisado_por_nome: r.revisado_por,
      aprovado_por_nome: r.aprovado_por,
    })),
  )!;
}

const rolou = vi.fn();
beforeEach(() => {
  pode.mockReset();
  porta.mockReset();
  ler.mockReset();
  carregou.mockReset();
  rolou.mockReset();
  Element.prototype.scrollIntoView = rolou;
  useUiStore.setState({ activeTab: 'procedimento', ancoraDoProcedimento: null });
});
afterEach(cleanup);

async function abre({ revisa, revisao = '00' }: { revisa: boolean; revisao?: string }) {
  pode.mockReturnValue(revisa);
  ler.mockResolvedValue(vigente(revisao));
  await act(async () => {
    render(<ProcedimentoPage />);
  });
  await screen.findByRole('heading', { level: 3, name: /PS\.02/ });
}

const painel = () => document.querySelector('[data-painel-da-revisao]') as HTMLElement | null;

async function leORascunho() {
  fireEvent.click(await screen.findByRole('button', { name: 'Ler o rascunho' }));
  await waitFor(() => expect(document.querySelector('[data-rascunho]')).not.toBeNull());
}

describe('quem não revisa ECR não vê a revisão', () => {
  it('sem o quadro, sem o rascunho, sem o "Gravar" — e o rascunho nem desce', async () => {
    await abre({ revisa: false });
    await act(async () => {});
    expect(painel()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ler o rascunho' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Gravar/ })).toBeNull();
    expect(document.querySelector('[data-rascunho]')).toBeNull();
    expect(carregou).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'PDF do PS.02' })).toBeTruthy();
  });
});

describe('quem revisa lê o rascunho com o que mudou marcado', () => {
  it('o quadro diz quantos trechos mudam e só abre o rascunho no clique', async () => {
    await abre({ revisa: true });
    await waitFor(() => expect(painel()).not.toBeNull());
    expect(painel()!.textContent).toContain('Rev. 01 em rascunho');
    expect(painel()!.textContent).toContain(`${MARCADOS} trechos mudam em relação à Rev. 00`);
    expect(document.querySelector('[data-rascunho]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Gravar a Rev. 01' })).toBeNull();
  });

  it('no rascunho: a Rev. 01, cada trecho que mudou marcado, e o PDF some', async () => {
    await abre({ revisa: true });
    await leORascunho();
    const doc = document.querySelector('[data-rascunho]') as HTMLElement;
    expect(doc.textContent).toContain('Rev. 01');
    expect(doc.textContent).toContain('Manual do sistema de compras');
    expect(doc.querySelectorAll('[data-marca-de]')).toHaveLength(MARCADOS);
    expect(doc.querySelectorAll('[data-mudou]')).toHaveLength(MARCADOS);
    expect(screen.queryByRole('button', { name: 'PDF do PS.02' })).toBeNull();
  });

  it('o "?" do trecho diz por que mudou', async () => {
    await abre({ revisa: true });
    await leORascunho();
    const trava = document.getElementById('qualificacao.p3')!;
    fireEvent.click(within(trava).getByRole('button', { name: 'Ajuda: Por que este trecho mudou' }));
    const motivo = MUDANCAS.mudancas.find((m) => m.ancora === 'qualificacao.p3')!.motivo;
    expect(within(trava).getByRole('note').textContent).toContain(motivo);
  });

  it('"Próxima mudança" pula de uma em uma, na ordem da página', async () => {
    await abre({ revisa: true });
    await leORascunho();
    const proxima = screen.getByRole('button', { name: 'Próxima mudança' });
    fireEvent.click(proxima);
    expect(document.getElementById('cabecalho.revisao')!.hasAttribute('data-alvo')).toBe(true);
    fireEvent.click(proxima);
    expect(document.getElementById('como_usar')!.hasAttribute('data-alvo')).toBe(true);
  });

  it('"Voltar à Rev. 00" mostra a vigente de novo, sem marca', async () => {
    await abre({ revisa: true });
    await leORascunho();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar à Rev. 00' }));
    expect(document.querySelector('[data-rascunho]')).toBeNull();
    expect(document.querySelectorAll('[data-mudou]')).toHaveLength(0);
  });

  it('com a vigente já na Rev. 01, o rascunho não aparece mais', async () => {
    await abre({ revisa: true, revisao: '01' });
    await waitFor(() => expect(carregou).toHaveBeenCalled());
    await act(async () => {});
    expect(painel()).toBeNull();
  });
});

describe('o "Gravar a Rev. 01" chama a porta do Banco (D739 §4.2)', () => {
  it('pergunta antes, e grava pela porta com a revisão de partida "00", o documento do script e a descrição', async () => {
    porta.mockResolvedValue({ data: { revisao_anterior: '00', revisao: '01', emitida_em: '2026-10-06' }, error: null });
    await abre({ revisa: true });
    await leORascunho();
    fireEvent.click(screen.getByRole('button', { name: 'Gravar a Rev. 01' }));
    const dialogo = screen.getByRole('dialog');
    expect(within(dialogo).getByRole('heading', { name: 'Gravar a Rev. 01?' })).toBeTruthy();
    expect(dialogo.textContent).toContain('Ela passa a valer hoje e entra no histórico.');
    expect((within(dialogo).getByRole('textbox') as HTMLTextAreaElement).value).toBe(MUDANCAS.descricao);
    expect(porta).not.toHaveBeenCalled();

    ler.mockResolvedValue(vigente('01'));
    await act(async () => {
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Gravar a Rev. 01' }));
    });
    expect(porta).toHaveBeenCalledTimes(1);
    expect(porta).toHaveBeenCalledWith({
      p_codigo: 'PS.02',
      p_revisao_de: '00',
      p_documento: DOCUMENTO,
      p_descricao: MUDANCAS.descricao,
    });
    // Gravada: lê de novo, e a vigente nova não tem mais rascunho.
    await waitFor(() => expect(ler).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(painel()).toBeNull());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useUiStore.getState().toasts.at(-1)?.message).toBe('PS.02 revisado: Rev. 01, emitida em 06/10/2026.');
  });

  it('"Voltar" no diálogo não grava', async () => {
    await abre({ revisa: true });
    await leORascunho();
    fireEvent.click(screen.getByRole('button', { name: 'Gravar a Rev. 01' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Voltar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(porta).not.toHaveBeenCalled();
  });

  it('a recusa do banco fica no diálogo, em frase, e nada some', async () => {
    porta.mockResolvedValue({ data: null, error: { code: '40001', message: 'a vigente mudou' } });
    await abre({ revisa: true });
    await leORascunho();
    fireEvent.click(screen.getByRole('button', { name: 'Gravar a Rev. 01' }));
    const dialogo = screen.getByRole('dialog');
    await act(async () => {
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Gravar a Rev. 01' }));
    });
    expect(within(dialogo).getByRole('alert').textContent).toMatch(/alguém gravou antes/);
    expect(ler).toHaveBeenCalledTimes(1);
  });

  it('sem descrição, não manda', async () => {
    await abre({ revisa: true });
    await leORascunho();
    fireEvent.click(screen.getByRole('button', { name: 'Gravar a Rev. 01' }));
    const dialogo = screen.getByRole('dialog');
    fireEvent.change(within(dialogo).getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Gravar a Rev. 01' }));
    expect(within(dialogo).getByRole('alert').textContent).toMatch(/Escreva o que mudou/);
    expect(porta).not.toHaveBeenCalled();
  });
});
