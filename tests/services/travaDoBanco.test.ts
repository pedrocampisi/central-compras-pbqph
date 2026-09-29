import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A recusa da trava da emissão no banco (CTO-D609: erro 23514 com a dica)
 * chega à tela como `TravaDoBanco`, com a frase do banco. Um 23514 sem dica é
 * um CHECK comum, e sobe como a falha de sempre. Banco falso: nada sai daqui.
 */

const resposta = vi.hoisted(() => ({
  atual: { data: null as unknown, error: null as null | Record<string, string | null> },
}));
vi.mock('../../src/services/supabase/client', () => ({
  supabase: {},
  core: () => ({}),
  compras: () => ({ rpc: async () => resposta.atual }),
}));
vi.mock('../../src/services/storage/umaObra', () => ({ obraDaMascara: () => null }));

import { definirStatusOc, salvarOrdemCompra, TravaDoBanco, ConflitoDeVersao } from '../../src/services/supabase/dados';
import { normalizeOC } from '../../src/domain/normalize';

const TRAVA = {
  code: '23514',
  message: 'A OC 2026/009 não pode ser emitida: a empresa está sem qualificação de material.',
  details: 'situacao=sem_qualificacao; ecrs_da_oc=12; ecrs_faltando=12',
  hint: 'Qualifique a empresa para a ECR 12 e emita de novo.',
};
const FRASE =
  'A OC 2026/009 não pode ser emitida: a empresa está sem qualificação de material. Qualifique a empresa para a ECR 12 e emita de novo.';

const oc = () => normalizeOC({ id: 'uuid-da-oc', status: 'emitida', versao: 3, itens: [] });

beforeEach(() => {
  resposta.atual = { data: null, error: null };
});

describe('D609 — a trava do banco na emissão', () => {
  it('salvar_oc recusado pela trava: TravaDoBanco, com a mensagem e a dica', async () => {
    resposta.atual = { data: null, error: TRAVA };
    const e = await salvarOrdemCompra(oc(), 'tentativa').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(TravaDoBanco);
    expect((e as Error).message).toBe(FRASE);
  });

  it('definir_status_oc recusado pela trava: o mesmo', async () => {
    resposta.atual = { data: null, error: TRAVA };
    const e = await definirStatusOc('uuid-da-oc', 'emitida', 3).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(TravaDoBanco);
    expect((e as Error).message).toBe(FRASE);
  });

  it('23514 sem dica é um CHECK comum: sobe como falha, não como trava', async () => {
    resposta.atual = { data: null, error: { code: '23514', message: 'violates check constraint "x"', hint: null } };
    const e = await salvarOrdemCompra(oc(), 'tentativa').catch((x: unknown) => x);
    expect(e).not.toBeInstanceOf(TravaDoBanco);
    expect((e as Error).message).toBe('Falha ao gravar a ordem de compra: violates check constraint "x"');
  });

  it('o 40001 continua sendo conflito de versão', async () => {
    resposta.atual = { data: null, error: { code: '40001', message: 'outra pessoa salvou' } };
    await expect(definirStatusOc('uuid-da-oc', 'emitida', 3)).rejects.toBeInstanceOf(ConflitoDeVersao);
  });
});
