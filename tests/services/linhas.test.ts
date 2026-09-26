import { describe, expect, it } from 'vitest';
import {
  COLUNAS_DA_FORNECEDORES,
  bandeirasResolvidas,
  cabecalhoDaOc,
  classificacaoDoCadastroNovo,
  destinatarioDaLinhaDaObra,
  ehFornecedorNovo,
  empresaResolvida,
  fotografiaDaLinhaDaOc,
  linhaDoFornecedor,
  raizDoDocumento,
} from '../../src/services/supabase/linhas';
import { fornecedoresParaOc } from '../../src/domain/fornecedores';
import { readFileSync } from 'node:fs';
import type { Fornecedor, OrdemCompra } from '../../src/domain/types';

function forn(p: Partial<Fornecedor> & { id: string }): Fornecedor {
  return {
    razao_social: 'Fornecedor Qualquer',
    nome_fantasia: '',
    cnpj: '11.111.111/0001-11',
    ie: '',
    endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
    telefones: ['', ''],
    email: '',
    contato_responsavel: '',
    ecrs_atende: [],
    observacoes: '',
    ativo: true,
    criado_em: '',
    atualizado_em: '',
    ...p,
  };
}

describe('linhaDoFornecedor — o que vai para core.fornecedores', () => {
  it('cadastro NOVO nasce com fornece_material = true (decisão do Pedro, 14/09/2026)', () => {
    const linha = linhaDoFornecedor(forn({ id: '' }));
    expect(linha['fornece_material']).toBe(true);
    expect('id' in linha).toBe(false);
  });

  it('o id provisório da tela (forn-…) também conta como novo', () => {
    expect(ehFornecedorNovo({ id: 'forn-1699999999' })).toBe(true);
    expect(linhaDoFornecedor(forn({ id: 'forn-1699999999' }))['fornece_material']).toBe(true);
  });

  it('na EDIÇÃO a coluna não vai: a tela não reclassifica ninguém', () => {
    // Se fosse `true` aqui, abrir um prestador de serviço só para corrigir o
    // telefone o transformaria em fornecedor de material. O upsert só escreve
    // as colunas que recebe — omitir é o que protege.
    const linha = linhaDoFornecedor(forn({ id: 'uuid-de-verdade', presta_servico: true }));
    expect('fornece_material' in linha).toBe(false);
    expect(linha['id']).toBe('uuid-de-verdade');
  });

  it('o CNPJ vai só com dígitos, para o banco não aceitar o mesmo cadastro duas vezes', () => {
    expect(linhaDoFornecedor(forn({ id: '' }))['documento']).toBe('11111111000111');
  });
});

// ── O destinatário da nota (CTO-D390) ────────────────────────────────────────

function oc(p: Partial<OrdemCompra>): OrdemCompra {
  return {
    id: 'oc-1', numero: '', sequencial: 0, ano: 2026, data: '2026-09-15', status: 'rascunho',
    fornecedor_id: 'f1', obra_id: 'o1', condicao_pagamento: '', emitente_id: '', itens: [],
    frete: 0, outras_despesas: 0, desconto_material: 0, observacoes: '', criado_em: '',
    atualizado_em: '', pdf_gerado_em: '', versao: 0, ...p,
  };
}

describe('destinatarioDaLinhaDaObra — a obra aponta empresa OU cliente', () => {
  it('empresa: razão social, CNPJ, pj, e o endereço do cadastro', () => {
    const d = destinatarioDaLinhaDaObra({
      nf_empresa: { razao_social: 'Pneus Fictícios Ltda', cnpj: '12345678000195', cidade: 'Uberlândia', uf: 'MG' },
      nf_cliente: null,
    });
    expect(d).toMatchObject({ nome: 'Pneus Fictícios Ltda', documento: '12345678000195', tipo: 'pj' });
    expect(d?.endereco.cidade).toBe('Uberlândia');
  });

  it('cliente: nome, documento e o tipo de pessoa do cadastro (pf por padrão)', () => {
    const d = destinatarioDaLinhaDaObra({
      nf_empresa: null,
      nf_cliente: { nome: 'Fulano de Tal', documento: '12345678909', tipo_pessoa: 'pf' },
    });
    expect(d).toMatchObject({ nome: 'Fulano de Tal', documento: '12345678909', tipo: 'pf' });
  });

  it('nem um nem outro: nada — a obra não emite', () => {
    expect(destinatarioDaLinhaDaObra({ nf_empresa: null, nf_cliente: null })).toBeUndefined();
    expect(destinatarioDaLinhaDaObra({})).toBeUndefined();
  });
});

