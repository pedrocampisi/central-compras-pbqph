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
  obrasDoMestre,
  oQueFazerComARecusa,
  oQueFazerComOStatus,
  LIGACAO_VAZIA,
  naoConformesDaLigacao,
  ocsParaLigar,
  problemaDaLigacao,
  ultimaEntregaPorOc,
  type CartaoAChegar,
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
  it('sem data, ou com data fora do formato, vazio: a tela diz "Sem dia combinado"', () => {
    expect(diaCombinado('', hoje)).toBe('');
    expect(diaCombinado('05/10', hoje)).toBe('');
  });
});

describe('a quantidade', () => {
  it('sem zeros à toa, com vírgula', () => {
    expect(quantidadeFalada(40)).toBe('40');
    expect(quantidadeFalada(2.5)).toBe('2,5');
    expect(quantidadeFalada(0.7500001)).toBe('0,75');
  });
});

describe('a régua da fila: espera ou para (carta da OC D697 §4, confirmada pelo Banco)', () => {
  it.each([
    ['', 0, 'espera'],
    ['', 503, 'espera'],
    // o servidor fora, mesmo com código do banco: conexões esgotadas, erro interno
    ['53300', 503, 'espera'],
    ['XX000', 500, 'espera'],
    ['40001', 409, 'espera'],
    ['40P01', 409, 'espera'],
    ['57014', 500, 'espera'],
    ['08006', 400, 'espera'],
    ['PGRST301', 401, 'espera'],
    ['23505', 409, 'de-novo-uma-vez'],
    ['42501', 403, 'para'],
    ['55000', 400, 'para'],
    ['22023', 400, 'para'],
    ['23514', 400, 'para'],
    ['P0001', 400, 'para'],
    ['P0002', 400, 'para'],
    ['XX000', 400, 'para'],
  ])('código %s, HTTP %s → %s', (codigo, status, esperado) => {
    expect(oQueFazerComARecusa(codigo, status)).toBe(esperado);
  });

  it('a função de borda: rede, servidor, crachá vencido e "espere" esperam; o resto para', () => {
    expect([0, 401, 408, 429, 500, 502, 503].map(oQueFazerComOStatus)).toEqual(Array(7).fill('espera'));
    expect([400, 403, 404, 409, 413].map(oQueFazerComOStatus)).toEqual(Array(5).fill('para'));
  });
});

describe('as obras do mestre', () => {
  const cartao = (intervencaoId: string, obra: string) => ({ intervencaoId, obra }) as CartaoAChegar;

  it('o nome vem do banco, na ordem dele; a obra sem pedido a caminho também tem nome (Banco-D710)', () => {
    const doBanco = [{ id: 'obra-2', nome: 'Obra A' }, { id: 'obra-1', nome: 'Obra B' }];
    expect(obrasDoMestre(doBanco, [cartao('obra-1', 'Obra B'), cartao('obra-1', 'Obra B')])).toEqual([
      { id: 'obra-2', nome: 'Obra A' },
      { id: 'obra-1', nome: 'Obra B' },
    ]);
  });

  it('sem nome do banco, vale o do pedido; obra de pedido que o banco não mandou entra no fim, uma vez só', () => {
    expect(obrasDoMestre([{ id: 'obra-1', nome: '' }], [cartao('obra-1', 'Obra Um'), cartao('obra-3', 'Obra Três')]))
      .toEqual([{ id: 'obra-1', nome: 'Obra Um' }, { id: 'obra-3', nome: 'Obra Três' }]);
  });

  it('nenhuma obra: lista vazia', () => {
    expect(obrasDoMestre([], [])).toEqual([]);
  });
});

