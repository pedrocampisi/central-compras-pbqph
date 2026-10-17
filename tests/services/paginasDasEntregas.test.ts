import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Perícia de 16/10 (parte C), achado 5 — CTO-D850 §2: a lista das entregas sem
 * papel e a cobertura das entregas passam de 1.000 linhas. O banco FALSO faz
 * como a API: corta a resposta em 1.000 linhas SEM erro, dá a contagem só
 * quando pedem (`count: 'exact'`) e devolve a página pedida (`range`). São
 * 501 entregas com duas ECRs cada: 1.002 linhas. Dados INVENTADOS.
 */

const LIMITE = 1000;
const banco = vi.hoisted(() => ({
  linhas: {} as Record<string, Record<string, unknown>[]>,
  semSegundaPagina: false,
  pedidos: [] as { nome: string; ordem: string[]; pagina: [number, number] | null; contar: boolean }[],
}));
vi.mock('../../src/services/supabase/client', () => ({
  supabase: {},
  core: () => ({}),
  compras: () => ({
    rpc: (nome: string, _args: unknown, opcoes?: { count?: string }) => {
      const pedido = { nome, ordem: [] as string[], pagina: null as [number, number] | null, contar: opcoes?.count === 'exact' };
      banco.pedidos.push(pedido);
      const q = {
        order: (coluna: string) => {
          pedido.ordem.push(coluna);
          return q;
        },
        range: (de: number, ate: number) => {
          pedido.pagina = [de, ate];
          return q;
        },
        then: (ok: (r: unknown) => unknown) => {
          const todas = banco.linhas[nome] ?? [];
          const [de, ate] = pedido.pagina ?? [0, todas.length - 1];
          const pagina = banco.semSegundaPagina && de >= LIMITE ? [] : todas.slice(de, Math.min(ate + 1, de + LIMITE));
          return Promise.resolve({ data: pagina, error: null, count: pedido.contar ? todas.length : null }).then(ok);
        },
      };
      return q;
    },
  }),
}));

import { lerCoberturaDasEntregas, lerEntregasSemPapel } from '../../src/services/supabase/entregasSemPapel';
import { colunaDoRegistro, coberturaPorEntrega } from '../../src/domain/entregasSemPapel';

const ENTREGAS = 501;
function montar() {
  const sem: Record<string, unknown>[] = [];
  const cob: Record<string, unknown>[] = [];
  for (let a = 1; a <= ENTREGAS; a++) {
    for (const ecr of [2, 6]) {
      sem.push({
        avaliacao_id: a, oc_id: `oc-${a}`, numero: `2026/${a}`, obra: 'Obra (teste)', fornecedor: 'Fornecedor (teste)',
        recebido_em: '2026-10-10', nota_fiscal: '', avaliado_por_nome: '', ecr_id: ecr, ecr: `ECR 0${ecr}`, nome: '',
        posicoes: [1], a_cada_entrega: ecr === 2, porque: 'pede (teste)', o_que_pede: null, observacao: '',
      });
      cob.push({ avaliacao_id: a, ecr_id: ecr, situacao: 'sem_papel', documento_id: null, alcance: null, valido_ate: null, motivo: null });
    }
  }
  banco.linhas = { entregas_sem_papel: sem, cobertura_das_entregas: cob };
}

beforeEach(() => {
  banco.pedidos = [];
  banco.semSegundaPagina = false;
  montar();
});

describe('mais de 1.000 linhas (achado 5)', () => {
  it('a lista das entregas sem papel chega inteira: 1.002 linhas, em ordem fixa', async () => {
    const lidas = await lerEntregasSemPapel(null);
    expect(lidas).toHaveLength(2 * ENTREGAS);
    expect(lidas.at(-1)).toMatchObject({ avaliacaoId: ENTREGAS, ecrId: 6 });
    // Cada página com a mesma ordem, com desempate até a ECR: sem ela, as páginas se sobrepõem.
    for (const p of banco.pedidos) expect(p.ordem).toEqual(['recebido_em', 'avaliacao_id', 'ecr_id']);
  });

  it('a cobertura chega inteira, e a entrega 501 não sai "—" no PDF por falta da segunda página', async () => {
    const lidas = await lerCoberturaDasEntregas(null);
    expect(lidas).toHaveLength(2 * ENTREGAS);
    const mapa = coberturaPorEntrega(lidas);
    expect(colunaDoRegistro(mapa.get(ENTREGAS))).toBe(['ECR 02: sem papel', 'ECR 06: sem papel'].join(String.fromCharCode(10)));
    for (const p of banco.pedidos) expect(p.ordem).toEqual(['recebido_em', 'avaliacao_id', 'ecr_id']);
  });

  it('a lista que muda entre uma página e outra não passa pela metade: a leitura acusa', async () => {
    // A segunda página volta vazia: a contagem diz 1.002, e só chegam 1.000.
    banco.semSegundaPagina = true;
    await expect(lerCoberturaDasEntregas(null)).rejects.toThrow(/incompleta/);
    await expect(lerEntregasSemPapel(null)).rejects.toThrow(/incompleta/);
  });
});