describe('fotografiaDaLinhaDaOc — as três colunas de volta para o app', () => {
  it('lê os três quando estão lá', () => {
    expect(
      fotografiaDaLinhaDaOc({ destinatario_nome: 'X', destinatario_documento: '12345678000195', destinatario_tipo: 'pj' }),
    ).toMatchObject({ nome: 'X', documento: '12345678000195', tipo: 'pj' });
  });

  it('OC antiga (nulos) fica sem fotografia', () => {
    expect(
      fotografiaDaLinhaDaOc({ destinatario_nome: null, destinatario_documento: null, destinatario_tipo: null }),
    ).toBeUndefined();
  });
});

describe('cabecalhoDaOc — o que vai e o que não vai', () => {
  it('as três chaves da fotografia NÃO vão: quem fotografa é a porta (20260915110000)', () => {
    const c = cabecalhoDaOc(
      oc({
        status: 'emitida',
        destinatario: {
          nome: 'Pneus Fictícios Ltda', documento: '12345678000195', tipo: 'pj',
          endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
        },
      }),
    );
    expect('destinatario_nome' in c).toBe(false);
    expect('destinatario_documento' in c).toBe(false);
    expect('destinatario_tipo' in c).toBe(false);
    expect(c).toMatchObject({ status: 'emitida', intervencao_id: 'o1' });
  });

  it('emitente_id não vai mais — nem como null (null apagaria o das OCs antigas)', () => {
    expect('emitente_id' in cabecalhoDaOc(oc({ emitente_id: 'antigo' }))).toBe(false);
  });

  it('campo esvaziado vai como null — é o que faz o apagar pegar (contrato de 19/08)', () => {
    const c = cabecalhoDaOc(oc({ observacoes: '', condicao_pagamento: '', fornecedor_id: '' }));
    expect(c['observacoes']).toBeNull();
    expect(c['condicao_pagamento']).toBeNull();
    expect(c['fornecedor_id']).toBeNull();
  });
});

// ── O pedido à fornecedores crua: as colunas, nunca o * (CTO-D551) ────────────

