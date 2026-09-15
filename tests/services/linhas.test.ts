import { describe, expect, it } from 'vitest';
import {
  cabecalhoDaOc,
  destinatarioDaLinhaDaObra,
  ehFornecedorNovo,
  fotografiaDaLinhaDaOc,
  linhaDoFornecedor,
} from '../../src/services/supabase/linhas';
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

describe('cabecalhoDaOc — a fotografia vai SÓ quando a OC a carrega', () => {
  it('rascunho: as três chaves ficam AUSENTES (ausente = não mexe; null apagaria)', () => {
    const c = cabecalhoDaOc(oc({}));
    expect('destinatario_nome' in c).toBe(false);
    expect('destinatario_documento' in c).toBe(false);
    expect('destinatario_tipo' in c).toBe(false);
    expect(c['intervencao_id']).toBe('o1');
  });

  it('emitente_id não vai mais — nem como null (null apagaria o das OCs antigas)', () => {
    expect('emitente_id' in cabecalhoDaOc(oc({ emitente_id: 'antigo' }))).toBe(false);
  });

  it('emissão com destinatário: os três juntos, documento só em dígitos', () => {
    const c = cabecalhoDaOc(
      oc({
        status: 'emitida',
        destinatario: {
          nome: 'Pneus Fictícios Ltda', documento: '12.345.678/0001-95', tipo: 'pj',
          endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' },
        },
      }),
    );
    expect(c).toMatchObject({
      status: 'emitida',
      destinatario_nome: 'Pneus Fictícios Ltda',
      destinatario_documento: '12345678000195',
      destinatario_tipo: 'pj',
    });
  });

  it('campo esvaziado vai como null — é o que faz o apagar pegar (contrato de 19/08)', () => {
    const c = cabecalhoDaOc(oc({ observacoes: '', condicao_pagamento: '', fornecedor_id: '' }));
    expect(c['observacoes']).toBeNull();
    expect(c['condicao_pagamento']).toBeNull();
    expect(c['fornecedor_id']).toBeNull();
  });
});
