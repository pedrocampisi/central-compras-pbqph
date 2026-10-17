import { describe, expect, it } from 'vitest';
import {
  ALCANCES, SEM_REGISTRO, alcanceDaLeitura, alcanceDoEnvio, fraseDaLeitura, materialDoRegistro, problemaDoRegistro,
  registrosDoEnvio, registrosPedidos, textoDoAlcance, tituloDoRegistro, type RegistroPedido, type RegistroRespondido,
} from '../../src/domain/registroDoFornecedor';

/**
 * CTO-D811 §3, D812 §2 e D840: o papel do fornecedor no carimbo, a lógica pura.
 * Quem decide se a ECR pede é o banco; anexar é opcional. Aqui, a leitura, o que
 * falta no papel anexado e o envio.
 */

const pedido = (ecrId: number, posicoes: number[], pede = true, aCadaEntrega = false): RegistroPedido => ({
  ecrId, pede, aCadaEntrega, porque: '', revisao: '00', linhas: [{ rotulo: null, texto: 'O papel (teste)', numerado: true }], posicoes,
});
const ITENS = [
  { posicao: 1, descricao: 'Tubo de teste' },
  { posicao: 2, descricao: 'Joelho de teste' },
  { posicao: 3, descricao: 'Cimento de teste' },
];
const resp = (r: Partial<RegistroRespondido>): RegistroRespondido => ({ ...SEM_REGISTRO, ...r });

describe('o alcance (D811 §3: três valores; na dúvida, deste lote)', () => {
  it('os três, na ordem dos botões, com a recomendação do CTO', () => {
    expect(ALCANCES).toEqual(['lote', 'vale_ate', 'produto']);
  });

  it('a leitura vira o alcance; sem leitura, sem alcance, ou "vale até" sem data, é deste lote', () => {
    expect(alcanceDaLeitura({ alcance: 'vale_ate', validoAte: '2027-06-30', confira: '' })).toEqual({ alcance: 'vale_ate', validoAte: '2027-06-30' });
    expect(alcanceDaLeitura({ alcance: 'produto', validoAte: '2027-06-30', confira: '' })).toEqual({ alcance: 'produto', validoAte: '' });
    expect(alcanceDaLeitura(null)).toEqual({ alcance: 'lote', validoAte: '' });
    expect(alcanceDaLeitura({ alcance: null, validoAte: '', confira: '' })).toEqual({ alcance: 'lote', validoAte: '' });
    expect(alcanceDaLeitura({ alcance: 'vale_ate', validoAte: '30/06/2027', confira: '' })).toEqual({ alcance: 'lote', validoAte: '' });
  });

  it('as palavras da tela', () => {
    expect(textoDoAlcance('lote', '')).toBe('Deste lote');
    expect(textoDoAlcance('vale_ate', '2027-06-30')).toBe('Vale até 30/06/2027');
    expect(textoDoAlcance('vale_ate', '')).toBe('Vale até uma data');
    expect(textoDoAlcance('produto', '')).toBe('Vale para o produto, sem prazo');
    expect(fraseDaLeitura({ alcance: 'vale_ate', validoAte: '2027-06-30', confira: '' })).toBe('O papel diz: vale até 30/06/2027.');
    expect(fraseDaLeitura(null)).toBe('Não consegui ler o papel. Ele conta como deste lote.');
  });
});

describe('o título, sem a palavra do escritório', () => {
  it('nomeia o material pelos itens da ECR; com mais de um, "e mais"', () => {
    expect(materialDoRegistro(pedido(19, [3]), ITENS)).toBe('Cimento de teste');
    expect(materialDoRegistro(pedido(12, [1, 2]), ITENS)).toBe('Tubo de teste e mais 1');
    expect(materialDoRegistro(pedido(12, [9]), ITENS)).toBe('este material');
    expect(tituloDoRegistro('Cimento de teste')).toBe('Papel do fornecedor para Cimento de teste');
    expect(tituloDoRegistro('x')).not.toMatch(/ecr|conforme|certificado|\?/i);
  });

  it('só as ECRs em que o banco diz que pede', () => {
    expect(registrosPedidos([pedido(15, [1], false), pedido(19, [3])]).map((r) => r.ecrId)).toEqual([19]);
    expect(registrosPedidos(undefined)).toEqual([]);
  });
});

