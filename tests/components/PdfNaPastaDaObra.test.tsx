import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

/**
 * CTO-D685: o PDF da OC vai sozinho para a pasta da obra, pela
 * `guardar-oc-na-obra` do Banco. Por COMPORTAMENTO, nas duas portas (a
 * emissão da Nova OC e o "mandar de novo" do Histórico):
 *
 *   - o 200 NÃO salva de novo pela pasta do navegador nem baixa;
 *   - o 422, o 502 e a falta de resposta caem no caminho de hoje;
 *   - a falha não trava a emissão: a OC sai emitida, e o aviso diz a frase da função;
 *   - o Histórico mostra o ✓ com o link, e o "mandar de novo" chama a função.
 *
 * A função é FALSA (o `fetch` deste teste) e o endereço é `.invalid`: nada
 * sai daqui. Empresa, obra, OC e links são INVENTADOS.
 */

const ENDERECO = 'https://servidor-de-teste.invalid';

const sessao = vi.hoisted(() => ({ token: 'token-de-teste' as string | null }));
const pdfNaPasta = vi.hoisted(() => ({
  linhas: [] as Record<string, unknown>[],
  erro: null as { message: string } | null,
}));
vi.mock('../../src/services/supabase/client', () => {
  const resposta = () =>
    Promise.resolve(
      pdfNaPasta.erro
        ? { data: null, error: pdfNaPasta.erro, count: null }
        : { data: pdfNaPasta.linhas, error: null, count: pdfNaPasta.linhas.length },
    );
  const consulta = { select: () => consulta, order: () => consulta, range: resposta };
  return {
    supabase: {
      auth: { getSession: async () => ({ data: { session: sessao.token ? { access_token: sessao.token } : null } }) },
    },
    core: () => ({}),
    compras: () => ({ from: (t: string) => (t === 'oc_pdf_na_pasta' ? consulta : {}) }),
  };
});

const salvos = vi.hoisted(() => [] as { nome: string; pasta: boolean }[]);
vi.mock('../../src/services/pdf/generateOcPdf', () => ({
  generateOcPdfBlob: async () => new Blob(['%PDF-1.3 de teste']),
  savePdfToFile: async (_b: Blob, nome: string, pasta?: unknown) => {
    salvos.push({ nome, pasta: !!pasta });
    return pasta ? 'saved' : 'downloaded';
  },
}));
const pastaDoNavegador = vi.hoisted(() => ({ ligada: false }));
vi.mock('../../src/services/storage/handles', () => ({
  getObraDirHandle: async () => (pastaDoNavegador.ligada ? ({ nome: 'pasta ligada' } as unknown) : undefined),
}));
vi.mock('../../src/services/storage/permissions', () => ({ verifyHandlePermission: async () => true }));
const banco = vi.hoisted(() => ({ salvar: 0, carimbo: 0 }));
vi.mock('../../src/services/supabase/dados', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/dados')>()),
  salvarOrdemCompra: async () => {
    banco.salvar += 1;
    return { id: 'oc-teste', status: 'emitida', numero: '2026/099', ano: 2026, sequencial: 99, versao: 2 };
  },
  marcarPdfGerado: async () => {
    banco.carimbo += 1;
  },
}));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn(async () => {}) }));

import { NovaOcPage } from '../../src/features/ordens-compra/NovaOcPage';
import { HistoricoPage } from '../../src/features/ordens-compra/HistoricoPage';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { useDataStore } from '../../src/stores/useDataStore';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUiStore } from '../../src/stores/useUiStore';
import type { Data, Fornecedor } from '../../src/domain/types';

const COMARCO: Fornecedor = {
  ...normalizeFornecedor({ id: 'com', razao_social: 'COMARCO COMERCIAL (teste)' }),
  fornece_material: true,
  bloqueado_para_compra_nova: false,
  empresa_id: 'e-com',
  empresa_apelido: 'Comarco',
};
const OBRA = {
  ...normalizeObra({ id: 'obra-teste', nome: 'Obra de teste' }),
  destinatario: {
    nome: 'Destinatário de teste',
    documento: '00000000000000',
    tipo: 'pj' as const,
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
  },
};
const OC = normalizeOC({
  id: 'oc-teste', numero: '2026/099', status: 'emitida', fornecedor_id: 'com', obra_id: OBRA.id, data: '2026-09-18',
  condicao_pagamento: 'À vista', versao: 1,
  itens: [normalizeItem({ descricao: 'Item de teste', quantidade: 1, unidade: 'un', preco_unit: 263.29 })],
});
const OUTRA = normalizeOC({ ...OC, id: 'oc-outra', numero: '2026/098', criado_em: '2026-09-01T00:00:00Z' });
const NOME = 'comarco 2026-09-18 R-263-29 oc.pdf';

