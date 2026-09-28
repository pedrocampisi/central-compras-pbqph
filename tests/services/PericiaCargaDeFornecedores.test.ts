import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Perícia do Codex, 27/09/2026, achado 5 — medida na D603, TRAVA desde a D607
 * (o carregador pede as páginas seguintes pela contagem, ou acusa; a trava de
 * emitir falha fechada).
 *
 * O "como conferir" do perito: o carregador de verdade sobre um banco FALSO
 * que devolve no máximo LIMITE linhas por consulta (como o limite de linhas da
 * API do projeto), com a crua e a resolvida em ordens diferentes. Uma filial
 * BLOQUEADA está na página da crua e fora da página da resolvida. O certo: o
 * carregador busca as páginas seguintes, ou acusa a carga incompleta, ou a trava
 * de emitir continua recusando essa filial.
 *
 * O limite aqui é 3, e não 1.000, só para o teste ser pequeno: a conta é a
 * mesma. O limite real do projeto não foi medido.
 */

const LIMITE = 3;
const pedidos = { range: [] as string[] };
/** Os defeitos do banco falso: sem contagem, ou parando de mandar linhas antes do fim. */
const defeito = { semContagem: false, paraNaLinha: Number.POSITIVE_INFINITY };

// A crua, pela razão social: Alfa (bloqueada), Beta, Gama, Delta, Épsilon.
const CRUAS = [
  { id: 'f1', razao_social: 'Alfa (teste)', ativo: true },
  { id: 'f2', razao_social: 'Beta (teste)', ativo: true },
  { id: 'f3', razao_social: 'Delta (teste)', ativo: true },
  { id: 'f4', razao_social: 'Gama (teste)', ativo: true },
  { id: 'f5', razao_social: 'Épsilon (teste)', ativo: true },
];
// A resolvida, na ordem em que o banco a guardou (sem pedido de ordem): a Alfa por último.
const RESOLVIDAS = ['f5', 'f4', 'f3', 'f2', 'f1'].map((id) => ({
  id,
  fornece_material: true,
  presta_servico: false,
  empresa_id: `empresa-${id}`,
  bloqueado_para_compra_nova: id === 'f1',
}));
const TABELAS: Record<string, Record<string, unknown>[]> = {
  fornecedores: [...CRUAS].sort((a, b) => a.razao_social.localeCompare(b.razao_social, 'pt-BR')),
  fornecedor_resolvido: RESOLVIDAS,
};

function consulta(tabela: string) {
  let de = 0;
  let ate = Number.POSITIVE_INFINITY;
  let contar = false;
  const c: Record<string, unknown> = {
    select: (_colunas: string, opcoes?: { count?: string }) => {
      contar = opcoes?.count === 'exact';
      return c;
    },
    order: () => c,
    eq: () => c,
    range: (a: number, b: number) => {
      pedidos.range.push(`${tabela} ${a}-${b}`);
      de = a;
      ate = b;
      return c;
    },
    then: (ok: (v: unknown) => void) => {
      const todas = TABELAS[tabela] ?? [];
      const linhas = todas.slice(de, Math.min(ate + 1, de + LIMITE, defeito.paraNaLinha));
      ok({ data: linhas, error: null, count: contar && !defeito.semContagem ? todas.length : null });
    },
  };
  return c;
}

vi.mock('../../src/services/supabase/client', () => ({
  supabase: {},
  core: () => ({ from: (t: string) => consulta(t) }),
  compras: () => ({ from: (t: string) => consulta(t) }),
}));

import { carregarDados } from '../../src/services/supabase/dados';
import { EMITIR_BLOQUEADA, travaDaFilial } from '../../src/domain/fornecedores';

beforeEach(() => {
  pedidos.range = [];
  defeito.semContagem = false;
  defeito.paraNaLinha = Number.POSITIVE_INFINITY;
});

describe('Perícia 27/09, achado 5 — a página incompleta de fornecedores', () => {
  it('a filial bloqueada que ficou fora da página da resolvida continua sem poder emitir', async () => {
    let acusou = false;
    let dados: Awaited<ReturnType<typeof carregarDados>> | null = null;
    try {
      dados = await carregarDados();
    } catch {
      acusou = true;
    }
    const alfa = dados?.fornecedores.find((f) => f.id === 'f1');
    const medida = {
      acusou,
      fornecedoresNaTela: dados?.fornecedores.map((f) => f.id) ?? null,
      alfaBloqueio: alfa?.bloqueado_para_compra_nova,
      travaAoEmitir: travaDaFilial(alfa, 'emitir'),
      paginasPedidas: pedidos.range,
    };
    expect(medida.acusou || medida.travaAoEmitir === EMITIR_BLOQUEADA, JSON.stringify(medida)).toBe(true);
    // E o jeito é o melhor dos três: as páginas seguintes vieram, a lista está inteira.
    expect(medida.acusou).toBe(false);
    expect(medida.fornecedoresNaTela).toEqual(['f1', 'f2', 'f3', 'f5', 'f4']); // pela razão social: Épsilon antes de Gama
    expect(dados!.fornecedores.every((f) => typeof f.bloqueado_para_compra_nova === 'boolean')).toBe(true);
    expect(pedidos.range).toContain('fornecedor_resolvido 3-1002');
  });

  it('o banco que para de mandar linhas antes da contagem: a carga acusa, não segue pela metade', async () => {
    defeito.paraNaLinha = 3;
    await expect(carregarDados()).rejects.toThrow(/veio incompleta \(3 de 5\)/);
  });

  it('a resposta sem contagem: a carga acusa, porque não há como saber se veio inteira', async () => {
    defeito.semContagem = true;
    await expect(carregarDados()).rejects.toThrow(/veio sem a contagem/);
  });
});
