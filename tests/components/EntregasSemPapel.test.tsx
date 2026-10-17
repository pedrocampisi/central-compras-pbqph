import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

/**
 * CTO-D840 §2.5 e D845 §2: a lista "Entregas sem papel do fornecedor", em
 * Recebimentos, por COMPORTAMENTO. O banco é FALSO, nos nomes do contrato do
 * Banco (D840) e dos pedidos da D845. Obras, empresas, pessoas e o texto das
 * ECRs são INVENTADOS.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));
const banco = vi.hoisted(() => ({ mascara: null as string | null }) as {
  ler: Mock; marcar: Mock; arquivar: Mock; guardar: Mock; carregar: Mock; mascara: string | null;
});
vi.mock('../../src/services/supabase/entregasSemPapel', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/entregasSemPapel')>()),
  lerEntregasSemPapel: (...a: unknown[]) => banco.ler(...a),
  marcarNaoSeAplica: (...a: unknown[]) => banco.marcar(...a),
}));
vi.mock('../../src/services/supabase/registrosDoFornecedor', () => ({
  carregarRegistrosDoFornecedor: () => banco.carregar(),
  prepararPapel: async () => ({ base64: 'JVBERg==', mime: 'application/pdf' }),
  lerPapelDoFornecedor: async () => null,
  arquivarPapelDoFornecedor: (...a: unknown[]) => banco.arquivar(...a),
  guardarRegistroDoFornecedor: (...a: unknown[]) => banco.guardar(...a),
  corrigirRegistroDoFornecedor: vi.fn(),
}));
vi.mock('../../src/services/supabase/recebimento', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/recebimento')>()),
  lerFilaSemPedido: async () => [],
  lerLinksDasFotos: async () => new Map(),
}));
vi.mock('../../src/services/storage/umaObra', async (original) => ({
  ...(await original<typeof import('../../src/services/storage/umaObra')>()),
  obraDaMascara: () => banco.mascara,
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn() }));

import { RecebimentosPage } from '../../src/features/recebimento/RecebimentosPage';
import { normalizeFornecedor, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import type { EntregaSemPapel } from '../../src/domain/entregasSemPapel';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useDataStore } from '../../src/stores/useDataStore';
import { useEntregasSemPapelStore } from '../../src/stores/useEntregasSemPapelStore';
import { useRegistrosStore } from '../../src/stores/useRegistrosStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data } from '../../src/domain/types';

const FORNECEDOR = normalizeFornecedor({ id: 'forn-1', razao_social: 'Fornecedor de Teste' });
const OBRA = normalizeObra({ id: 'obra-1', nome: 'Obra de Teste' });
const OUTRA = normalizeObra({ id: 'obra-2', nome: 'Outra Obra' });

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '', texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [FORNECEDOR], obras: [OBRA, OUTRA], ecrs: [],
    ordens_compra: [
      normalizeOC({ id: 'oc-1', status: 'entregue', numero: '2026/101', fornecedor_id: FORNECEDOR.id, obra_id: OBRA.id, versao: 4 }),
      normalizeOC({ id: 'oc-2', status: 'entregue', numero: '2026/201', fornecedor_id: FORNECEDOR.id, obra_id: OUTRA.id, versao: 2 }),
    ],
  } as unknown as Data;
}

const linha = (o: Partial<EntregaSemPapel>): EntregaSemPapel => ({
  avaliacaoId: 31, ocId: 'oc-1', numero: '2026/101', obra: 'Obra de Teste', fornecedor: 'Fornecedor de Teste',
  fornecedorId: '', recebidoEm: '2026-10-10', notaFiscal: '4567', avaliadoPorNome: 'Encarregado de Teste',
  ecrId: 6, ecr: 'ECR 06', nome: 'Aço (teste)', posicoes: [2], porque: 'nada guardado ainda',
  linhas: [{ rotulo: null, texto: 'Certificado da usina (teste)', numerado: true }],
  observacao: '', aCadaEntrega: false, ...o,
});

/** Duas entregas: a da madeira, com a marca "a cada entrega", e a do aço, mais antiga. */
const MADEIRA = linha({
  avaliacaoId: 32, recebidoEm: '2026-10-12', ecrId: 2, ecr: 'ECR 02', nome: 'Madeira (teste)', porque: 'a cada entrega',
  aCadaEntrega: true, posicoes: [1], observacao: 'o motorista disse que a guia vem por e-mail (teste)',
  linhas: [{ rotulo: 'GCA', texto: 'a guia de cada transporte (teste)', numerado: true }],
});
const ACO = linha({});

