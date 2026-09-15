import { describe, expect, it } from 'vitest';
import {
  MENSAGEM_OBRA_SEM_DESTINATARIO,
  destinatarioDaObra,
  destinatarioParaImpressao,
  documentoRotulado,
  formatarDocumento,
  rotuloFaturarPara,
} from '../../src/domain/destinatario';
import type { Destinatario, Endereco, Obra } from '../../src/domain/types';

// Tudo inventado: nomes, documentos e endereços. Nenhum dado de pessoa.
const enderecoVazio: Endereco = {
  logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', cep: '',
};
const enderecoDaEmpresa: Endereco = {
  ...enderecoVazio, logradouro: 'Av. das Empresas', numero: '1000', cidade: 'Uberlândia', uf: 'MG',
};

const empresa: Destinatario = {
  nome: 'Pneus Fictícios Ltda',
  documento: '12345678000195',
  tipo: 'pj',
  endereco: enderecoDaEmpresa,
};
const pessoa: Destinatario = {
  nome: 'Fulano de Tal',
  documento: '12345678909',
  tipo: 'pf',
  endereco: enderecoVazio,
};

function obra(p: Partial<Obra> & { id: string }): Obra {
  return {
    nome: 'Obra Qualquer', cei: '', endereco: enderecoVazio, telefone: '', responsavel: '',
    observacoes: '', ativa: true, pasta_oc_path: '', criado_em: '', atualizado_em: '', ...p,
  };
}

describe('destinatarioDaObra — a OC lê, não escolhe', () => {
  it('devolve o destinatário que a obra aponta', () => {
    expect(destinatarioDaObra(obra({ id: 'a', destinatario: empresa }))).toBe(empresa);
  });

  it('obra sem destinatário devolve nada — e nada é "não emite"', () => {
    expect(destinatarioDaObra(obra({ id: 'b' }))).toBeUndefined();
    expect(destinatarioDaObra(undefined)).toBeUndefined();
    expect(MENSAGEM_OBRA_SEM_DESTINATARIO).toBe(
      'Esta obra não tem destinatário da nota cadastrado. Cadastre no Central.',
    );
  });
});

describe('documento — o grão do banco de um lado, a leitura da pessoa do outro', () => {
  it('formata CNPJ e CPF a partir dos dígitos', () => {
    expect(formatarDocumento('12345678000195', 'pj')).toBe('12.345.678/0001-95');
    expect(formatarDocumento('12345678909', 'pf')).toBe('123.456.789-09');
  });

  it('o que não cabe no grão volta como veio, sem inventar pontuação', () => {
    expect(formatarDocumento('123', 'pj')).toBe('123');
  });

  it('rotula com CNPJ ou CPF conforme o tipo', () => {
    expect(documentoRotulado(empresa)).toBe('CNPJ 12.345.678/0001-95');
    expect(documentoRotulado(pessoa)).toBe('CPF 123.456.789-09');
  });

  it('a linha da tela: "Faturar para: Nome · CNPJ …", e vazia sem destinatário', () => {
    expect(rotuloFaturarPara(empresa)).toBe('Faturar para: Pneus Fictícios Ltda · CNPJ 12.345.678/0001-95');
    expect(rotuloFaturarPara(undefined)).toBe('');
  });
});

describe('destinatarioParaImpressao — a fotografia vence o cadastro de hoje', () => {
  const obras = [obra({ id: 'o1', destinatario: empresa })];

  it('rascunho sem fotografia imprime o que a obra aponta hoje', () => {
    expect(destinatarioParaImpressao({ obra_id: 'o1' }, obras)).toBe(empresa);
  });

  it('OC emitida imprime a fotografia mesmo que a obra tenha mudado de destinatário', () => {
    const foto: Destinatario = { ...pessoa, endereco: enderecoVazio };
    const r = destinatarioParaImpressao({ obra_id: 'o1', destinatario: foto }, obras);
    expect(r?.nome).toBe('Fulano de Tal');
    expect(r?.documento).toBe('12345678909');
    expect(r?.endereco).toEqual(enderecoVazio);
  });

  it('se a obra ainda aponta para a mesma pessoa, o endereço do cadastro vai junto', () => {
    const foto: Destinatario = { ...empresa, endereco: enderecoVazio };
    const r = destinatarioParaImpressao({ obra_id: 'o1', destinatario: foto }, obras);
    expect(r?.endereco).toEqual(enderecoDaEmpresa);
  });
});
