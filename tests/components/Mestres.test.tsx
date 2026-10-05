import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * CTO-D696 §4: a tela "Mestres", do engenheiro, na obra. O serviço é FALSO;
 * pessoas, obras e códigos inventados.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: {} },
  core: () => ({}),
  compras: () => ({}),
}));
const srv = vi.hoisted(() => ({}) as Record<string, Mock>);
vi.mock('../../src/services/supabase/mestres', () => ({
  lerMestres: () => srv.ler!(),
  cadastrarMestre: (...a: unknown[]) => srv.cadastrar!(...a),
  gerarQr: (...a: unknown[]) => srv.qr!(...a),
  porNaObra: (...a: unknown[]) => srv.por!(...a),
  tirarDaObra: (...a: unknown[]) => srv.tirar!(...a),
  desligarMestre: (...a: unknown[]) => srv.desligar!(...a),
  religarMestre: (...a: unknown[]) => srv.religar!(...a),
}));

import { MestresPage } from '../../src/features/mestres/MestresPage';
import { lerQrDoDesenho } from '../fixtures/lerQrDoDesenho';
import { normalizeObra } from '../../src/domain/normalize';
import type { MestreNaLista } from '../../src/services/supabase/mestres';
import { useDataStore } from '../../src/stores/useDataStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

const OBRA_1 = normalizeObra({ id: 'obra-1', nome: 'Obra Um (teste)', ativa: true });
const OBRA_2 = normalizeObra({ id: 'obra-2', nome: 'Obra Dois (teste)', ativa: true });
const PARADA = normalizeObra({ id: 'obra-3', nome: 'Obra Parada (teste)', ativa: false });

const CARLOS: MestreNaLista = {
  userId: 'm-1', nome: 'Carlos de Teste', ativo: true,
  obras: [{ vinculo: 7, obraId: 'obra-1', desde: '2026-10-01T10:00:00Z' }],
  ultimoQr: { porNome: 'Engenheira de Teste', em: '2026-10-04T13:00:00Z' },
  motivoDesligado: '',
};
const BRUNO: MestreNaLista = {
  userId: 'm-2', nome: 'Bruno de Teste', ativo: false, obras: [], ultimoQr: null, motivoDesligado: 'saiu da empresa',
};

const LINK = `https://banco-de-teste.invalid/auth/v1/verify?token=${'a1'.repeat(28)}&type=magiclink`;
const avisos = () => useUiStore.getState().toasts.map((t) => t.message);
const cartao = (id: string) => document.querySelector<HTMLElement>(`[data-mestre="${id}"]`)!;

beforeEach(() => {
  srv.ler = vi.fn(async () => [CARLOS, BRUNO]);
  srv.cadastrar = vi.fn(async () => ({ userId: 'm-9', aviso: '' }));
  srv.qr = vi.fn(async () => ({ link: LINK, venceEm: new Date(Date.now() + 10 * 60_000).toISOString() }));
  srv.por = vi.fn(async () => undefined);
  srv.tirar = vi.fn(async () => undefined);
  srv.desligar = vi.fn(async () => undefined);
  srv.religar = vi.fn(async () => undefined);
  useDataStore.setState({ data: { obras: [OBRA_1, OBRA_2, PARADA], ordens_compra: [], fornecedores: [] } as unknown as Data });
  useUiStore.setState({ toasts: [] });
});

async function montar() {
  render(<MestresPage />);
  await screen.findByText('Carlos de Teste');
}

