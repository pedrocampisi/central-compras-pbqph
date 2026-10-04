import { describe, expect, it } from 'vitest';
import {
  PERGUNTAS_DO_MESTRE,
  SEM_RESPOSTA,
  avaliacaoDoMestre,
  diaCombinado,
  naosDoMestre,
  oQueAconteceuObrigatorio,
  oQueFalta,
  perguntaOQueAconteceu,
  quantidadeFalada,
  type RespostasDoMestre,
} from '../../src/domain/recebimento';

/**
 * CTO-D693: o que o mestre de obra responde, na fala dele, vira a avaliação
 * do PS.02 — as mesmas três perguntas do escritório, mais o "chegou tudo",
 * que é entrega parcial e não defeito.
 */

const tudoSim: RespostasDoMestre = { noDia: true, semEstrago: true, oQueFoiPedido: true, tudo: true };

describe('as perguntas do mestre', () => {
  it('são quatro, na ordem da carta, e a última responde "Só uma parte"', () => {
    expect(PERGUNTAS_DO_MESTRE.map((p) => p.texto)).toEqual([
      'Chegou no dia combinado?',
      'Chegou sem estrago?',
      'Chegou o que foi pedido?',
      'Chegou tudo?',
    ]);
    expect(PERGUNTAS_DO_MESTRE[3].nao).toBe('Só uma parte');
  });

  it('nenhuma palavra do escritório aparece para ele', () => {
    const tudo = PERGUNTAS_DO_MESTRE.flatMap((p) => [p.texto, p.sim, p.nao]).join(' ');
    expect(tudo).not.toMatch(/conforme|ecr|tratativa/i);
  });
});

describe('os "Não"', () => {
  it('contam só as três perguntas do PS.02; "Só uma parte" não é "Não"', () => {
    expect(naosDoMestre({ ...tudoSim, tudo: false })).toBe(0);
    expect(naosDoMestre({ ...tudoSim, noDia: false, semEstrago: false })).toBe(2);
  });

  it('"O que aconteceu?" aparece com qualquer "Não" ou com "Só uma parte"', () => {
    expect(perguntaOQueAconteceu(tudoSim)).toBe(false);
    expect(perguntaOQueAconteceu({ ...tudoSim, semEstrago: false })).toBe(true);
    expect(perguntaOQueAconteceu({ ...tudoSim, tudo: false })).toBe(true);
  });

  it('e é obrigatória só com dois ou mais "Não"', () => {
    expect(oQueAconteceuObrigatorio({ ...tudoSim, noDia: false })).toBe(false);
    expect(oQueAconteceuObrigatorio({ ...tudoSim, noDia: false, oQueFoiPedido: false })).toBe(true);
    expect(oQueAconteceuObrigatorio({ ...tudoSim, noDia: false, tudo: false })).toBe(false);
  });
});

describe('o que falta para o "Pronto"', () => {
  it('a primeira pergunta sem resposta, pelo texto dela', () => {
    expect(oQueFalta(SEM_RESPOSTA, '1', '')).toBe('Falta responder: Chegou no dia combinado?');
    expect(oQueFalta({ ...tudoSim, tudo: null }, '1', '')).toBe('Falta responder: Chegou tudo?');
  });

  it('a nota: a foto ou o número', () => {
    expect(oQueFalta(tudoSim, '  ', '')).toBe('Tire a foto da nota, ou escreva o número dela.');
  });

  it('o texto, com dois "Não"', () => {
    const r = { ...tudoSim, noDia: false, semEstrago: false };
    expect(oQueFalta(r, '123', ' ')).toBe('Conte o que aconteceu: tem mais de um "Não".');
    expect(oQueFalta(r, '123', 'atrasou e rasgou')).toBe('');
  });

  it('nada, com tudo respondido e um "Não" sem texto', () => {
    expect(oQueFalta({ ...tudoSim, noDia: false }, '123', '')).toBe('');
  });
});

describe('a avaliação que vai ao banco', () => {
  it('as respostas viram as três do PS.02, e o texto vira observação com menos de dois "Não"', () => {
    expect(avaliacaoDoMestre({ ...tudoSim, noDia: false }, ' 000123 ', ' chegou de tarde ', '2026-10-05')).toEqual({
      notaFiscal: '000123',
      recebidoEm: '2026-10-05',
      prazoConforme: false,
      integridadeConforme: true,
      ocEcrConforme: true,
      observacao: 'chegou de tarde',
      tratativa: '',
    });
  });

  it('e vira tratativa com dois ou mais', () => {
    const a = avaliacaoDoMestre({ ...tudoSim, noDia: false, semEstrago: false }, '9', '4 sacos rasgados', '2026-10-05');
    expect(a.tratativa).toBe('4 sacos rasgados');
    expect(a.observacao).toBe('');
  });
});

describe('o dia combinado, como se fala no canteiro', () => {
  const hoje = '2026-10-05';
  it('hoje, amanhã, ontem', () => {
    expect(diaCombinado('2026-10-05', hoje)).toBe('hoje');
    expect(diaCombinado('2026-10-06', hoje)).toBe('amanhã');
    expect(diaCombinado('2026-10-04', hoje)).toBe('ontem');
  });
  it('os outros dias, com o nome do dia', () => {
    expect(diaCombinado('2026-10-02', hoje)).toBe('sexta, 02/10');
    expect(diaCombinado('2026-10-13', hoje)).toBe('terça, 13/10');
  });
  it('sem data, diz que não tem', () => {
    expect(diaCombinado('', hoje)).toBe('sem dia combinado');
    expect(diaCombinado('05/10', hoje)).toBe('sem dia combinado');
  });
});

describe('a quantidade', () => {
  it('sem zeros à toa, com vírgula', () => {
    expect(quantidadeFalada(40)).toBe('40');
    expect(quantidadeFalada(2.5)).toBe('2,5');
    expect(quantidadeFalada(0.7500001)).toBe('0,75');
  });
});
