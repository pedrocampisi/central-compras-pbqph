import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

/**
 * "Mostrar só uma obra" (CTO-D599), com o `App` de verdade sobre um banco
 * FALSO: a consulta falsa registra o filtro de cada busca e devolve só as
 * linhas que o filtro pede, como o PostgREST. Duas obras inventadas, uma OC
 * em cada. Nada sai daqui.
 */

const banco = vi.hoisted(() => {
  const TABELAS: Record<string, Record<string, unknown>[]> = {
    'core.intervencoes': [
      { id: 'obra-a', descricao_curta: 'Obra Alfa (teste)', ativa: true },
      { id: 'obra-b', descricao_curta: 'Obra Beta (teste)', ativa: true },
    ],
    'compras.ordens_compra': [
      { id: 'oc-1', numero: '2026/001', ano: 2026, sequencial: 1, status: 'emitida', data: '2026-09-01', intervencao_id: 'obra-a', itens: [] },
      { id: 'oc-2', numero: '2026/002', ano: 2026, sequencial: 2, status: 'emitida', data: '2026-09-02', intervencao_id: 'obra-b', itens: [] },
    ],
  };
  const estado = {
    pode: true,
    registro: [] as { tabela: string; filtros: [string, string][] }[],
    avisos: [] as Record<string, unknown>[],
    // Medidas da perícia de 28/09: segurar a resposta de uma busca (o `then`
    // guarda a entrega em `presos`, e o teste solta quando quiser).
    segurar: null as null | ((r: { tabela: string; filtros: [string, string][] }) => boolean),
    presos: [] as (() => void)[],
  };
  function consulta(tabela: string) {
    const reg = { tabela, filtros: [] as [string, string][] };
    estado.registro.push(reg);
    // Como a API: conta quando pedem ({ count: 'exact' }) e devolve a página (range).
    let contar = false;
    let pagina: [number, number] | null = null;
    const q: Record<string, unknown> = {
      select: (_colunas: string, opcoes?: { count?: string }) => {
        contar = opcoes?.count === 'exact';
        return q;
      },
      order: () => q,
      range: (de: number, ate: number) => {
        pagina = [de, ate];
        return q;
      },
      eq: (coluna: string, valor: string) => {
        reg.filtros.push([coluna, valor]);
        return q;
      },
      then: (ok: (r: unknown) => void) => {
        if (estado.segurar?.(reg)) {
          estado.presos.push(() => entregar(ok));
          return;
        }
        return entregar(ok);
      },
    };
    function entregar(ok: (r: unknown) => void) {
      const linhas = (TABELAS[tabela] ?? []).filter((l) => reg.filtros.every(([c, v]) => l[c] === v));
      return ok({
        data: pagina ? linhas.slice(pagina[0], pagina[1] + 1) : linhas,
        error: null,
        ...(contar ? { count: linhas.length } : {}),
      });
    }
    return q;
  }
  const canal: Record<string, unknown> = {
    on: (_evento: string, opcoes: Record<string, unknown>) => {
      estado.avisos.push(opcoes);
      return canal;
    },
    subscribe: () => canal,
  };
  return { estado, consulta, canal };
});

vi.mock('../../src/services/supabase/client', () => ({
  supabase: {
    auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) },
    channel: () => banco.canal,
    removeChannel: async () => 'ok',
  },
  core: () => ({
    from: (t: string) => banco.consulta(`core.${t}`),
    rpc: async () => ({ data: banco.estado.pode, error: null }),
  }),
  compras: () => ({ from: (t: string) => banco.consulta(`compras.${t}`) }),
}));
vi.mock('../../src/services/supabase/auth', async (original) => ({
  ...(await original<typeof import('../../src/services/supabase/auth')>()),
  sessaoAtual: async () => ({ access_token: 'falso', user: { id: 'prova', email: 'prova@exemplo.invalid' } }),
  perfilAtual: async () => ({ user_id: 'prova', nome: 'Pessoa de Prova', papel: 'admin', ativo: true }),
  sair: async () => {},
}));

import App from '../../src/App';
import { ABA_INICIAL, useUiStore, type TabId } from '../../src/stores/useUiStore';
import { useDataStore } from '../../src/stores/useDataStore';
import { useOcEditingStore } from '../../src/stores/useOcEditingStore';
import { useUmaObraStore } from '../../src/stores/useUmaObraStore';
import { janelaEscolhida, type MascaraDeObra } from '../../src/domain/umaObra';
import { normalizeOC } from '../../src/domain/normalize';
import { recarregarDados } from '../../src/services/supabase/sync';

