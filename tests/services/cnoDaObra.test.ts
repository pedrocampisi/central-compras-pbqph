import { describe, expect, it, vi } from 'vitest';

/**
 * CTO-D655: o CNO da obra vem da INTERVENÇÃO (`intervencoes.cno`). Até 30/09
 * vinha do `cadastro_imobiliario` do imóvel, que é a inscrição da Prefeitura,
 * e o PDF o imprimia como CNO. Banco FALSO, números inventados.
 */

const pedidos: string[] = [];
const OBRA: Record<string, unknown> = {
  id: 'o1', descricao_curta: 'Obra de Teste', ativa: true, cno: '90.000.00000/00',
  imovel: { cadastro_imobiliario: '11.22.333.4444.000', logradouro: 'Rua das Provas' },
};

function consulta(tabela: string) {
  const c: Record<string, unknown> = {
    select: (colunas: string) => {
      pedidos.push(`${tabela}: ${colunas}`);
      return c;
    },
    order: () => c,
    eq: () => c,
    range: () => c,
    then: (ok: (v: unknown) => void) => {
      const linhas = tabela === 'intervencoes' ? [OBRA] : [];
      ok({ data: linhas, error: null, count: linhas.length });
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

describe('CTO-D655 — o CNO da obra', () => {
  it('vem de intervencoes.cno, e não da inscrição da Prefeitura', async () => {
    const dados = await carregarDados(null);
    expect(pedidos.find((p) => p.startsWith('intervencoes:'))).toMatch(/\bcno\b/);
    expect(dados.obras[0]!.cei).toBe('90.000.00000/00');
  });

  it('obra sem CNO: vazio, mesmo com inscrição da Prefeitura no imóvel', async () => {
    OBRA['cno'] = null;
    const dados = await carregarDados(null);
    expect(dados.obras[0]!.cei).toBe('');
  });
});
