import { describe, expect, it } from 'vitest';
import {
  enderecoResumido,
  finalDoCnpj,
  fornecedoresParaOc,
  rotuloDoFornecedor,
} from '../../src/domain/fornecedores';
import type { Fornecedor } from '../../src/domain/types';

// Um fornecedor de mentira, com só o que estas regras olham. Nenhum dado de
// pessoa: os CNPJs são inventados e as razões sociais também.
function forn(p: Partial<Fornecedor> & { id: string }): Fornecedor {
  return {
    razao_social: 'Fornecedor Qualquer',
    nome_fantasia: '',
    cnpj: '',
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

describe('fornecedoresParaOc — quem entra na lista da OC', () => {
  it('deixa entrar só quem fornece material E está ativo', () => {
    const lista = fornecedoresParaOc([
      forn({ id: 'a', fornece_material: true }),
      forn({ id: 'b', fornece_material: true, ativo: false }),
      forn({ id: 'c', presta_servico: true }),
      forn({ id: 'd', fornece_material: true, presta_servico: true }),
    ]);
    expect(lista.map((f) => f.id)).toEqual(['a', 'd']);
  });

  it('o indefinido (o banco não classificou) fica de FORA — não é o mesmo que true', () => {
    // É a linha sem bandeira nenhuma do banco, e é qualquer cadastro que entre
    // sem passar pela tela desta casa. Deixar entrar seria a lista suja de volta.
    const lista = fornecedoresParaOc([
      forn({ id: 'sem-bandeira' }),
      forn({ id: 'falso', fornece_material: false }),
    ]);
    expect(lista).toEqual([]);
  });

  it('reproduz a queixa do Pedro: 224 linhas viram 161', () => {
    // As proporções do banco de produção em 14/09/2026, medidas pelo CTO:
    // 161 fornecem material, 62 só prestam serviço, 1 sem bandeira.
    const todos = [
      ...Array.from({ length: 161 }, (_, i) => forn({ id: `m${i}`, fornece_material: true })),
      ...Array.from({ length: 62 }, (_, i) => forn({ id: `s${i}`, presta_servico: true })),
      forn({ id: 'nenhuma' }),
    ];
    expect(todos).toHaveLength(224);
    expect(fornecedoresParaOc(todos)).toHaveLength(161);
  });
});

describe('rotuloDoFornecedor — filial identificada, nome único limpo', () => {
  const beijaFlor = (id: string, cidade: string, cnpj: string) =>
    forn({
      id,
      razao_social: 'Beija Flor Tintas Ltda',
      cnpj,
      fornece_material: true,
      endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade, uf: 'DF', cep: '' },
    });

  it('nome que aparece uma vez fica SÓ o nome — sem sufixo, sem sujeira', () => {
    const unico = forn({ id: 'x', razao_social: 'Cimentos do Planalto' });
    const lista = [unico, beijaFlor('b1', 'Brasília', '11.111.111/0001-11')];
    expect(rotuloDoFornecedor(unico, lista)).toBe('Cimentos do Planalto');
  });

  it('as filiais da mesma razão social ganham cidade/UF e o final do CNPJ, e ficam distinguíveis', () => {
    const lista = [
      beijaFlor('b1', 'Brasília', '11.111.111/0001-11'),
      beijaFlor('b2', 'Taguatinga', '11.111.111/0002-92'),
      beijaFlor('b3', 'Gama', '11.111.111/0003-73'),
    ];
    const rotulos = lista.map((f) => rotuloDoFornecedor(f, lista));
    expect(rotulos).toEqual([
      'Beija Flor Tintas Ltda · Brasília/DF · ····0111',
      'Beija Flor Tintas Ltda · Taguatinga/DF · ····0292',
      'Beija Flor Tintas Ltda · Gama/DF · ····0373',
    ]);
    expect(new Set(rotulos).size).toBe(3);
  });

  it('duas filiais na MESMA cidade continuam distinguíveis pelo CNPJ', () => {
    const lista = [
      beijaFlor('b1', 'Brasília', '11.111.111/0001-11'),
      beijaFlor('b2', 'Brasília', '11.111.111/0002-92'),
    ];
    const rotulos = lista.map((f) => rotuloDoFornecedor(f, lista));
    expect(new Set(rotulos).size).toBe(2);
  });

  it('a repetição é medida na lista FILTRADA: uma filial que só presta serviço não suja a matriz', () => {
    const matriz = beijaFlor('b1', 'Brasília', '11.111.111/0001-11');
    const filialDeServico = forn({
      ...beijaFlor('b2', 'Gama', '11.111.111/0002-92'),
      fornece_material: undefined,
      presta_servico: true,
    });
    const lista = fornecedoresParaOc([matriz, filialDeServico]);
    expect(rotuloDoFornecedor(matriz, lista)).toBe('Beija Flor Tintas Ltda');
  });

  it('finalDoCnpj: só os quatro últimos dígitos, e vazio quando não há CNPJ', () => {
    expect(finalDoCnpj('11.111.111/0001-11')).toBe('····0111');
    expect(finalDoCnpj('')).toBe('');
    expect(finalDoCnpj(undefined)).toBe('');
  });
});

describe('enderecoResumido — a linha abaixo do campo', () => {
  it('monta em uma linha, sem rótulos, pulando o que está vazio', () => {
    const f = forn({
      id: 'e',
      cnpj: '11.111.111/0001-11',
      endereco: {
        logradouro: 'Rua das Tintas',
        numero: '120',
        complemento: 'Loja 3',
        bairro: 'Setor Industrial',
        cidade: 'Brasília',
        uf: 'DF',
        cep: '',
      },
    });
    expect(enderecoResumido(f)).toBe(
      'Rua das Tintas, 120 Loja 3 · Setor Industrial · Brasília/DF · CNPJ 11.111.111/0001-11',
    );
  });

  it('CNPJ que vem do banco só em dígitos sai pontuado', () => {
    const f = forn({ id: 'd', cnpj: '11111111000111' });
    expect(enderecoResumido(f)).toBe('CNPJ 11.111.111/0001-11');
  });

  it('sem fornecedor escolhido, nada aparece', () => {
    expect(enderecoResumido(undefined)).toBe('');
  });
});