function dados(): Data {
  return {
    schema_version: 5, version: 1, app_name: '', shared_file_name: '', seeded_at: '', last_saved: '',
    config: {
      emitentes: [], endereco_cobranca: {}, ultimo_numero_oc: 0, ano_corrente: 2026,
      condicoes_pagamento: ['À vista'], texto_condicoes_contratacao: '', texto_envio_nf: '',
      texto_qualidade: '', pasta_backups: '',
    },
    fornecedores: [COMARCO], obras: [OBRA], ecrs: [], ordens_compra: [OC, OUTRA],
  } as unknown as Data;
}

/** A função falsa: o que ela responde, e o que chegou nela. */
const funcao = vi.hoisted(() => ({
  responde: null as null | { status: number; corpo: unknown } | 'cai' | 'nunca',
  chamadas: [] as { url: string; headers: Record<string, string>; corpo: Record<string, unknown> }[],
}));
const fetchFalso = vi.fn(async (url: string, init: RequestInit) => {
  funcao.chamadas.push({
    url,
    headers: init.headers as Record<string, string>,
    corpo: JSON.parse(String(init.body)) as Record<string, unknown>,
  });
  const r = funcao.responde;
  if (r === 'cai') throw new TypeError('Failed to fetch');
  if (r === 'nunca') {
    return new Promise<Response>((_ok, falha) => {
      init.signal?.addEventListener('abort', () => falha(new DOMException('parou', 'AbortError')));
    });
  }
  return new Response(JSON.stringify(r!.corpo), { status: r!.status, headers: { 'Content-Type': 'application/json' } });
});

const GRAVADO = {
  status: 200,
  corpo: {
    desfecho: 'gravado', mensagem: `PDF guardado na pasta da obra como "${NOME}".`, nome: NOME,
    web_url: 'https://pasta-de-teste.invalid/oc.pdf', item_id: 'item-teste', registrado: true,
  },
};
const FALHOU = 'O PDF não foi para a pasta da obra (teste). A OC está emitida do mesmo jeito; ' +
  'o PDF ficou baixado neste aparelho, e dá para mandar de novo pelo Histórico.';

const toasts = () => useUiStore.getState().toasts.map((t) => t.message);

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', ENDERECO);
  vi.stubGlobal('fetch', fetchFalso);
  fetchFalso.mockClear();
  funcao.responde = GRAVADO;
  funcao.chamadas.length = 0;
  salvos.length = 0;
  banco.salvar = 0;
  banco.carimbo = 0;
  sessao.token = 'token-de-teste';
  pastaDoNavegador.ligada = false;
  pdfNaPasta.linhas = [];
  pdfNaPasta.erro = null;
  useDataStore.setState({ data: dados() });
  useAuthStore.setState({ perfil: { papel: 'admin' } as never });
  useUiStore.setState({ toasts: [], activeTab: 'nova-oc' } as never);
  useOcEditingStore.getState().stopEditing();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** Emite e espera o fim: o aviso na tela. Ler os bytes do PDF termina depois do clique. */
async function emitir() {
  useOcEditingStore.getState().startEditing({ ...OC, status: 'rascunho', numero: '' });
  render(<NovaOcPage />);
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Emitir OC \+ Gerar PDF/ }));
  });
  await waitFor(() => expect(toasts()).toHaveLength(1));
}

/** Clica no botão de mandar da OC e espera o aviso. */
async function mandar(linha: HTMLElement, nome: string) {
  await act(async () => {
    fireEvent.click(within(linha).getByRole('button', { name: nome }));
  });
  await waitFor(() => expect(toasts()).toHaveLength(1));
}