const { inicio, fim } = janelaEscolhida('2026-11-16', '00:00', '2026-11-17', '23:59');
const AUDITORIA: MascaraDeObra = {
  obraId: 'obra-a',
  obraNome: 'Obra Alfa (teste)',
  inicio: inicio.toISOString(),
  fim: fim.toISOString(),
  ensaio: false,
};

window.matchMedia ??= ((q: string) => ({
  matches: false, media: q, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

function relogio(iso: string) {
  vi.setSystemTime(new Date(iso));
}

async function armadaParaAuditoria() {
  localStorage.setItem('oc-mostrar-uma-obra', JSON.stringify(AUDITORIA));
}

async function abrir() {
  render(<App />);
  await screen.findByText('Últimas Ordens de Compra');
  await act(async () => {});
}

async function aba(id: TabId) {
  await act(async () => useUiStore.getState().setActiveTab(id));
}

const pagina = () => document.querySelector('main') ?? document.body;
const buscas = (tabela: string) => banco.estado.registro.filter((r) => r.tabela === tabela);
const ultimaBusca = (tabela: string) => buscas(tabela).at(-1)!;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  relogio('2026-09-27T15:00:00Z');
  localStorage.clear();
  banco.estado.pode = true;
  banco.estado.registro = [];
  banco.estado.avisos = [];
  banco.estado.segurar = null;
  banco.estado.presos = [];
  useDataStore.setState({ data: null, dirty: false, dirtySince: null });
  useUiStore.setState({ activeTab: ABA_INICIAL });
  useOcEditingStore.getState().stopEditing();
  useUmaObraStore.getState().conferir();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('D599 §4.1 — com a máscara ligada, cada busca pede só a obra, e cada tela mostra só ela', () => {
  it('sem máscara: as buscas não filtram, e aparecem as duas obras', async () => {
    await abrir();
    expect(ultimaBusca('core.intervencoes').filtros).toEqual([]);
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([]);
    expect(pagina().textContent).toContain('2026/001');
    expect(pagina().textContent).toContain('2026/002');
  });

  it('dentro da janela: a obra pelo id, as OCs pela intervencao_id, o aviso de mudanças também — e nada mais filtra', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-16T15:00:00Z');
    useUmaObraStore.getState().conferir();
    await abrir();

    expect(ultimaBusca('core.intervencoes').filtros).toEqual([['id', 'obra-a']]);
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([['intervencao_id', 'obra-a']]);
    for (const outra of ['core.fornecedores', 'core.fornecedor_resolvido', 'compras.ecrs', 'compras.numeracao', 'compras.fornecedor_ecrs']) {
      expect(ultimaBusca(outra).filtros, outra).toEqual([]);
    }
    const avisoDasOcs = banco.estado.avisos.find((a) => a['table'] === 'ordens_compra')!;
    expect(avisoDasOcs['filter']).toBe('intervencao_id=eq.obra-a');

    // Dashboard
    expect(pagina().textContent).toContain('2026/001');
    expect(pagina().textContent).not.toMatch(/2026\/002|Beta/);

    // Obras
    await aba('obras');
    expect(screen.getByText('Obra Alfa (teste)')).toBeInTheDocument();
    expect(pagina().textContent).not.toContain('Beta');

    // Histórico
    await aba('historico');
    expect(pagina().textContent).toContain('2026/001');
    expect(pagina().textContent).not.toMatch(/2026\/002|Beta/);

    // Nova OC: a lista de obras aberta, só com ela
    await aba('nova-oc');
    const campo = await screen.findByRole('combobox', { name: /Obra/ });
    fireEvent.click(campo);
    fireEvent.focus(campo);
    const opcoes = within(await screen.findByRole('listbox')).getAllByRole('option').map((o) => o.textContent);
    expect(opcoes.some((o) => o?.includes('Obra Alfa (teste)'))).toBe(true);
    expect(opcoes.some((o) => o?.includes('Beta'))).toBe(false);
  });

  it('às 23:59:59 de 15/11 (Brasília), tudo aparece', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-16T02:59:59Z');
    useUmaObraStore.getState().conferir();
    await abrir();
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([]);
    expect(pagina().textContent).toContain('2026/002');
  });

  it('às 00:00:00 de 18/11 (Brasília), tudo aparece, e a opção se desarma', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-18T03:00:00Z');
    useUmaObraStore.getState().conferir();
    await abrir();
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([]);
    expect(pagina().textContent).toContain('2026/002');
    expect(localStorage.getItem('oc-mostrar-uma-obra')).toBeNull();
  });

  it('liga sozinha no começo e desliga sozinha no fim, com a página aberta', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-16T02:59:50Z');
    useUmaObraStore.getState().conferir();
    await abrir();
    expect(pagina().textContent).toContain('2026/002');

    relogio('2026-11-16T03:00:00Z');
    await act(async () => useUmaObraStore.getState().conferir());
    await act(async () => {});
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([['intervencao_id', 'obra-a']]);
    expect(pagina().textContent).not.toContain('2026/002');

    relogio('2026-11-18T03:00:00Z');
    await act(async () => useUmaObraStore.getState().conferir());
    await act(async () => {});
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([]);
    expect(pagina().textContent).toContain('2026/002');
  });
});