describe('COLUNAS_DA_FORNECEDORES — a OC pede só o que usa da crua', () => {
  const PROIBIDAS = [
    'fornece_material', 'presta_servico', 'categoria_servico',
    'prazo_vencimento_dias', 'prazo_boleto_dias', 'emite_boleto', 'cobranca_direta',
  ];
  const lista: readonly string[] = COLUNAS_DA_FORNECEDORES;

  it('sem o * e sem a classificação nem o costume (que vêm da resolvida)', () => {
    expect(lista).not.toContain('*');
    for (const c of PROIBIDAS) expect(lista).not.toContain(c);
  });

  it('o pedido de verdade usa a lista — e nenhum pedido à fornecedores pede *', () => {
    const dados = readFileSync('src/services/supabase/dados.ts', 'utf-8');
    expect(dados).toMatch(/from\('fornecedores'\)\s*\.select\(COLUNAS_DA_FORNECEDORES\.join\(', '\)\)/);
    expect(dados).not.toMatch(/from\('fornecedores'\)\s*\.select\(\s*['"`][^'"`]*\*/);
  });

  it('tudo o que o mapeador lê da linha crua está na lista (senão, some da tela calado)', () => {
    const dados = readFileSync('src/services/supabase/dados.ts', 'utf-8');
    const ini = dados.indexOf('function paraFornecedor(');
    const corpo = dados.slice(ini, dados.indexOf('\n}\n', ini));
    const lidas = [...corpo.matchAll(/\bl\['(\w+)'\]/g)].map((m) => m[1]!);
    const doEndereco = ['logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep'];
    expect(lidas.length).toBeGreaterThan(5);
    for (const c of [...new Set([...lidas, ...doEndereco])]) expect(lista).toContain(c);
  });

  it('nenhuma escrita grava coluna que a OC não lê — só o fornece_material do cadastro novo', () => {
    const existente = Object.keys(linhaDoFornecedor(forn({ id: 'f1' })));
    for (const c of existente) expect(lista).toContain(c);
    const novo = Object.keys(linhaDoFornecedor(forn({ id: '' }))).filter((c) => !lista.includes(c));
    expect(novo).toEqual(['fornece_material']);
  });
});

// ── A empresa e o bloqueio (CTO-D542) ────────────────────────────────────────

describe('empresaResolvida — a empresa e o bloqueio vêm da resolvida, pelo id', () => {
  const mapa = new Map([['f1', { id: 'f1', empresa_id: 'E-1', bloqueado_para_compra_nova: true }]]);

  it('lê a empresa do BANCO e o bloqueio da filial', () => {
    expect(empresaResolvida({ id: 'f1' }, mapa)).toEqual({ empresa_id: 'E-1', bloqueado_para_compra_nova: true });
  });

  it('a bloqueada lida assim fica fora da Nova OC', () => {
    const f = forn({ id: 'f1', fornece_material: true, ...empresaResolvida({ id: 'f1' }, mapa) });
    expect(fornecedoresParaOc([f])).toEqual([]);
  });

  it('sem linha resolvida (ou de outra filial), nada — nem empresa, nem bloqueio', () => {
    expect(empresaResolvida({ id: 'f2' }, mapa)).toEqual({ empresa_id: undefined, bloqueado_para_compra_nova: undefined });
  });
});

// ── A mãe e a filial (CTO-D519) ──────────────────────────────────────────────

describe('bandeirasResolvidas — a lista da OC lê a classificação resolvida (L7)', () => {
  const resolvidas = (id: string, fornece_material: boolean | null) =>
    new Map([[id, { id, fornece_material }]]);

  it('filial em branco com a mãe dizendo "vende material" ENTRA na OC', () => {
    // O caso medido na produção em 25/09: uma filial da Império das Tintas.
    const crua = { id: 'filial', fornece_material: null };
    const f = forn({ id: 'filial', ...bandeirasResolvidas(crua, resolvidas('filial', true)) });
    expect(fornecedoresParaOc([f]).map((x) => x.id)).toEqual(['filial']);
  });

  it('o que vale é a resolvida, nunca a crua: filial crua true, resolvida false, fica fora', () => {
    const crua = { id: 'filial', fornece_material: true };
    const f = forn({ id: 'filial', ...bandeirasResolvidas(crua, resolvidas('filial', false)) });
    expect(fornecedoresParaOc([f])).toEqual([]);
  });

  it('a junção é pelo id: a resolvida de outra filial não serve', () => {
    const crua = { id: 'a', fornece_material: null };
    expect(bandeirasResolvidas(crua, resolvidas('b', true)).fornece_material).toBeUndefined();
  });

  it('sem linha resolvida, nada — "não disse" não vira sim nem não', () => {
    expect(bandeirasResolvidas({ id: 'x' }, new Map())).toEqual({
      fornece_material: undefined, presta_servico: undefined,
    });
    expect(bandeirasResolvidas({ id: 'x' }, resolvidas('x', null)).fornece_material).toBeUndefined();
  });
});

describe('classificacaoDoCadastroNovo — onde o cadastro novo grava o material (E4)', () => {
  it('mãe em branco: a mãe aprende, a filial fica em branco', () => {
    expect(classificacaoDoCadastroNovo(null)).toEqual({ ensinarMae: true, materialDaFilial: null });
  });

  it('mãe já diz que vende: a filial herda, ninguém escreve na mãe', () => {
    expect(classificacaoDoCadastroNovo(true)).toEqual({ ensinarMae: false, materialDaFilial: null });
  });

  it('mãe diz que NÃO vende: a mãe não é desmentida; a filial difere e diz true', () => {
    expect(classificacaoDoCadastroNovo(false)).toEqual({ ensinarMae: false, materialDaFilial: true });
  });

  it('sem mãe (CPF, sem documento, raiz desconhecida): tudo na filial, como antes', () => {
    expect(classificacaoDoCadastroNovo(undefined)).toEqual({ ensinarMae: false, materialDaFilial: true });
  });

  it('a filial em branco vai como null na linha — e a edição continua sem a coluna', () => {
    expect(linhaDoFornecedor(forn({ id: '' }), null)['fornece_material']).toBeNull();
    expect('fornece_material' in linhaDoFornecedor(forn({ id: 'uuid' }), null)).toBe(false);
  });

  it('raizDoDocumento: 8 dígitos do CNPJ, nada para CPF ou vazio', () => {
    expect(raizDoDocumento('11.111.111/0001-11')).toBe('11111111');
    expect(raizDoDocumento('123.456.789-09')).toBeNull();
    expect(raizDoDocumento('')).toBeNull();
  });
});