describe('D685 — ao emitir, o Graph primeiro', () => {
  it('chama a função com a OC já emitida, o PDF em base64 e o nome com o apelido; só o token, sem apikey', async () => {
    await emitir();
    expect(funcao.chamadas).toHaveLength(1);
    const [c] = funcao.chamadas;
    expect(c!.url).toBe(`${ENDERECO}/functions/v1/guardar-oc-na-obra`);
    expect(c!.corpo).toEqual({ oc_id: 'oc-teste', pdf_base64: btoa('%PDF-1.3 de teste'), nome_arquivo: NOME });
    expect(c!.headers).toEqual({ Authorization: 'Bearer token-de-teste', 'Content-Type': 'application/json' });
    expect(banco.salvar).toBe(1);
  });

  it('200: NÃO salva de novo — nem pela pasta do navegador, nem baixando — e o aviso diz a frase da função', async () => {
    pastaDoNavegador.ligada = true;
    await emitir();
    expect(salvos).toEqual([]);
    expect(toasts()).toEqual([`OC 2026/099 emitida. PDF guardado na pasta da obra como "${NOME}".`]);
    expect(banco.carimbo).toBe(1);
    expect(useUiStore.getState().activeTab).toBe('historico');
  });

  it('422: cai no caminho de hoje (o download), e a emissão sai do mesmo jeito', async () => {
    funcao.responde = { status: 422, corpo: { desfecho: 'sem_pasta', mensagem: FALHOU } };
    await emitir();
    expect(salvos).toEqual([{ nome: NOME, pasta: false }]);
    expect(toasts()).toEqual([`OC 2026/099: ${FALHOU}`]);
    expect(useUiStore.getState().activeTab).toBe('historico');
    expect(useOcEditingStore.getState().ocEditing).toBeNull();
  });

  it('502: cai na pasta ligada neste navegador, quando há uma', async () => {
    pastaDoNavegador.ligada = true;
    funcao.responde = { status: 502, corpo: { desfecho: 'falhou', mensagem: FALHOU } };
    await emitir();
    expect(salvos).toEqual([{ nome: NOME, pasta: true }]);
    expect(banco.carimbo).toBe(1);
  });

  it('a função não responde (a rede cai): o download, e a OC emitida', async () => {
    funcao.responde = 'cai';
    await emitir();
    expect(salvos).toEqual([{ nome: NOME, pasta: false }]);
    expect(toasts()[0]).toMatch(/^OC 2026\/099 emitida\. O PDF não foi para a pasta da obra: A pasta da obra não respondeu\./);
    expect(useUiStore.getState().activeTab).toBe('historico');
  });

  it('a função fica pendurada: o relógio corta, e a emissão não fica presa', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    funcao.responde = 'nunca';
    useOcEditingStore.getState().startEditing({ ...OC, status: 'rascunho', numero: '' });
    render(<NovaOcPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Emitir OC \+ Gerar PDF/ }));
    });
    await vi.waitFor(() => expect(funcao.chamadas).toHaveLength(1));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(29_000);
    });
    expect(salvos).toEqual([]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });
    await vi.waitFor(() => expect(toasts()).toHaveLength(1));
    expect(salvos).toEqual([{ nome: NOME, pasta: false }]);
    expect(toasts()[0]).toContain('A pasta da obra demorou demais para responder.');
  });

  it('sem sessão a função nem é chamada, e o PDF sai pelo caminho de hoje', async () => {
    sessao.token = null;
    await emitir();
    expect(fetchFalso).not.toHaveBeenCalled();
    expect(salvos).toEqual([{ nome: NOME, pasta: false }]);
  });
});

