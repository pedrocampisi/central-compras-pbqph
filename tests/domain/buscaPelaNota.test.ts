import { describe, expect, it, vi } from 'vitest';

// A leitura mora junto da chamada ao servidor; o cliente é falso, e nada sai daqui.
vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

import { filtrarOpcoes, notaDaBusca, pelaNota } from '../../src/domain/pesquisa';
import {
  agruparPorEmpresa, apelidoDoFornecedor, empresasDaTela, opcoesDeEmpresa, opcoesDeObra,
} from '../../src/domain/fornecedores';
import { normalizeFornecedor, normalizeItem, normalizeOC, normalizeObra } from '../../src/domain/normalize';
import { buildPdfFilename } from '../../src/services/pdf/pdfFilename';
import { desfazerEntidades } from '../../src/domain/entidades';
import { linhaEmBranco, semLinhasEmBranco, travaDaQuantidade } from '../../src/domain/itensDaEmissao';
import { paraResultado } from '../../src/services/ai/extractItems';
import type { Fornecedor } from '../../src/domain/types';

/**
 * CTO-D680: a busca pelo que bate melhor, o PDF com o apelido, a linha de
 * quantidade 0 e a entidade de HTML da leitura. Empresas, CNPJs e obras
 * INVENTADOS; o caso do "co" imita o da foto do Pedro, com nomes de teste.
 */

const filial = (
  id: string,
  o: { razao: string; apelido?: string; empresa?: string; cnpj?: string; ativo?: boolean; bloqueada?: boolean },
): Fornecedor => ({
  ...normalizeFornecedor({ id, razao_social: o.razao, cnpj: o.cnpj ?? '' }),
  ativo: o.ativo ?? true,
  fornece_material: true,
  bloqueado_para_compra_nova: o.bloqueada ?? false,
  empresa_id: o.empresa,
  empresa_apelido: o.apelido,
});

// O caso da foto: "ABR Gesso" vem antes no alfabeto e tem "co" no meio da razão social.
const ABR = filial('abr', { razao: 'ABR GESSO E COMERCIO DE ACABAMENTOS LTDA (teste)', apelido: 'ABR Gesso (teste)', empresa: 'e-abr', cnpj: '11111111000191' });
const COMARCO = filial('com', { razao: 'COMARCO COMERCIAL E INDUSTRIA LTDA (teste)', apelido: 'Comarco (teste)', empresa: 'e-com', cnpj: '22222222000172' });
const CASA = filial('casa', { razao: 'CASA DO CONSTRUTOR ALFA LTDA (teste)', apelido: 'Casa do Construtor (teste)', empresa: 'e-casa', cnpj: '33333333000153' });
const ECO = filial('eco', { razao: 'ECOMIX ARGAMASSAS LTDA (teste)', apelido: 'Ecomix (teste)', empresa: 'e-eco', cnpj: '44444444000134' });
const CADASTRO = [ABR, CASA, COMARCO, ECO];

describe('CTO-D680 — a nota da busca (a régua da Central)', () => {
  it('0 o nome é o termo; 1 começa; 2 uma palavra começa; 3 no meio; 4 não está no nome', () => {
    expect(notaDaBusca('comarco', ['Comarco'])).toBe(0);
    expect(notaDaBusca('co', ['Comarco'])).toBe(1);
    expect(notaDaBusca('co', ['Casa do Construtor'])).toBe(2);
    expect(notaDaBusca('co', ['Ecomix'])).toBe(3);
    expect(notaDaBusca('co', ['ABR Gesso'])).toBe(4);
  });

  it('sem caixa, sem acento, e a pontuação vira espaço', () => {
    expect(notaDaBusca('ACO', ['Aço Forte'])).toBe(1);
    expect(notaDaBusca('r 263', ['R-263'])).toBe(0);
  });

  it('vale o melhor dos nomes', () => {
    expect(notaDaBusca('co', ['ABR Gesso', 'Comarco'])).toBe(1);
  });

  it('o documento conta com 3 algarismos ou mais', () => {
    expect(notaDaBusca('22.222.222/0001-72', ['Comarco'], ['22222222000172'])).toBe(0);
    expect(notaDaBusca('222', ['Comarco'], ['22222222000172'])).toBe(1);
    expect(notaDaBusca('22', ['Comarco'], ['22222222000172'])).toBe(4);
  });

  it('pelaNota: pela nota; na mesma nota, o que desce vai para baixo; no resto, a ordem que já vinha', () => {
    const itens = [
      { n: 'a', nota: 2, d: false },
      { n: 'b', nota: 1, d: true },
      { n: 'c', nota: 1, d: false },
      { n: 'd', nota: 2, d: false },
      { n: 'e', nota: 1, d: false },
    ];
    expect(pelaNota(itens, (x) => x.nota, (x) => x.d).map((x) => x.n)).toEqual(['c', 'e', 'b', 'a', 'd']);
  });
});

