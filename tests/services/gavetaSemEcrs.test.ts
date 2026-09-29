import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * CTO-D614 §2.1: a gaveta do fornecedor não grava mais a
 * `compras.fornecedor_ecrs`. Que ECR a empresa atende é a qualificação de
 * material, e ela muda na ficha da empresa. Banco falso que anota cada tabela
 * tocada e o que se fez nela: nada sai daqui.
 */

const tocadas = vi.hoisted(() => [] as string[]);
vi.mock('../../src/services/supabase/client', () => {
  function tabela(esquema: string) {
    return {
      from(nome: string) {
        const b: Record<string, unknown> = {};
        for (const m of ['select', 'insert', 'upsert', 'update', 'delete', 'eq', 'in', 'is', 'order', 'range']) {
          b[m] = () => {
            tocadas.push(`${esquema}.${nome}.${m}`);
            return b;
          };
        }
        b['single'] = () => b;
        b['maybeSingle'] = () => b;
        b['then'] = (ok: (r: unknown) => unknown) => ok({ data: { id: 'uuid-da-filial' }, error: null });
        return b;
      },
    };
  }
  return { supabase: {}, core: () => tabela('core'), compras: () => tabela('compras') };
});
vi.mock('../../src/services/storage/umaObra', () => ({ obraDaMascara: () => null }));

import { salvarFornecedor } from '../../src/services/supabase/dados';
import { normalizeFornecedor } from '../../src/domain/normalize';

beforeEach(() => {
  tocadas.length = 0;
});

describe('D614 §2.1 — salvar o fornecedor não toca a fornecedor_ecrs', () => {
  it('filial existente, com ECRs no formulário: grava a filial, e só ela', async () => {
    const f = normalizeFornecedor({ id: 'uuid-da-filial', razao_social: 'Filial (teste)', ecrs_atende: [12, 19] });
    expect(await salvarFornecedor(f)).toBe('uuid-da-filial');
    expect(tocadas).toContain('core.fornecedores.upsert');
    expect(tocadas.filter((t) => t.includes('fornecedor_ecrs'))).toEqual([]);
  });

  it('cadastro novo: o mesmo', async () => {
    const f = normalizeFornecedor({ id: 'forn-novo', razao_social: 'Nova (teste)', ecrs_atende: [5] });
    await salvarFornecedor(f);
    expect(tocadas).toContain('core.fornecedores.upsert');
    expect(tocadas.filter((t) => t.includes('fornecedor_ecrs'))).toEqual([]);
  });
});