describe('D685 — no Histórico, o ✓ com o link e o "mandar de novo"', () => {
  it('a OC na pasta mostra o ✓ com o link; a outra, "Não está"', async () => {
    pdfNaPasta.linhas = [{ oc_id: 'oc-teste', web_url: 'https://pasta-de-teste.invalid/oc.pdf', nome: NOME, gravado_em: '', vezes: 1 }];
    await act(async () => {
      render(<HistoricoPage />);
    });
    const linha = screen.getByText('2026/099').closest('tr')!;
    const link = within(linha).getByRole('link', { name: /Na pasta/ });
    expect(link.getAttribute('href')).toBe('https://pasta-de-teste.invalid/oc.pdf');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(within(linha).getByRole('button', { name: 'Reenviar' })).toBeTruthy();
    const outra = screen.getByText('2026/098').closest('tr')!;
    expect(within(outra).getByText('Não está')).toBeTruthy();
    expect(within(outra).getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });

  it('o link que não é https não vira link', async () => {
    pdfNaPasta.linhas = [{ oc_id: 'oc-teste', web_url: 'javascript:alert(1)', nome: NOME, gravado_em: '', vezes: 1 }];
    await act(async () => {
      render(<HistoricoPage />);
    });
    const linha = screen.getByText('2026/099').closest('tr')!;
    expect(within(linha).queryByRole('link')).toBeNull();
    expect(within(linha).getByText(/Na pasta/)).toBeTruthy();
  });

  it('sem o ✓ lido (a tabela não respondeu), nenhuma OC aparece como "Não está"; o botão continua', async () => {
    pdfNaPasta.erro = { message: 'relation "compras.oc_pdf_na_pasta" does not exist' };
    await act(async () => {
      render(<HistoricoPage />);
    });
    expect(screen.queryByText('Não está')).toBeNull();
    expect(screen.queryByRole('link', { name: /Na pasta/ })).toBeNull();
    const linha = screen.getByText('2026/099').closest('tr')!;
    expect(within(linha).getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });

  it('quem só lê e o ✓ que não veio: nada debaixo do status', async () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    pdfNaPasta.erro = { message: 'sem acesso' };
    let tela!: ReturnType<typeof render>;
    await act(async () => {
      tela = render(<HistoricoPage />);
    });
    expect(tela.container.querySelector('[data-pasta-da-oc]')).toBeNull();
  });

  it('a OC cancelada não mostra nem ✓ nem botão', async () => {
    useDataStore.setState({ data: { ...dados(), ordens_compra: [{ ...OC, status: 'cancelada' }] } });
    pdfNaPasta.linhas = [{ oc_id: 'oc-teste', web_url: 'https://pasta-de-teste.invalid/oc.pdf', nome: NOME, gravado_em: '', vezes: 1 }];
    await act(async () => {
      render(<HistoricoPage />);
    });
    expect(screen.queryByRole('link', { name: /Na pasta/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^(Enviar|Reenviar)$/ })).toBeNull();
  });

  it('"mandar de novo" chama a função com a OC e o nome; com 200 não baixa nada, e o ✓ é relido', async () => {
    await act(async () => {
      render(<HistoricoPage />);
    });
    pdfNaPasta.linhas = [{ oc_id: 'oc-teste', web_url: 'https://pasta-de-teste.invalid/oc.pdf', nome: NOME, gravado_em: '', vezes: 2 }];
    const linha = screen.getByText('2026/099').closest('tr')!;
    await mandar(linha, 'Enviar');
    expect(funcao.chamadas.map((c) => [c.corpo['oc_id'], c.corpo['nome_arquivo']])).toEqual([['oc-teste', NOME]]);
    expect(salvos).toEqual([]);
    expect(toasts()).toEqual([`OC 2026/099: PDF guardado na pasta da obra como "${NOME}".`]);
    await waitFor(() => expect(within(linha).getByRole('link', { name: /Na pasta/ })).toBeTruthy());
  });

  it('"mandar de novo" que falha cai no caminho de hoje, como na emissão', async () => {
    funcao.responde = { status: 502, corpo: { desfecho: 'falhou', mensagem: FALHOU } };
    await act(async () => {
      render(<HistoricoPage />);
    });
    const linha = screen.getByText('2026/099').closest('tr')!;
    await mandar(linha, 'Enviar');
    expect(salvos).toEqual([{ nome: NOME, pasta: false }]);
    expect(toasts()).toEqual([`OC 2026/099: ${FALHOU}`]);
  });

  it('quem só lê vê o ✓, mas não o botão: a função recusaria o papel', async () => {
    useAuthStore.setState({ perfil: { papel: 'leitura' } as never });
    pdfNaPasta.linhas = [{ oc_id: 'oc-teste', web_url: 'https://pasta-de-teste.invalid/oc.pdf', nome: NOME, gravado_em: '', vezes: 1 }];
    await act(async () => {
      render(<HistoricoPage />);
    });
    expect(screen.getByRole('link', { name: /Na pasta/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^(Enviar|Reenviar)$/ })).toBeNull();
  });
});