describe('CTO-D680 — a escolha de fornecedor e de obra', () => {
  it('"co" põe a Comarco no alto, e a ABR Gesso (que casa pela razão social) por último', () => {
    const opcoes = opcoesDeEmpresa(agruparPorEmpresa(CADASTRO));
    expect(opcoes.map((o) => o.rotulo)).toEqual([
      'ABR Gesso (teste)', 'Casa do Construtor (teste)', 'Comarco (teste)', 'Ecomix (teste)',
    ]);
    expect(filtrarOpcoes(opcoes, 'co').map((o) => o.rotulo)).toEqual([
      'Comarco (teste)', 'Casa do Construtor (teste)', 'Ecomix (teste)', 'ABR Gesso (teste)',
    ]);
  });

  it('a empresa sem filial que receba OC desce na mesma nota, e não some', () => {
    const outra = filial('com2', { razao: 'COMERCIAL BETA LTDA (teste)', apelido: 'Comercial Beta (teste)', empresa: 'e-beta', bloqueada: true });
    const opcoes = opcoesDeEmpresa(agruparPorEmpresa([outra, COMARCO]));
    expect(filtrarOpcoes(opcoes, 'co').map((o) => o.rotulo)).toEqual(['Comarco (teste)', 'Comercial Beta (teste)']);
  });

  it('a obra encerrada desce na mesma nota', () => {
    const obras = opcoesDeObra([
      { ...normalizeObra({ id: 'o1', nome: 'Residencial Centro (teste)' }), ativa: false },
      { ...normalizeObra({ id: 'o2', nome: 'Reforma da Escola (teste)' }), ativa: true },
      { ...normalizeObra({ id: 'o3', nome: 'Galpão Rezende (teste)' }), ativa: true },
    ]);
    expect(filtrarOpcoes(obras, 're').map((o) => o.valor)).toEqual(['o2', 'o1', 'o3']);
  });
});

describe('CTO-D680 — a tela de Fornecedores', () => {
  it('"co" põe a Comarco no alto', () => {
    const { empresas } = empresasDaTela(CADASTRO, 'co', 'todos');
    expect(empresas.map((g) => g.apelido)).toEqual([
      'Comarco (teste)', 'Casa do Construtor (teste)', 'Ecomix (teste)', 'ABR Gesso (teste)',
    ]);
  });

  it('o CNPJ colado põe a empresa dele no alto', () => {
    const { empresas } = empresasDaTela(CADASTRO, '44.444.444', 'todos');
    expect(empresas[0]!.apelido).toBe('Ecomix (teste)');
  });

  it('a empresa sem filial ativa desce na mesma nota; sem busca, a ordem de sempre', () => {
    const inativa = filial('ci', { razao: 'COMERCIAL GAMA LTDA (teste)', apelido: 'Comercial Gama (teste)', empresa: 'e-gama', ativo: false });
    const { empresas } = empresasDaTela([inativa, COMARCO], 'com', 'todos');
    expect(empresas.map((g) => g.apelido)).toEqual(['Comarco (teste)', 'Comercial Gama (teste)']);
    expect(empresasDaTela([inativa, COMARCO], '', 'todos').empresas.map((g) => g.apelido)).toEqual([
      'Comarco (teste)', 'Comercial Gama (teste)',
    ]);
  });
});

