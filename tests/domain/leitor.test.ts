import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'falso' } } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

import {
  LEITOR_PADRAO,
  itensMexidos,
  leitorDaResposta,
  leituraServe,
  outroLeitorPodeAjudar,
  quemLeu,
  totalLido,
  trocarItensDaLeitura,
} from '../../src/domain/leitor';
import { normalizeItem } from '../../src/domain/normalize';
import { extractItemsFromImages, organizarTexto, paraResultado } from '../../src/services/ai/extractItems';
import { lerLista, lerPedido, statusDoErro, type DepsDaLeitura } from '../../src/services/ai/lerPedido';

const item = (descricao: string, extra = {}) => normalizeItem({ descricao, ...extra });

describe('D567 — a trava contra o engano: quem escolheu o certeiro só recebe o certeiro', () => {
  it('a resposta diz quem leu pelo _meta.leitor; sem a palavra (a v4), null', () => {
    expect(leitorDaResposta({ leitor: 'certeiro', provedor: 'x' })).toBe('certeiro');
    expect(leitorDaResposta({ leitor: 'rapido' })).toBe('rapido');
    expect(leitorDaResposta({ modelo: 'google/gemini-3.5-flash-lite' })).toBeNull();
    expect(leitorDaResposta({ leitor: 'Certeiro' })).toBeNull();
    expect(leitorDaResposta(null)).toBeNull();
  });

  it('escolheu o certeiro: só a resposta que diz "certeiro" serve', () => {
    expect(leituraServe('certeiro', 'certeiro')).toBe(true);
    expect(leituraServe('certeiro', null)).toBe(false); // a v4 ignora o pedido e lê pelo rápido
    expect(leituraServe('certeiro', 'rapido')).toBe(false);
  });

  it('escolheu o rápido: serve (a v4 é o rápido), e a tela diz "rápido"', () => {
    expect(leituraServe('rapido', null)).toBe(true);
    expect(leituraServe('rapido', 'rapido')).toBe(true);
    expect(quemLeu(null)).toBe('rapido');
    expect(quemLeu('certeiro')).toBe('certeiro');
  });

  it('a tela começa no rápido', () => {
    expect(LEITOR_PADRAO).toBe('rapido');
  });
});

describe('D567 — o total lido, e a troca pelos itens do certeiro', () => {
  it('o total lido é a soma das linhas como a OC calcula (desconto e IPI)', () => {
    const a = item('a', { quantidade: 10, preco_unit: 22.5, desc_pct: 9 }); // 204,75
    const b = item('b', { quantidade: 2, preco_unit: 100, ipi_pct: 10 }); //   220,00
    expect(totalLido([a, b])).toBeCloseTo(424.75, 2);
    expect(totalLido([])).toBe(0);
  });

  it('itens mexidos: conta os da leitura que mudaram ou saíram; os postos à mão não contam', () => {
    const lidos = [item('Cimento'), item('Areia'), item('Brita')];
    const mao = item('Posto à mão');
    expect(itensMexidos(lidos, [...lidos, mao])).toBe(0);
    const editado = { ...lidos[1]!, preco_unit: 99 };
    expect(itensMexidos(lidos, [lidos[0]!, editado, lidos[2]!, mao])).toBe(1);
    expect(itensMexidos(lidos, [lidos[0]!, mao])).toBe(2); // dois tirados
  });

  it('a troca põe os novos NO LUGAR dos antigos, e o resto da OC fica onde está', () => {
    const antes1 = item('Antes 1');
    const [l1, l2] = [item('Lido 1'), item('Lido 2')];
    const depois1 = item('Depois 1');
    const [n1, n2, n3] = [item('Novo 1'), item('Novo 2'), item('Novo 3')];
    const r = trocarItensDaLeitura([antes1, l1, l2, depois1], [l1.id, l2.id], [n1, n2, n3]);
    expect(r.map((i) => i.descricao)).toEqual(['Antes 1', 'Novo 1', 'Novo 2', 'Novo 3', 'Depois 1']);
  });

  it('a troca com os itens da leitura já tirados: os novos entram no fim', () => {
    const mao = item('Posto à mão');
    const n1 = item('Novo 1');
    expect(trocarItensDaLeitura([mao], ['sumiu'], [n1]).map((i) => i.descricao)).toEqual(['Posto à mão', 'Novo 1']);
  });
});

