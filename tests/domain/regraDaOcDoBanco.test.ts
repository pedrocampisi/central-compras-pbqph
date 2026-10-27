import { describe, expect, it } from 'vitest';

/**
 * CTO-D953 (escolha A), D954: a regra de quem entra na Nova OC e de que filial
 * a OC grava é do banco (`compras.regra_da_oc`), a mesma que a IA usa pelo MCP.
 * A tela lê: quando a carga trouxe a resposta do banco, ela vale, mesmo contra a
 * conta escrita aqui. Sem ela (o formato antigo de arquivo), vale a conta daqui,
 * que é também a régua do teste do Banco. Filiais INVENTADAS.
 */
import {
  agruparPorEmpresa, entraNaOc, escolherEmpresa, filialPrincipal, fornecedoresParaOc, motivoForaDaOc,
} from '../../src/domain/fornecedores';
import { normalizeFornecedor } from '../../src/domain/normalize';
import type { Fornecedor } from '../../src/domain/types';

const filial = (id: string, cnpj: string, extra: Partial<Fornecedor> = {}): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: 'Casa (teste)', cnpj }),
  ativo: true,
  fornece_material: true,
  bloqueado_para_compra_nova: false,
  empresa_id: 'casa',
  ...extra,
});

describe('D954 — a regra da OC lida do banco', () => {
  it('entra na OC: a resposta do banco vale, nos dois sentidos', () => {
    const daqui = filial('a', '33333333000100');
    expect(entraNaOc(daqui)).toBe(true);
    expect(entraNaOc({ ...daqui, entra_na_oc: false })).toBe(false);
    const fora = filial('b', '33333333000281', { fornece_material: false });
    expect(entraNaOc(fora)).toBe(false);
    expect(entraNaOc({ ...fora, entra_na_oc: true })).toBe(true);
  });

  it('o banco diz que não, e o cadastro não diz por quê: o rótulo diz que está fora da lista da OC', () => {
    expect(motivoForaDaOc(filial('a', '33333333000100', { entra_na_oc: false }))).toBe('fora da lista da OC');
    expect(motivoForaDaOc(filial('a', '33333333000100', { entra_na_oc: true }))).toBe('');
    expect(motivoForaDaOc(filial('a', '33333333000100', { ativo: false, entra_na_oc: false }))).toBe('inativa');
  });

  it('a lista da Nova OC segue o banco, e a filial gravada na OC aberta continua aparecendo', () => {
    const lista = [
      filial('a', '33333333000100', { entra_na_oc: true, filial_da_oc: 'a' }),
      filial('b', '33333333000281', { entra_na_oc: false, filial_da_oc: 'a' }),
    ];
    expect(fornecedoresParaOc(lista).map((f) => f.id)).toEqual(['a']);
    expect(fornecedoresParaOc(lista, 'b').map((f) => f.id)).toEqual(['a', 'b']);
  });

  it('a filial da OC é a que o banco diz, mesmo quando a conta daqui escolheria a matriz', () => {
    const [grupo] = agruparPorEmpresa([
      filial('matriz', '33333333000100', { entra_na_oc: true, filial_da_oc: 'loja2' }),
      filial('loja2', '33333333000281', { entra_na_oc: true, filial_da_oc: 'loja2' }),
    ]);
    expect(filialPrincipal(grupo!)?.id).toBe('loja2');
    expect(escolherEmpresa(grupo, '')).toBe('loja2');
    // A filial já gravada que ainda entra fica (o rascunho antigo não troca sozinho).
    expect(escolherEmpresa(grupo, 'matriz')).toBe('matriz');
  });

  it('o banco diz que nenhuma filial pode: nenhuma; a que ele diz e não está na lista: nenhuma', () => {
    const [semNenhuma] = agruparPorEmpresa([
      filial('a', '33333333000100', { entra_na_oc: false, filial_da_oc: null }),
    ]);
    expect(filialPrincipal(semNenhuma!)).toBeUndefined();
    expect(escolherEmpresa(semNenhuma, '')).toBe('');
    const [foraDaLista] = agruparPorEmpresa([
      filial('a', '33333333000100', { entra_na_oc: true, filial_da_oc: 'outra' }),
    ]);
    expect(filialPrincipal(foraDaLista!)).toBeUndefined();
  });

  it('a filial que não veio na regra do banco não desempata: vale a resposta das irmãs', () => {
    const [grupo] = agruparPorEmpresa([
      filial('matriz', '33333333000100', { entra_na_oc: false }),
      filial('loja2', '33333333000281', { entra_na_oc: true, filial_da_oc: 'loja2' }),
    ]);
    expect(filialPrincipal(grupo!)?.id).toBe('loja2');
  });

  it('sem a resposta do banco (o formato antigo de arquivo), a conta daqui: a matriz', () => {
    const [grupo] = agruparPorEmpresa([filial('loja2', '33333333000281'), filial('matriz', '33333333000100')]);
    expect(filialPrincipal(grupo!)?.id).toBe('matriz');
  });
});