const secao = () => document.querySelector<HTMLElement>('[data-entregas-sem-papel]')!;
const cartao = (chave: string) => secao().querySelector<HTMLElement>(`[data-sem-papel="${chave}"]`)!;
const arquivo = () => new File([new Uint8Array([37, 80, 68, 70])], 'papel.pdf', { type: 'application/pdf' });

async function abrir() {
  render(<RecebimentosPage />);
  await waitFor(() => expect(secao().querySelectorAll('[data-sem-papel]').length).toBeGreaterThan(0));
}

beforeEach(() => {
  banco.mascara = null;
  banco.ler = vi.fn(async () => [MADEIRA, ACO]);
  banco.marcar = vi.fn(async () => undefined);
  banco.arquivar = vi.fn(async () => 'doc-novo');
  banco.guardar = vi.fn(async () => 50);
  banco.carregar = vi.fn(async () => ({ registros: [], marcas: [] }));
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [] });
  useEntregasSemPapelStore.setState({ linhas: null, erro: '', carregando: false });
  useRegistrosStore.setState({ dados: null, erro: '', carregando: false });
});

describe('a lista das entregas sem papel (D840 §2.5)', () => {
  it('vem acima do "chegou sem pedido", da mais antiga para a mais nova, com as palavras da ECR e o porquê do banco', async () => {
    await abrir();
    const pagina = document.body.textContent!;
    expect(pagina.indexOf('Entregas sem papel do fornecedor')).toBeLessThan(pagina.indexOf('Chegou sem pedido'));
    const chaves = [...secao().querySelectorAll<HTMLElement>('[data-sem-papel]')].map((c) => c.dataset['semPapel']);
    expect(chaves).toEqual(['31-6', '32-2']);
    const m = cartao('32-2');
    expect(m.textContent).toContain('ECR 02 — Madeira (teste)');
    expect(m.textContent).toContain('OC 2026/101');
    expect(m.textContent).toContain('Chegou em 12/10/2026');
    expect(m.textContent).toContain('a cada entrega');
    expect(m.textContent).toContain('o motorista disse que a guia vem por e-mail (teste)');
    expect(m.textContent).toContain('Encarregado de Teste');
    expect(within(m).getByText('GCA: a guia de cada transporte (teste)')).toBeTruthy();
  });

  it('sem linhas, ela diz', async () => {
    banco.ler = vi.fn(async () => []);
    render(<RecebimentosPage />);
    expect(await within(secao()).findByText('Nenhuma entrega sem papel.')).toBeTruthy();
  });

  it('a máscara de uma obra vai na busca, e a linha de outra obra não aparece', async () => {
    banco.mascara = 'obra-1';
    banco.ler = vi.fn(async () => [ACO, linha({ avaliacaoId: 40, ocId: 'oc-2', numero: '2026/201' })]);
    await abrir();
    expect(banco.ler).toHaveBeenCalledWith('obra-1');
    expect(secao().querySelectorAll('[data-sem-papel]')).toHaveLength(1);
    expect(secao().textContent).not.toContain('2026/201');
  });

  it('quem só lê não vê a lista nem as ações, e a lista nem é pedida ao banco', async () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    render(<RecebimentosPage />);
    await screen.findByText('Chegou sem pedido');
    expect(document.querySelector('[data-entregas-sem-papel]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Anexar papel' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Não se aplica a esta entrega' })).toBeNull();
    expect(banco.ler).not.toHaveBeenCalled();
  });

  it('a falha avisa, com "Tentar de novo", e não finge lista vazia', async () => {
    banco.ler = vi.fn().mockRejectedValueOnce(new Error('sem rede (teste)')).mockResolvedValue([ACO]);
    render(<RecebimentosPage />);
    const alerta = await within(secao()).findByRole('alert');
    expect(alerta.textContent).toContain('Não consegui ler as entregas sem papel: sem rede (teste)');
    expect(within(secao()).queryByText('Nenhuma entrega sem papel.')).toBeNull();
    fireEvent.click(within(alerta).getByRole('button', { name: 'Tentar de novo' }));
    await waitFor(() => expect(cartao('31-6')).toBeTruthy());
    expect(within(secao()).queryByRole('alert')).toBeNull();
  });
});

describe('"Anexar papel", pela entrega', () => {
  it('a janela fala da entrega e da ECR; guarda com a OC de envelope e a entrega que o papel cobre; a lista lê de novo', async () => {
    await abrir();
    banco.ler.mockResolvedValue([MADEIRA]);
    fireEvent.click(within(cartao('31-6')).getByRole('button', { name: 'Anexar papel' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    expect(janela.textContent).toContain('OC 2026/101 · Fornecedor de Teste · entrega de 10/10/2026');
    expect(janela.textContent).toContain('ECR 06 — Aço (teste)');
    fireEvent.change(janela.querySelector('input[type="file"]')!, { target: { files: [arquivo()] } });
    // Sem a marca, os três alcances; sem leitura, deste lote.
    await waitFor(() => expect(within(janela).getByLabelText<HTMLInputElement>('Deste lote').checked).toBe(true));
    expect(within(janela).getByLabelText('Vale até uma data')).toBeTruthy();
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    await waitFor(() => expect(banco.guardar).toHaveBeenCalledTimes(1));
    const onde = { ocId: 'oc-1', fornecedorId: 'forn-1', avaliacaoId: 31, posicoes: [2] };
    expect(banco.arquivar).toHaveBeenCalledWith({ base64: 'JVBERg==', mime: 'application/pdf' }, 'papel.pdf', 6, onde, undefined);
    expect(banco.guardar).toHaveBeenCalledWith({ documentoId: 'doc-novo', ecrId: 6, alcance: 'lote', validoAte: '', onde });
    // O papel tirou a linha: quem diz é o banco, lendo de novo.
    await waitFor(() => expect(secao().querySelector('[data-sem-papel="31-6"]')).toBeNull());
    expect(banco.ler).toHaveBeenCalledTimes(2);
    expect(banco.carregar).toHaveBeenCalled();
  });

  it('na ECR com a marca "a cada entrega", é deste lote, sem escolha, e a janela diz que vale para esta entrega', async () => {
    await abrir();
    fireEvent.click(within(cartao('32-2')).getByRole('button', { name: 'Anexar papel' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-anexar]')!;
    fireEvent.change(janela.querySelector('input[type="file"]')!, { target: { files: [arquivo()] } });
    await waitFor(() => expect(janela.querySelector('[data-alcance-fixo="lote"]')).not.toBeNull());
    expect(janela.querySelectorAll('[data-alcance-escolha] input[type="radio"]')).toHaveLength(0);
    expect(janela.textContent).toContain('Este papel vale para esta entrega.');
    fireEvent.click(within(janela).getByRole('button', { name: 'Guardar papel' }));
    await waitFor(() => expect(banco.guardar).toHaveBeenCalledTimes(1));
    expect(banco.guardar.mock.calls[0]![0]).toMatchObject({
      ecrId: 2, alcance: 'lote', onde: { ocId: 'oc-1', avaliacaoId: 32 },
    });
  });
});

describe('"Não se aplica a esta entrega"', () => {
  it('diz, antes de gravar, que a marca não se desfaz; sem motivo não vai; com ele, vai, e a lista lê de novo', async () => {
    await abrir();
    fireEvent.click(within(cartao('31-6')).getByRole('button', { name: 'Não se aplica a esta entrega' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-nao-se-aplica]')!;
    expect(janela.querySelector('[data-nao-se-desfaz]')!.textContent).toMatch(/^A marca não se desfaz/);
    expect(janela.textContent).toContain('ECR 06 — Aço (teste)');

    fireEvent.change(within(janela).getByRole('textbox'), { target: { value: '   ' } });
    fireEvent.click(within(janela).getByRole('button', { name: 'Marcar que não se aplica' }));
    expect(within(janela).getByRole('alert').textContent).toBe('Escreva o motivo: ele fica no registro da entrega.');
    expect(banco.marcar).not.toHaveBeenCalled();

    banco.ler.mockResolvedValue([MADEIRA]);
    fireEvent.change(within(janela).getByRole('textbox'), { target: { value: 'é sobra da obra anterior (teste)' } });
    fireEvent.click(within(janela).getByRole('button', { name: 'Marcar que não se aplica' }));
    await waitFor(() => expect(banco.marcar).toHaveBeenCalledWith(31, 6, 'é sobra da obra anterior (teste)'));
    await waitFor(() => expect(secao().querySelector('[data-sem-papel="31-6"]')).toBeNull());
    expect(document.querySelector('[data-dialogo-nao-se-aplica]')).toBeNull();
  });

  it('a recusa do banco fica na janela, e a linha continua', async () => {
    banco.marcar = vi.fn(async () => {
      throw new Error('Esta entrega já tem o papel (teste).');
    });
    await abrir();
    fireEvent.click(within(cartao('31-6')).getByRole('button', { name: 'Não se aplica a esta entrega' }));
    const janela = document.querySelector<HTMLElement>('[data-dialogo-nao-se-aplica]')!;
    fireEvent.change(within(janela).getByRole('textbox'), { target: { value: 'motivo (teste)' } });
    fireEvent.click(within(janela).getByRole('button', { name: 'Marcar que não se aplica' }));
    expect((await within(janela).findByRole('alert')).textContent).toBe('Esta entrega já tem o papel (teste).');
    expect(cartao('31-6')).toBeTruthy();
  });
});