describe('CTO-D680 — o nome do PDF com o apelido', () => {
  const oc = normalizeOC({
    id: 'oc1', data: '2026-09-18', fornecedor_id: 'com',
    itens: [normalizeItem({ descricao: 'Item de teste', quantidade: 1, unidade: 'un', preco_unit: 263.29 })],
  });

  it('com apelido: o apelido, e não a razão social inteira', () => {
    expect(buildPdfFilename(oc, apelidoDoFornecedor(COMARCO))).toBe('comarco teste 2026-09-18 R-263-29 oc.pdf');
  });

  it('sem apelido: a razão social, como antes', () => {
    const semApelido = filial('x', { razao: 'COMERCIAL DELTA LTDA' });
    expect(apelidoDoFornecedor(semApelido)).toBe('COMERCIAL DELTA LTDA');
    expect(apelidoDoFornecedor({ ...semApelido, empresa_apelido: '   ' })).toBe('COMERCIAL DELTA LTDA');
    expect(buildPdfFilename(oc, apelidoDoFornecedor(semApelido))).toBe('comercial delta ltda 2026-09-18 R-263-29 oc.pdf');
  });
});

describe('CTO-D680 — a entidade de HTML da leitura', () => {
  it('desfaz a entidade numérica, a hexadecimal e as nomeadas', () => {
    expect(desfazerEntidades('DISCO SERRA F&#x3D;3/4')).toBe('DISCO SERRA F=3/4');
    expect(desfazerEntidades('A&#61;B &amp; C &lt;10&gt; &quot;x&quot; &#39;y&#39;')).toBe('A=B & C <10> "x" \'y\'');
  });

  it('uma passada só, e o que não é entidade fica como está', () => {
    expect(desfazerEntidades('&amp;#x3D;')).toBe('&#x3D;');
    expect(desfazerEntidades('P&D e 5 & 6')).toBe('P&D e 5 & 6');
    expect(desfazerEntidades('&naoexiste; &#0; &#x1;')).toBe('&naoexiste; &#0; &#x1;');
  });

  it('a leitura do pedido entrega o item já desfeito', () => {
    const r = paraResultado({
      itens: [{ descricao: 'DISCO SERRA 110MM F&#x3D;3/4', observacao: 'A&amp;B', quantidade: 2, unidade: 'un', preco_unit: 10 }],
      ignoradas: ['linha &#x3D; solta'],
    });
    expect(r.itens[0]!.descricao).toBe('DISCO SERRA 110MM F=3/4');
    expect(r.itens[0]!.observacao).toBe('A&B');
    expect(r.ignoradas).toEqual(['linha = solta']);
  });
});

describe('CTO-D680 — a linha com quantidade 0 não emite', () => {
  const item = (descricao: string, quantidade: number, preco_unit: number) =>
    normalizeItem({ descricao, quantidade, unidade: 'un', preco_unit });

  it('a linha em branco é a sem descrição, quantidade e preço', () => {
    expect(linhaEmBranco(item('', 0, 0))).toBe(true);
    expect(linhaEmBranco(item('Cimento', 0, 0))).toBe(false);
    expect(linhaEmBranco(item('', 0, 5))).toBe(false);
  });

  it('na Nova OC: a linha em branco some, e a de quantidade 0 recusa dizendo qual é', () => {
    const itens = [item('', 0, 0), item('Luva de raspa', 0, 0), item('Cimento', 2, 30)];
    expect(semLinhasEmBranco(itens).map((i) => i.descricao)).toEqual(['Luva de raspa', 'Cimento']);
    expect(travaDaQuantidade(itens, 'nova-oc')).toBe(
      'O item 2 (Luva de raspa) está com quantidade 0. Informe a quantidade ou apague a linha, e emita de novo.',
    );
    expect(travaDaQuantidade([item('', 0, 0), item('Cimento', 2, 30)], 'nova-oc')).toBe('');
  });

  it('no Histórico, que só troca o status, a linha em branco também recusa', () => {
    expect(travaDaQuantidade([item('Cimento', 2, 30), item('', 0, 0)], 'historico')).toBe(
      'O item 2 está com quantidade 0. Abra a OC em Editar, informe a quantidade ou apague a linha, e emita de novo.',
    );
  });

  it('quantidade negativa ou vazia também recusa', () => {
    expect(travaDaQuantidade([item('Areia', -1, 10)], 'nova-oc')).toMatch(/^O item 1 \(Areia\)/);
    expect(travaDaQuantidade([{ descricao: 'Brita', quantidade: Number.NaN, preco_unit: 10 }], 'nova-oc')).toMatch(/^O item 1/);
  });
});
