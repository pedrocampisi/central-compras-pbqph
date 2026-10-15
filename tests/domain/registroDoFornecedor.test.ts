import { describe, expect, it } from 'vitest';
import {
  ALCANCES, SEM_REGISTRO, alcanceDaLeitura, fraseDaLeitura, materialDoRegistro, perguntaDoRegistro, problemaDoRegistro,
  registrosDoEnvio, registrosPedidos, textoDoAlcance, type RegistroPedido, type RegistroRespondido,
} from '../../src/domain/registroDoFornecedor';

/**
 * CTO-D811 §3 e D812 §2: o papel do fornecedor no carimbo, a lógica pura. Quem
 * decide se pergunta é o banco; aqui, a leitura, o que falta e o envio.
 */

const pedido = (ecrId: number, posicoes: number[], pede = true): RegistroPedido => ({
  ecrId, pede, porque: '', revisao: '00', linhas: [{ texto: 'O papel (teste)', numerado: true }], posicoes,
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

describe('a pergunta, sem a palavra do escritório', () => {
  it('nomeia o material pelos itens da ECR; com mais de um, "e mais"', () => {
    expect(materialDoRegistro(pedido(19, [3]), ITENS)).toBe('Cimento de teste');
    expect(materialDoRegistro(pedido(12, [1, 2]), ITENS)).toBe('Tubo de teste e mais 1');
    expect(materialDoRegistro(pedido(12, [9]), ITENS)).toBe('este material');
    expect(perguntaDoRegistro('Cimento de teste')).toBe('Veio o papel do fornecedor para Cimento de teste?');
    expect(perguntaDoRegistro('x')).not.toMatch(/ecr|conforme|certificado/i);
  });

  it('só as ECRs em que o banco manda perguntar', () => {
    expect(registrosPedidos([pedido(15, [1], false), pedido(19, [3])]).map((r) => r.ecrId)).toEqual([19]);
    expect(registrosPedidos(undefined)).toEqual([]);
  });
});

describe('o que falta para o "Pronto"', () => {
  const P = [pedido(19, [3])];
  const falta = (r: RegistroRespondido, temFoto = true) =>
    problemaDoRegistro(P, { 19: r }, () => temFoto, (p) => materialDoRegistro(p, ITENS));

  it('sem resposta: pergunta de novo', () => {
    expect(problemaDoRegistro(P, {}, () => true, () => 'Cimento de teste')).toBe(
      'Falta responder: Veio o papel do fornecedor para Cimento de teste?',
    );
  });

  it('"Não se aplica" pede o porquê; "Não veio" não pede nada', () => {
    expect(falta(resp({ resposta: 'nao_se_aplica', motivo: '  ' }))).toBe('Diga por que o papel de Cimento de teste não se aplica.');
    expect(falta(resp({ resposta: 'nao_se_aplica', motivo: 'é compensado' }))).toBe('');
    expect(falta(resp({ resposta: 'nao_veio' }))).toBe('');
  });

  it('"Veio" pede a foto, a conferência, e a data no "vale até"', () => {
    expect(falta(resp({ resposta: 'veio', conferido: true }), false)).toBe('Tire a foto do papel de Cimento de teste.');
    expect(falta(resp({ resposta: 'veio' }))).toBe(
      'Confira o que o papel de Cimento de teste diz: toque em "Está certo", ou escolha o certo.',
    );
    expect(falta(resp({ resposta: 'veio', conferido: true, alcance: 'vale_ate', validoAte: '' }))).toBe(
      'Escreva até quando vale o papel de Cimento de teste.',
    );
    expect(falta(resp({ resposta: 'veio', conferido: true, alcance: 'vale_ate', validoAte: '2027-06-30' }))).toBe('');
    expect(falta(resp({ resposta: 'veio', conferido: true }))).toBe('');
  });
});

describe('o envio', () => {
  it('só as ECRs pedidas e respondidas; cada resposta com o que é dela', () => {
    const lido = { alcance: 'vale_ate' as const, validoAte: '2027-06-30', confira: '' };
    const r = registrosDoEnvio([pedido(6, [1]), pedido(2, [2]), pedido(19, [3]), pedido(8, [1])], {
      6: resp({ resposta: 'veio', conferido: true, alcance: 'vale_ate', validoAte: '2027-06-30', lido }),
      2: resp({ resposta: 'nao_se_aplica', motivo: ' é compensado ' }),
      19: resp({ resposta: 'nao_veio', motivo: 'sobrou de antes' }),
      15: resp({ resposta: 'nao_veio' }),
    });
    expect(r).toEqual([
      { ecrId: 6, resposta: 'veio', alcance: 'vale_ate', validoAte: '2027-06-30', lido },
      { ecrId: 2, resposta: 'nao_se_aplica', motivo: 'é compensado' },
      { ecrId: 19, resposta: 'nao_veio' },
    ]);
  });

  it('o "veio" que não é "vale até" não leva data', () => {
    expect(registrosDoEnvio([pedido(19, [3])], { 19: resp({ resposta: 'veio', alcance: 'produto', validoAte: '2027-01-01' }) })).toEqual([
      { ecrId: 19, resposta: 'veio', alcance: 'produto', lido: null },
    ]);
  });
});