describe('D599 §2 — a opção em Configurações', () => {
  it('outro perfil não vê a opção', async () => {
    banco.estado.pode = false;
    await abrir();
    await aba('config');
    await act(async () => {});
    expect(screen.queryByText('Mostrar só uma obra')).toBeNull();
  });

  it('o aviso "somente leitura" fala do resto da tela, fora da opção, que grava (CTO-D601)', async () => {
    await abrir();
    await aba('config');
    const opcao = (await screen.findByText('Mostrar só uma obra')).parentElement!;
    const aviso = screen.getByText(/Somente leitura nesta versão/);
    expect(aviso.textContent).toContain('o resto desta tela ainda não é gravado');
    expect(opcao.contains(aviso)).toBe(false);
    expect(opcao.compareDocumentPosition(aviso) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('Mostrar só uma obra, textos legais e integração com IA.')).toBeInTheDocument();
  });

  it('armar: a obra, a janela já preenchida com a da auditoria; depois diz quando liga e desliga, e desarma', async () => {
    await abrir();
    await aba('config');
    expect(await screen.findByText('Mostrar só uma obra')).toBeInTheDocument();
    expect((screen.getByLabelText('Liga em (dia)') as HTMLInputElement).value).toBe('2026-11-16');
    expect((screen.getByLabelText('Liga em (hora)') as HTMLInputElement).value).toBe('00:00');
    expect((screen.getByLabelText('Desliga depois de (dia)') as HTMLInputElement).value).toBe('2026-11-17');
    expect((screen.getByLabelText('Desliga depois de (hora)') as HTMLInputElement).value).toBe('23:59');

    fireEvent.click(screen.getByRole('button', { name: 'Armar' }));
    expect(screen.getByRole('alert').textContent).toBe('Escolha a obra.');

    fireEvent.change(screen.getByLabelText('Obra'), { target: { value: 'obra-a' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Armar' })));
    expect(document.querySelector('[data-estado-mascara]')!.textContent).toContain(
      'Armada: liga em 16/11/2026 00:00 e desliga em 17/11/2026 23:59. Obra: Obra Alfa (teste).',
    );
    // Armada, mas antes da janela: ainda mostra tudo.
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([]);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Desarmar' })));
    expect(localStorage.getItem('oc-mostrar-uma-obra')).toBeNull();
    expect(screen.getByRole('button', { name: 'Armar' })).toBeInTheDocument();
  });

  it('"Ver agora (ensaio)": liga já, até 23:59 de hoje; "Desligar agora" volta tudo', async () => {
    await abrir();
    await aba('config');
    fireEvent.change(await screen.findByLabelText('Obra'), { target: { value: 'obra-a' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Ver agora (ensaio)' })));
    await act(async () => {});
    expect(document.querySelector('[data-estado-mascara]')!.textContent).toContain(
      'Ligada até 27/09/2026 23:59 (ensaio). Obra: Obra Alfa (teste).',
    );
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([['intervencao_id', 'obra-a']]);

    await aba('historico');
    expect(pagina().textContent).not.toContain('2026/002');

    await aba('config');
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Desligar agora' })));
    await act(async () => {});
    expect(ultimaBusca('compras.ordens_compra').filtros).toEqual([]);
    await aba('historico');
    expect(pagina().textContent).toContain('2026/002');
  });

  it('sem armazenamento: a máscara não liga, a tela diz por quê, e tudo segue normal', async () => {
    await abrir();
    await aba('config');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    fireEvent.change(await screen.findByLabelText('Obra'), { target: { value: 'obra-a' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Ver agora (ensaio)' })));
    expect(screen.getByRole('alert').textContent).toMatch(/^Este navegador não guarda a opção/);
    expect(document.querySelector('[data-estado-mascara]')).toBeNull();
    await aba('dashboard');
    expect(pagina().textContent).toContain('2026/002');
  });
});

describe('D599 §2.5 — o rascunho da Nova OC de outra obra não reabre com a máscara ligada', () => {
  it('sai da tela e fica guardado; volta quando a máscara desliga', async () => {
    await abrir();
    const rascunho = normalizeOC({ id: 'oc-rascunho', status: 'rascunho', obra_id: 'obra-b', observacoes: 'rascunho da Beta' });
    await act(async () => useOcEditingStore.getState().startEditing(rascunho));
    await aba('nova-oc');

    await act(async () => {
      useUmaObraStore.getState().armar({ ...AUDITORIA, inicio: new Date().toISOString(), ensaio: true });
    });
    expect(useOcEditingStore.getState().ocEditing).toBeNull();
    expect(useUiStore.getState().activeTab).toBe('dashboard');

    await act(async () => useUmaObraStore.getState().desarmar());
    expect(useOcEditingStore.getState().ocEditing?.obra_id).toBe('obra-b');
    expect(useOcEditingStore.getState().ocEditing?.observacoes).toBe('rascunho da Beta');
  });

  it('o rascunho da obra da máscara continua aberto', async () => {
    await abrir();
    const daAlfa = normalizeOC({ id: 'oc-rascunho', status: 'rascunho', obra_id: 'obra-a' });
    await act(async () => useOcEditingStore.getState().startEditing(daAlfa));
    await act(async () => {
      useUmaObraStore.getState().armar({ ...AUDITORIA, inicio: new Date().toISOString(), ensaio: true });
    });
    expect(useOcEditingStore.getState().ocEditing?.obra_id).toBe('obra-a');
  });
});

/**
 * Perícia de 28/09 sobre `fe119e6` (consertos e máscara): medidas na decisão
 * 62, TRAVAS desde o conserto (CTO-D620). Cada uma foi escrita pelo lado do
 * certo e ficou `it.fails` enquanto o defeito existiu.
 */
describe('Perícia 28/09 (fe119e6), achado 1 — a carga de outro contexto não pode entrar na tela', () => {
  const soltarTudo = async () => {
    await act(async () => {
      while (banco.estado.presos.length) banco.estado.presos.shift()!();
    });
  };
  afterEach(soltarTudo);

  it('ao ligar, enquanto a busca filtrada não volta, a outra obra já não está na tela', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-16T02:59:50Z');
    useUmaObraStore.getState().conferir();
    await abrir();
    expect(pagina().textContent).toContain('2026/002'); // antes da janela: as duas

    banco.estado.segurar = (r) => r.tabela === 'compras.ordens_compra' && r.filtros.length > 0;
    relogio('2026-11-16T03:00:00Z');
    await act(async () => useUmaObraStore.getState().conferir());
    await act(async () => {});
    expect(useUmaObraStore.getState().obraAtiva).toBe('obra-a'); // ligada
    expect(banco.estado.presos.length).toBeGreaterThan(0); // e a busca filtrada presa

    expect(pagina().textContent).not.toContain('2026/002');
  });

  it('ao ligar, uma carga SEM filtro que termina depois da filtrada não traz a outra obra de volta', async () => {
    await abrir();
    banco.estado.segurar = (r) => r.tabela === 'compras.ordens_compra' && r.filtros.length === 0;
    const velha = recarregarDados(); // o Recarregar, ou um aviso do tempo real, antes da virada
    await act(async () => {});
    expect(banco.estado.presos.length).toBe(1);

    await armadaParaAuditoria();
    relogio('2026-11-16T15:00:00Z');
    await act(async () => useUmaObraStore.getState().conferir());
    await act(async () => {});
    expect(pagina().textContent).not.toContain('2026/002'); // a filtrada chegou primeiro

    await act(async () => {
      banco.estado.presos.shift()!();
      await velha;
    });
    expect(pagina().textContent).not.toContain('2026/002');
  });

  it('ao desligar, uma carga FILTRADA que termina depois não esconde de novo as outras obras', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-17T15:00:00Z');
    useUmaObraStore.getState().conferir();
    await abrir();
    banco.estado.segurar = (r) => r.tabela === 'compras.ordens_compra' && r.filtros.length > 0;
    const velha = recarregarDados();
    await act(async () => {});
    expect(banco.estado.presos.length).toBe(1);

    relogio('2026-11-18T03:00:00Z');
    await act(async () => useUmaObraStore.getState().conferir());
    await act(async () => {});
    expect(pagina().textContent).toContain('2026/002'); // desligou: as duas

    await act(async () => {
      banco.estado.presos.shift()!();
      await velha;
    });
    expect(pagina().textContent).toContain('2026/002');
  });
});

describe('Perícia 28/09 (fe119e6), achado 2 — a virada da janela pelo relógio do aplicativo, sem chamar a conferência por fora', () => {
  beforeEach(() => {
    vi.useRealTimers(); // o de fora só finge a data; aqui o relógio da tela também
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] });
  });
  // Com o setTimeout falso, o `findByText` não espera: a carga do banco falso
  // anda só por promessas, e basta deixá-las correr.
  async function abrirComORelogioFalso() {
    render(<App />);
    for (let i = 0; i < 10; i++) await act(async () => {});
    expect(screen.getByText('Últimas Ordens de Compra')).toBeInTheDocument();
  }

  it('dois segundos depois de 00:00 de 16/11, a máscara já está ligada', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-16T02:59:59Z');
    await abrirComORelogioFalso();
    expect(pagina().textContent).toContain('2026/002');
    await act(async () => vi.advanceTimersByTime(2_000));
    expect(useUmaObraStore.getState().obraAtiva).toBe('obra-a');
  });

  it('o controle: até 15 segundos depois ela liga sozinha (o atraso tem teto)', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-16T02:59:59Z');
    await abrirComORelogioFalso();
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(useUmaObraStore.getState().obraAtiva).toBe('obra-a');
  });

  it('no término: dois segundos depois de 00:00 de 18/11, a máscara já está desligada', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-18T02:59:59Z');
    await abrirComORelogioFalso();
    expect(useUmaObraStore.getState().obraAtiva).toBe('obra-a');
    await act(async () => vi.advanceTimersByTime(2_000));
    expect(useUmaObraStore.getState().obraAtiva).toBeNull();
  });

  it('o controle do término: até 15 segundos depois ela desliga sozinha', async () => {
    await armadaParaAuditoria();
    relogio('2026-11-18T02:59:59Z');
    await abrirComORelogioFalso();
    await act(async () => vi.advanceTimersByTime(15_000));
    expect(useUmaObraStore.getState().obraAtiva).toBeNull();
  });
});

describe('Perícia 28/09 (fe119e6), achado 4 — um campo da janela apagado, e o Armar', () => {
  async function armarCom(campo: string) {
    await abrir();
    await aba('config');
    await screen.findByText('Mostrar só uma obra');
    fireEvent.change(screen.getByLabelText('Obra'), { target: { value: 'obra-a' } });
    fireEvent.change(screen.getByLabelText(campo), { target: { value: '' } });
    const erros: unknown[] = [];
    const pegar = (e: ErrorEvent) => {
      erros.push(e.error ?? e.message);
      e.preventDefault();
    };
    window.addEventListener('error', pegar);
    try {
      await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Armar' })));
    } catch (e) {
      erros.push(e);
    } finally {
      window.removeEventListener('error', pegar);
    }
    return erros;
  }

  it('sem o dia: nenhuma exceção, e a mensagem pede o dia', async () => {
    const erros = await armarCom('Liga em (dia)');
    expect(erros).toEqual([]);
    expect(screen.getByRole('alert').textContent).toMatch(/dia|data/i);
  });

  it('sem a hora: o mesmo', async () => {
    const erros = await armarCom('Liga em (hora)');
    expect(erros).toEqual([]);
    expect(screen.getByRole('alert').textContent).toMatch(/hora/i);
  });
});