describe('a lista', () => {
  it('cada mestre: as obras, o último QR; o desligado com o motivo e só o "Religar"', async () => {
    await montar();
    const c = cartao('m-1');
    expect(within(c).getByText(/Obra Um \(teste\)/)).toBeTruthy();
    expect(within(c).getByText(/Último QR: .*, por Engenheira de Teste\./)).toBeTruthy();
    expect(within(c).getByRole('button', { name: 'Gerar QR' })).toBeTruthy();
    const b = cartao('m-2');
    expect(within(b).getByText('Desligado')).toBeTruthy();
    expect(within(b).getByText('Motivo: saiu da empresa')).toBeTruthy();
    expect(within(b).queryByRole('button', { name: 'Gerar QR' })).toBeNull();
    expect(within(b).getByRole('button', { name: 'Religar' })).toBeTruthy();
    expect(within(b).getByText('Nenhum QR gerado ainda.')).toBeTruthy();
  });

  it('pôr numa obra: só as obras ativas em que ele ainda não está', async () => {
    await montar();
    const c = cartao('m-1');
    const opcoes = within(c).getAllByRole('option').map((o) => o.textContent);
    expect(opcoes).toEqual(['Pôr numa obra…', 'Obra Dois (teste)']);
    fireEvent.change(within(c).getByRole('combobox'), { target: { value: 'obra-2' } });
    await act(async () => {
      fireEvent.click(within(c).getByRole('button', { name: 'Pôr' }));
    });
    expect(srv.por).toHaveBeenCalledWith('m-1', 'obra-2');
    expect(avisos()).toContain('Carlos de Teste está na obra Obra Dois (teste).');
  });

  it('nenhum mestre: diz, e o cadastrar continua à vista', async () => {
    srv.ler = vi.fn(async () => []);
    render(<MestresPage />);
    expect(await screen.findByText(/Cadastre o primeiro mestre/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cadastrar mestre' })).toBeTruthy();
  });
});

describe('cadastrar', () => {
  it('o nome é obrigatório; com ele, cadastra com a obra e avisa para gerar o QR', async () => {
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar mestre' }));
    const d = document.querySelector<HTMLElement>('[data-dialogo-cadastrar]')!;
    fireEvent.click(within(d).getByRole('button', { name: 'Cadastrar' }));
    expect(within(d).getByRole('alert').textContent).toBe('Escreva o nome do mestre.');
    expect(srv.cadastrar).not.toHaveBeenCalled();
    fireEvent.change(within(d).getByLabelText(/Nome/), { target: { value: 'Davi de Teste' } });
    fireEvent.change(within(d).getByLabelText(/Obra/), { target: { value: 'obra-2' } });
    await act(async () => {
      fireEvent.click(within(d).getByRole('button', { name: 'Cadastrar' }));
    });
    expect(srv.cadastrar).toHaveBeenCalledWith({ nome: 'Davi de Teste', email: '', telefone: '', obraId: 'obra-2' });
    expect(avisos()).toContain('Davi de Teste cadastrado. Gere o QR para ele entrar.');
    expect(document.querySelector('[data-dialogo-cadastrar]')).toBeNull();
  });

  it('o cadastro foi mas a obra não: o aviso aparece; a recusa fica na caixa', async () => {
    srv.cadastrar = vi.fn(async () => ({ userId: 'm-9', aviso: 'O mestre foi cadastrado, mas não entrou na obra: x' }));
    await montar();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar mestre' }));
    let d = document.querySelector<HTMLElement>('[data-dialogo-cadastrar]')!;
    fireEvent.change(within(d).getByLabelText(/Nome/), { target: { value: 'Davi' } });
    await act(async () => {
      fireEvent.click(within(d).getByRole('button', { name: 'Cadastrar' }));
    });
    expect(avisos()).toContain('O mestre foi cadastrado, mas não entrou na obra: x');

    srv.cadastrar = vi.fn(async () => {
      throw new Error('Este e-mail já tem login na plataforma.');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar mestre' }));
    d = document.querySelector<HTMLElement>('[data-dialogo-cadastrar]')!;
    fireEvent.change(within(d).getByLabelText(/Nome/), { target: { value: 'Eva' } });
    await act(async () => {
      fireEvent.click(within(d).getByRole('button', { name: 'Cadastrar' }));
    });
    expect(within(d).getByRole('alert').textContent).toBe('Este e-mail já tem login na plataforma.');
  });
});

describe('tirar, desligar e religar', () => {
  it('tirar da obra pede o motivo, e manda o vínculo', async () => {
    await montar();
    fireEvent.click(within(cartao('m-1')).getByRole('button', { name: 'Tirar' }));
    const d = document.querySelector<HTMLElement>('[data-dialogo-motivo]')!;
    fireEvent.click(within(d).getByRole('button', { name: 'Tirar da obra' }));
    expect(within(d).getByRole('alert').textContent).toBe('Escreva o motivo.');
    fireEvent.change(within(d).getByLabelText(/Motivo/), { target: { value: 'terminou a etapa' } });
    await act(async () => {
      fireEvent.click(within(d).getByRole('button', { name: 'Tirar da obra' }));
    });
    expect(srv.tirar).toHaveBeenCalledWith(7, 'terminou a etapa');
    expect(avisos()).toContain('Carlos de Teste saiu da obra Obra Um (teste).');
  });

  it('desligar pede o motivo; religar vai direto', async () => {
    await montar();
    fireEvent.click(within(cartao('m-1')).getByRole('button', { name: 'Desligar' }));
    const d = document.querySelector<HTMLElement>('[data-dialogo-motivo]')!;
    fireEvent.change(within(d).getByLabelText(/Motivo/), { target: { value: 'saiu da obra' } });
    await act(async () => {
      fireEvent.click(within(d).getByRole('button', { name: 'Desligar' }));
    });
    expect(srv.desligar).toHaveBeenCalledWith('m-1', 'saiu da obra');
    await act(async () => {
      fireEvent.click(within(cartao('m-2')).getByRole('button', { name: 'Religar' }));
    });
    expect(srv.religar).toHaveBeenCalledWith('m-2');
    expect(avisos()).toContain('O acesso de Bruno de Teste voltou.');
  });
});

describe('o QR', () => {
  it('grande, com o tempo que falta; o QR leva à OC com o código depois do #, e nunca o link do servidor', async () => {
    await montar();
    await act(async () => {
      fireEvent.click(within(cartao('m-1')).getByRole('button', { name: 'Gerar QR' }));
    });
    expect(srv.qr).toHaveBeenCalledWith('m-1');
    const d = document.querySelector<HTMLElement>('[data-dialogo-qr]')!;
    expect(d.querySelector('svg[data-qr] path')!.getAttribute('d')!.length).toBeGreaterThan(100);
    expect(d.querySelector('[data-falta]')!.getAttribute('data-falta')).toMatch(/^(10:00|9:5\d)$/);
    expect(d.textContent).toMatch(/Quem ler este QR entra como Carlos de Teste/);
    // O que a câmera lê do QR da caixa: a OC, com o código depois do # — nunca o link do servidor.
    const svg = d.querySelector('svg[data-qr]')!;
    const lado = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
    expect(lerQrDoDesenho(lado, svg.querySelector('path')!.getAttribute('d')!)).toBe(
      `${window.location.origin}/#entrar=${'a1'.repeat(28)}&tipo=magiclink`,
    );
    expect(d.innerHTML).not.toContain('banco-de-teste.invalid');
  });

  it('vencido: o QR some, e o "Gerar outro" pede outro', async () => {
    srv.qr = vi.fn(async () => ({ link: LINK, venceEm: new Date(Date.now() - 1000).toISOString() }));
    await montar();
    await act(async () => {
      fireEvent.click(within(cartao('m-1')).getByRole('button', { name: 'Gerar QR' }));
    });
    const d = document.querySelector<HTMLElement>('[data-dialogo-qr]')!;
    expect(d.querySelector('svg[data-qr]')).toBeNull();
    expect(within(d).getByRole('alert').textContent).toMatch(/Este QR venceu/);
    await act(async () => {
      fireEvent.click(within(d).getByRole('button', { name: 'Gerar outro' }));
    });
    expect(srv.qr).toHaveBeenCalledTimes(2);
  });

  it('o relógio anda e, ao vencer, o QR some sozinho', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      srv.qr = vi.fn(async () => ({ link: LINK, venceEm: new Date(Date.now() + 3000).toISOString() }));
      await montar();
      await act(async () => {
        fireEvent.click(within(cartao('m-1')).getByRole('button', { name: 'Gerar QR' }));
      });
      const d = document.querySelector<HTMLElement>('[data-dialogo-qr]')!;
      expect(d.querySelector('svg[data-qr]')).not.toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      expect(d.querySelector('svg[data-qr]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('a recusa do servidor vira aviso, e nenhum QR abre', async () => {
    srv.qr = vi.fn(async () => {
      throw new Error('Mestre desligado.');
    });
    await montar();
    await act(async () => {
      fireEvent.click(within(cartao('m-1')).getByRole('button', { name: 'Gerar QR' }));
    });
    expect(avisos()).toContain('Mestre desligado.');
    expect(document.querySelector('[data-dialogo-qr]')).toBeNull();
  });
});
