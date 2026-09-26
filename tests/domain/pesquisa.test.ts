import { describe, expect, it } from 'vitest';
import { filtrarOpcoes, normalizarBusca } from '../../src/domain/pesquisa';
import { opcoesDeFornecedor, opcoesDeObra } from '../../src/domain/fornecedores';
import type { Fornecedor, Obra } from '../../src/domain/types';

// Nomes inventados. Nenhum dado de pessoa.
const endereco = { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '' };
function forn(p: Partial<Fornecedor> & { id: string }): Fornecedor {
  return {
    razao_social: 'Fornecedor Qualquer', nome_fantasia: '', cnpj: '', ie: '', endereco,
    telefones: ['', ''], email: '', contato_responsavel: '', ecrs_atende: [], observacoes: '',
    ativo: true, criado_em: '', atualizado_em: '', ...p,
  };
}
function obra(id: string, nome: string): Obra {
  return {
    id, nome, cei: '', endereco, telefone: '', responsavel: '', observacoes: '', ativa: true,
    pasta_oc_path: '', criado_em: '', atualizado_em: '',
  };
}

const obras = opcoesDeObra([
  obra('o1', 'Residencial Jardim das Flores'),
  obra('o2', 'Reforma Galpão Industrial'),
  obra('o3', 'Edifício São João'),
]);

describe('filtrarOpcoes — a lista filtra enquanto a pessoa digita (D541)', () => {
  it('pesquisa vazia devolve a lista INTEIRA, como era antes', () => {
    expect(filtrarOpcoes(obras, '')).toEqual(obras);
    expect(filtrarOpcoes(obras, '   ')).toEqual(obras);
  });

  it('filtra pelo nome, sem caixa e sem acento', () => {
    expect(filtrarOpcoes(obras, 'galpao').map((o) => o.valor)).toEqual(['o2']);
    expect(filtrarOpcoes(obras, 'SÃO').map((o) => o.valor)).toEqual(['o3']);
  });

  it('cada palavra conta, em qualquer ordem', () => {
    expect(filtrarOpcoes(obras, 'flores jardim').map((o) => o.valor)).toEqual(['o1']);
    expect(filtrarOpcoes(obras, 'jardim galpao')).toEqual([]);
  });

  it('o que não existe devolve lista vazia, e não a lista inteira', () => {
    expect(filtrarOpcoes(obras, 'zzz')).toEqual([]);
  });

  it('normalizarBusca junta espaços e tira acento', () => {
    expect(normalizarBusca('  Império   das Tintas ')).toBe('imperio das tintas');
  });
});

describe('opcoesDeFornecedor — acha pelo apelido, pela razão social e pelo fantasia', () => {
  const lista = [
    forn({ id: 'b', razao_social: 'Beija Flor Comércio de Tintas', empresa_apelido: 'Império das Tintas' }),
    forn({ id: 'c', razao_social: 'Cimentos do Planalto Ltda', nome_fantasia: 'CimPlan' }),
  ];
  const opcoes = opcoesDeFornecedor(lista);

  it('pelo apelido da empresa — e o apelido aparece como linha menor', () => {
    expect(filtrarOpcoes(opcoes, 'imperio').map((o) => o.valor)).toEqual(['b']);
    expect(opcoes[0]?.detalhe).toBe('Império das Tintas');
  });

  it('pela razão social e pelo fantasia', () => {
    expect(filtrarOpcoes(opcoes, 'beija').map((o) => o.valor)).toEqual(['b']);
    expect(filtrarOpcoes(opcoes, 'cimplan').map((o) => o.valor)).toEqual(['c']);
  });

  it('apelido que já está no rótulo não se repete embaixo', () => {
    const [o] = opcoesDeFornecedor([forn({ id: 'x', razao_social: 'Zapi Materiais', empresa_apelido: 'Zapi' })]);
    expect(o?.detalhe).toBeUndefined();
  });
});
