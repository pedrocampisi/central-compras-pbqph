import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * As leituras do recebimento contra um banco FALSO que se comporta como a API
 * (perícia de 05/10): devolve no máximo `TETO` linhas por pedido, SEM erro, e
 * a contagem só quando pedida; aplica o filtro que a consulta leva, e nenhum
 * outro. Obras e pedidos são inventados.
 *
 *   achado 5 — a fila do escritório com a máscara de uma obra: o filtro vai NA
 *              consulta, e as linhas da outra obra nem chegam;
 *   achado 9 — a lista do mestre e as obras dele: página por página, até a
 *              contagem; lista pela metade acusa, nunca segue calada.
 */

const TETO = 1000;

const banco = vi.hoisted(() => ({
  tabelas: {} as Record<string, Record<string, unknown>[]>,
  funcoes: {} as Record<string, Record<string, unknown>[]>,
  /** Cada pedido que chegou: a tabela ou função, os filtros e a faixa. */
  pedidos: [] as { alvo: string; filtros: [string, unknown][]; faixa: [number, number] | null; contagem: boolean }[],
  semContagem: false,
  /** A contagem diz uma linha a mais do que chega: a lista mudou entre as páginas. */
  contagemAMais: false,
}));

function consulta(alvo: string, linhas: () => Record<string, unknown>[], contagem: boolean) {
  const p = { alvo, filtros: [] as [string, unknown][], faixa: null as [number, number] | null, contagem };
  banco.pedidos.push(p);
  const c = {
    eq: (col: string, v: unknown) => (p.filtros.push([col, v]), c),
    order: () => c,
    range: (de: number, ate: number) => ((p.faixa = [de, ate]), c),
    then: (ok: (r: unknown) => void) => {
      const todas = linhas().filter((l) => p.filtros.every(([k, v]) => l[k] === v));
      const [de, ate] = p.faixa ?? [0, Number.POSITIVE_INFINITY];
      const data = todas.slice(de, Math.min(ate + 1, de + TETO));
      ok({ data, error: null, count: p.contagem && !banco.semContagem ? todas.length + (banco.contagemAMais ? 1 : 0) : null });
    },
  };
  return c;
}

const esquema = (nome: string) => ({
  from: (t: string) => ({
    select: (_cols: string, o?: { count?: string }) =>
      consulta(`${nome}.${t}`, () => banco.tabelas[`${nome}.${t}`] ?? [], o?.count === 'exact'),
  }),
  rpc: (f: string, _args?: unknown, o?: { count?: string }) =>
    consulta(`${nome}.${f}`, () => banco.funcoes[`${nome}.${f}`] ?? [], o?.count === 'exact'),
});

vi.mock('../../src/services/supabase/client', () => ({
  supabase: {},
  core: () => esquema('core'),
  compras: () => esquema('compras'),
}));

import { lerFilaSemPedido, lerMaterialAChegar } from '../../src/services/supabase/recebimento';
import { ListaPelaMetade } from '../../src/services/supabase/dados';

const pedido = (n: number) => ({
  oc_id: `oc-${n}`, numero: `2026/${n}`, intervencao_id: 'obra-1', obra: 'Obra Um', fornecedor: 'Fornecedor (teste)', itens: [],
});

beforeEach(() => {
  banco.tabelas = {};
  banco.funcoes = {};
  banco.pedidos = [];
  banco.semContagem = false;
  banco.contagemAMais = false;
});

describe('a fila do escritório com a máscara de uma obra (perícia 05/10, achado 5)', () => {
  beforeEach(() => {
    banco.tabelas['compras.sem_pedido_na_fila'] = [
      { id: 1, intervencao_id: 'obra-1', o_que_chegou: 'Areia (teste)', registrado_por_nome: 'Mestre Um' },
      { id: 2, intervencao_id: 'obra-2', o_que_chegou: 'Brita (teste)', registrado_por_nome: 'Mestre Dois' },
    ];
  });

  it('com a obra, o filtro vai na consulta, e só as linhas dela chegam', async () => {
    const f = await lerFilaSemPedido('obra-2');
    expect(f.map((x) => x.id)).toEqual([2]);
    expect(banco.pedidos.every((p) => p.filtros.some(([k, v]) => k === 'intervencao_id' && v === 'obra-2'))).toBe(true);
  });

  it('sem máscara, todas', async () => {
    expect((await lerFilaSemPedido(null)).map((x) => x.id)).toEqual([1, 2]);
  });

  it('com a máscara, o filtro vai em CADA página', async () => {
    banco.tabelas['compras.sem_pedido_na_fila'] = Array.from({ length: 1500 }, (_, i) => ({
      id: i, intervencao_id: i % 2 ? 'obra-1' : 'obra-2',
    }));
    const f = await lerFilaSemPedido('obra-2');
    expect(f).toHaveLength(750);
    expect(banco.pedidos.length).toBeGreaterThan(0);
    for (const p of banco.pedidos) expect(p.filtros).toContainEqual(['intervencao_id', 'obra-2']);
  });
});

describe('a lista do mestre, página por página (perícia 05/10, achado 9)', () => {
  it('1.001 pedidos com teto de mil: busca a segunda página, e chegam os 1.001', async () => {
    banco.funcoes['compras.material_a_chegar'] = Array.from({ length: 1001 }, (_, i) => pedido(i));
    const l = await lerMaterialAChegar();
    expect(l.cartoes).toHaveLength(1001);
    expect(l.cartoes.at(-1)?.ocId).toBe('oc-1000');
    expect(banco.pedidos.filter((p) => p.alvo === 'compras.material_a_chegar').map((p) => p.faixa)).toEqual([
      [0, 999], [1000, 1999],
    ]);
  });

  it('as obras do mestre também vão por página', async () => {
    banco.funcoes['core.obras_do_mestre_com_nome'] = Array.from({ length: 1001 }, (_, i) => ({
      intervencao_id: `obra-${i}`, obra: `Obra ${i}`,
    }));
    const l = await lerMaterialAChegar();
    expect(l.obras).toHaveLength(1001);
  });

  it('sem a contagem, não há como saber se veio inteira: acusa, não segue com a metade', async () => {
    banco.funcoes['compras.material_a_chegar'] = Array.from({ length: 1001 }, (_, i) => pedido(i));
    banco.semContagem = true;
    await expect(lerMaterialAChegar()).rejects.toThrow(/sem a contagem/);
  });

  it('a lista que não chegou inteira acusa com o tipo próprio, para a tela não dizer "sem sinal" (CTO-D719)', async () => {
    banco.funcoes['compras.material_a_chegar'] = Array.from({ length: 1001 }, (_, i) => pedido(i));
    banco.semContagem = true;
    const e = await lerMaterialAChegar().catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ListaPelaMetade);
  });

  it('a contagem promete mais do que chega (mudou entre as páginas): acusa com o mesmo tipo', async () => {
    banco.funcoes['compras.material_a_chegar'] = Array.from({ length: 1000 }, (_, i) => pedido(i));
    banco.contagemAMais = true;
    const e = await lerMaterialAChegar().catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ListaPelaMetade);
    expect((e as Error).message).toMatch(/veio incompleta/);
  });
});