describe('o que falta para o "Pronto"', () => {
  const P = [pedido(19, [3])];
  const falta = (r: RegistroRespondido, temFoto = true) =>
    problemaDoRegistro(P, { 19: r }, () => temFoto, (p) => materialDoRegistro(p, ITENS));

  it('sem papel anexado, nada falta: o papel não segura a entrega (D840 §2)', () => {
    expect(problemaDoRegistro(P, {}, () => false, () => 'Cimento de teste')).toBe('');
    expect(falta(SEM_REGISTRO, false)).toBe('');
  });

  it('o papel anexado pede a foto, a conferência, e a data no "vale até"', () => {
    expect(falta(resp({ resposta: 'veio', conferido: true }), false)).toBe('Tire a foto do papel de Cimento de teste, ou toque em "Tirar".');
    expect(falta(resp({ resposta: 'veio' }))).toBe(
      'Confira o que o papel de Cimento de teste diz: toque em "Está certo", ou escolha o certo.',
    );
    expect(falta(resp({ resposta: 'veio', conferido: true, alcance: 'vale_ate', validoAte: '' }))).toBe(
      'Escreva até quando vale o papel de Cimento de teste.',
    );
    expect(falta(resp({ resposta: 'veio', conferido: true, alcance: 'vale_ate', validoAte: '2027-06-30' }))).toBe('');
    expect(falta(resp({ resposta: 'veio', conferido: true }))).toBe('');
  });

  it('na ECR com a marca "a cada entrega", não há o que conferir: é deste lote; a foto ainda falta', () => {
    const M = [pedido(2, [3], true, true)];
    const m = (r: RegistroRespondido, temFoto = true) => problemaDoRegistro(M, { 2: r }, () => temFoto, () => 'Cimento de teste');
    expect(m(resp({ resposta: 'veio' }))).toBe('');
    expect(m(resp({ resposta: 'veio', alcance: 'vale_ate', validoAte: '' }))).toBe('');
    expect(m(resp({ resposta: 'veio' }), false)).toBe('Tire a foto do papel de Cimento de teste, ou toque em "Tirar".');
  });
});

describe('o envio', () => {
  it('só os papéis anexados, nas ECRs que o banco pede; o que não veio não vai (Banco-D840)', () => {
    const lido = { alcance: 'vale_ate' as const, validoAte: '2027-06-30', confira: '' };
    const r = registrosDoEnvio([pedido(6, [1]), pedido(2, [2]), pedido(8, [1])], {
      6: resp({ resposta: 'veio', conferido: true, alcance: 'vale_ate', validoAte: '2027-06-30', lido }),
      2: SEM_REGISTRO,
      15: resp({ resposta: 'veio' }),
    });
    expect(r).toEqual([{ ecrId: 6, resposta: 'veio', alcance: 'vale_ate', validoAte: '2027-06-30', lido }]);
    expect(r.map((x) => x.resposta)).toEqual(['veio']);
  });

  it('na ECR com a marca, vai deste lote, seja o que for que o rascunho tenha', () => {
    expect(registrosDoEnvio([pedido(17, [1], true, true)], {
      17: resp({ resposta: 'veio', conferido: true, alcance: 'vale_ate', validoAte: '2027-06-30' }),
    })).toEqual([{ ecrId: 17, resposta: 'veio', alcance: 'lote', lido: null }]);
    expect(alcanceDoEnvio({ aCadaEntrega: true }, { alcance: 'produto', validoAte: '' })).toEqual({ alcance: 'lote', validoAte: '' });
    expect(alcanceDoEnvio({ aCadaEntrega: false }, { alcance: 'produto', validoAte: '' })).toEqual({ alcance: 'produto', validoAte: '' });
  });

  it('o "veio" que não é "vale até" não leva data', () => {
    expect(registrosDoEnvio([pedido(19, [3])], { 19: resp({ resposta: 'veio', alcance: 'produto', validoAte: '2027-01-01' }) })).toEqual([
      { ecrId: 19, resposta: 'veio', alcance: 'produto', lido: null },
    ]);
  });
});
