import { describe, expect, it, vi } from 'vitest';

/**
 * CTO-D954: a carga lê a regra única da OC (`compras.regra_da_oc`), página por
 * página e com a contagem, como as listas; e lê a origem da OC que a IA montou.
 * A filial que não veio na regra não entra na Nova OC (falha fechada, como a
 * trava da D607). Banco FALSO; nomes inventados.
 */

const pedidos: string[] = [];
const TABELAS: Record<string, Record<string, unknown>[]> = {
  fornecedores: [
    { id: 'f1', razao_social: 'Alfa (teste)', ativo: true },
    { id: 'f2', razao_social: 'Beta (teste)', ativo: true },
  ],
  fornecedor_resolvido: [
    { id: 'f1', fornece_material: true, empresa_id: 'e1', bloqueado_para_compra_nova: false },
    { id: 'f2', fornece_material: true, empresa_id: 'e2', bloqueado_para_compra_nova: false },
  ],
  // A f2 não veio: a regra devolve uma linha por filial que a pessoa enxerga.
  regra_da_oc: [{ fornecedor_id: 'f1', empresa: 'e1', entra_na_oc: true, filial_da_oc: 'f1' }],
  ordens_compra: [
    { id: 'oc-ia', status: 'rascunho', origem_sistema: 'ia', origem_id: 'Assistente (teste)', itens: [] },
    { id: 'oc-tela', status: 'rascunho', origem_sistema: null, origem_id: null, itens: [] },
  ],
};

function consulta(nome: string, contar: boolean): Record<string, unknown> {
  const c: Record<string, unknown> = {
    select: (_colunas: string, opcoes?: { count?: string }) => consulta(nome, opcoes?.count === 'exact'),
    order: () => c,
    eq: () => c,
    range: () => c,
    then: (ok: (v: unknown) => void) => {
      const linhas = TABELAS[nome] ?? [];
      ok({ data: linhas, error: null, count: contar ? linhas.length : null });
    },
  };
  return c;
}

vi.mock('../../src/services/supabase/client', () => ({
  supabase: {},
  core: () => ({ from: (t: string) => consulta(t, false) }),
  compras: () => ({
    from: (t: string) => consulta(t, false),
    rpc: (f: string, args: unknown, opcoes?: { count?: string }) => {
      pedidos.push(`${f} ${JSON.stringify(args)} ${opcoes?.count ?? 'sem contagem'}`);
      return consulta(f, opcoes?.count === 'exact');
    },
  }),
}));

import { carregarDados } from '../../src/services/supabase/dados';
import { entraNaOc } from '../../src/domain/fornecedores';

describe('D954 — a regra da OC e a origem na carga', () => {
  it('a regra vem pela função, com a contagem; a filial dela leva a resposta, e a que não veio fica fora', async () => {
    const dados = await carregarDados(null);
    expect(pedidos).toContain('regra_da_oc {} exact');
    const f1 = dados.fornecedores.find((f) => f.id === 'f1')!;
    const f2 = dados.fornecedores.find((f) => f.id === 'f2')!;
    expect(f1).toMatchObject({ entra_na_oc: true, filial_da_oc: 'f1' });
    expect(f2.entra_na_oc).toBe(false);
    expect(f2).not.toHaveProperty('filial_da_oc');
    expect(entraNaOc(f2)).toBe(false);
  });

  it('a OC da IA chega com o nome dela; a da tela, sem marca', async () => {
    const dados = await carregarDados(null);
    expect(dados.ordens_compra.find((o) => o.id === 'oc-ia')!.montada_pela_ia).toBe('Assistente (teste)');
    expect(dados.ordens_compra.find((o) => o.id === 'oc-tela')).not.toHaveProperty('montada_pela_ia');
  });
});