describe('o escritório liga o sem pedido a uma OC (CTO-D696 §5.2)', () => {
  const pronta = { ...LIGACAO_VAZIA, ocId: 'oc-1', prazoConforme: true, ocEcrConforme: true, chegouTudo: true };
  const comNota = { notaFiscal: '789', chegouComEstrago: false };

  it('o estrago que o mestre viu conta como "Não Conforme"; "só uma parte" não conta', () => {
    expect(naoConformesDaLigacao(pronta, false)).toBe(0);
    expect(naoConformesDaLigacao({ ...pronta, chegouTudo: false }, false)).toBe(0);
    expect(naoConformesDaLigacao(pronta, true)).toBe(1);
    expect(naoConformesDaLigacao({ ...pronta, prazoConforme: false, ocEcrConforme: false }, true)).toBe(3);
  });

  it('o que falta, na ordem da tela', () => {
    expect(problemaDaLigacao(LIGACAO_VAZIA, comNota)).toBe('Escolha a OC.');
    expect(problemaDaLigacao({ ...pronta, prazoConforme: null }, comNota)).toBe('Responda: Prazo de entrega.');
    expect(problemaDaLigacao({ ...pronta, ocEcrConforme: null }, comNota)).toBe('Responda: Confere com a OC e com a ECR.');
    expect(problemaDaLigacao({ ...pronta, chegouTudo: null }, comNota)).toBe('Responda: Chegou tudo?');
    expect(problemaDaLigacao(pronta, comNota)).toBe('');
  });

  it('o mestre mandou só a foto: o número da nota é do escritório; em branco não serve', () => {
    const soFoto = { notaFiscal: '', chegouComEstrago: false };
    const falta = 'Escreva o número da nota: o mestre mandou só a foto.';
    expect(problemaDaLigacao(pronta, soFoto)).toBe(falta);
    expect(problemaDaLigacao({ ...pronta, notaFiscal: '  ' }, soFoto)).toBe(falta);
    expect(problemaDaLigacao({ ...pronta, notaFiscal: '4321' }, soFoto)).toBe('');
  });

  it('dois "Não Conforme" (contando o estrago) pedem a tratativa; um só, não', () => {
    const comEstrago = { notaFiscal: '1', chegouComEstrago: true };
    expect(problemaDaLigacao(pronta, comEstrago)).toBe('');
    expect(problemaDaLigacao({ ...pronta, prazoConforme: false }, comEstrago)).toMatch(/escreva a tratativa/);
    expect(problemaDaLigacao({ ...pronta, prazoConforme: false, tratativa: ' ' }, comEstrago)).toMatch(/tratativa/);
    expect(problemaDaLigacao({ ...pronta, prazoConforme: false, tratativa: 'devolvido' }, comEstrago)).toBe('');
  });

  it('as OCs para ligar: a mesma obra, emitida ou entregue; a informada primeiro, depois as mais novas', () => {
    const oc = (id: string, numero: string, status: string, obra_id = 'obra-1') => ({ id, numero, status, obra_id });
    const ocs = [
      oc('a', '2026/001', 'emitida'), oc('b', '2026/003', 'entregue'), oc('c', '2026/002', 'emitida'),
      oc('d', '2026/009', 'rascunho'), oc('e', '2026/008', 'cancelada'), oc('f', '2026/007', 'emitida', 'obra-2'),
    ];
    expect(ocsParaLigar(ocs, 'obra-1').map((o) => o.id)).toEqual(['b', 'c', 'a']);
    expect(ocsParaLigar(ocs, 'obra-1', 'a').map((o) => o.id)).toEqual(['a', 'b', 'c']);
    expect(ocsParaLigar(ocs, 'obra-1', 'e').map((o) => o.id)).toEqual(['b', 'c', 'a']);
    expect(ocsParaLigar(ocs, 'obra-3')).toEqual([]);
  });

  it('a última entrega de cada OC: o dia mais novo; no mesmo dia, a que entrou depois', () => {
    const m = ultimaEntregaPorOc([
      { id: 1, ocId: 'x', recebidoEm: '2026-10-02' },
      { id: 4, ocId: 'x', recebidoEm: '2026-10-01' },
      { id: 2, ocId: 'y', recebidoEm: '2026-10-03' },
      { id: 3, ocId: 'y', recebidoEm: '2026-10-03' },
    ]);
    expect(m.get('x')!.id).toBe(1);
    expect(m.get('y')!.id).toBe(3);
    expect(m.size).toBe(2);
  });
});
