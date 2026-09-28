import { describe, expect, it, vi } from 'vitest';

/**
 * Perícia do Codex, 27/09/2026, achado 5 — MEDIDA, não conserto (CTO-D603).
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
  const c: Record<string, unknown> = {
    select: () => c,
    order: () => c,
    eq: () => c,
    range: (a: number, b: number) => {
      pedidos.range.push(`${tabela} ${a}-${b}`);
      de = a;
      ate = b;
      return c;
    },
    then: (ok: (v: unknown) => void) => {
      const linhas = (TABELAS[tabela] ?? []).slice(de, Math.min(ate + 1, de + LIMITE));
      ok({ data: linhas, error: null });
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

describe('Perícia 27/09, achado 5 — a página incompleta de fornecedores', () => {
  // `it.fails`: esta medida REPRODUZ o achado no código de hoje. Quando o conserto
  // entrar, ela passa a falhar — aí o `.fails` sai e a medida vira trava.
  it.fails('a filial bloqueada que ficou fora da página da resolvida continua sem poder emitir', async () => {
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
  });
});