describe('D567 — quando o outro leitor pode ajudar', () => {
  it('só na falha da LEITURA: 422 e serviço fora (5xx, menos o 503 de "não configurado")', () => {
    expect(outroLeitorPodeAjudar(422)).toBe(true);
    expect(outroLeitorPodeAjudar(502)).toBe(true);
    expect(outroLeitorPodeAjudar(500)).toBe(true);
    expect(outroLeitorPodeAjudar(503)).toBe(false);
    expect(outroLeitorPodeAjudar(400)).toBe(false); // grande demais: o certeiro também recusa
    expect(outroLeitorPodeAjudar(401)).toBe(false);
    expect(outroLeitorPodeAjudar(403)).toBe(false);
    expect(outroLeitorPodeAjudar(null)).toBe(false); // tipo errado, página demais: nada foi ao servidor
  });
});

// ── O contrato com a função (CTO-D567 §3) ─────────────────────────────────────

function respostaFalsa(status: number, corpo: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } }));
}
afterEach(() => vi.unstubAllGlobals());

describe('D567 — o contrato: o leitor vai no pedido e volta no _meta', () => {
  it('a imagem e o texto levam o leitor escolhido; sem escolha, o rápido', async () => {
    const f = respostaFalsa(200, { itens: [], ignoradas: [], _meta: { leitor: 'certeiro' } });
    vi.stubGlobal('fetch', f);
    await extractItemsFromImages(['a'], 'certeiro');
    await organizarTexto('10 sc cimento', 'certeiro');
    await extractItemsFromImages(['a']);
    const corpos = f.mock.calls.map((c) => JSON.parse(String((c as unknown as [string, RequestInit])[1].body)));
    expect(corpos).toEqual([
      { imagens: ['a'], leitor: 'certeiro' },
      { texto: '10 sc cimento', leitor: 'certeiro' },
      { imagens: ['a'], leitor: 'rapido' },
    ]);
  });

  it('o resultado traz quem leu, pelo _meta.leitor', () => {
    expect(paraResultado({ itens: [], _meta: { leitor: 'certeiro', provedor: 'x', modelo: 'y' } }).leitor).toBe('certeiro');
    expect(paraResultado({ itens: [], _meta: { modelo: 'y' } }).leitor).toBeNull();
  });

  it('a falha leva o status junto (é por ele que a tela oferece o certeiro)', async () => {
    vi.stubGlobal('fetch', respostaFalsa(422, { erro: 'A resposta da IA foi cortada antes do fim.' }));
    const e = await extractItemsFromImages(['a']).catch((x: unknown) => x);
    expect(statusDoErro(e)).toBe(422);
    expect(statusDoErro(new Error('sem servidor'))).toBeNull();
  });

  it('lerPedido e lerLista passam o leitor adiante', async () => {
    const enviar = vi.fn(async () => ({ itens: [], confira: {}, ignoradas: [], leitor: null }));
    const deps: DepsDaLeitura = {
      abrir: async () => ({ paginas: 1, imagens: async () => ['img'] }),
      enviar,
    };
    await lerPedido([new File(['%PDF'], 'p.pdf', { type: 'application/pdf' })], deps, 'certeiro');
    expect(enviar).toHaveBeenCalledWith(['img'], 'certeiro');
    const enviarTexto = vi.fn(async () => ({ itens: [], confira: {}, ignoradas: [], leitor: null }));
    await lerLista('cal 5 sacos', enviarTexto, 'certeiro');
    expect(enviarTexto).toHaveBeenCalledWith('cal 5 sacos', 'certeiro');
  });
});
