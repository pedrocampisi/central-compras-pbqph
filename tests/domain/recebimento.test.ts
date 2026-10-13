import { describe, expect, it } from 'vitest';
import {
  PERGUNTAS_DO_MESTRE,
  SEM_RESPOSTA,
  avaliacaoDoMestre,
  contaPorItem,
  diaCombinado,
  empresaAchada,
  itensDoEnvio,
  problemaDaContagem,
  quantidadeEscrita,
  naosDoMestre,
  numeroDaNotaEmDigitos,
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
      'Veio o material certo?',
      'Veio a quantidade toda?',
    ]);
    expect(PERGUNTAS_DO_MESTRE[3].nao).toBe('Só uma parte');
  });

  it('as duas que o Pedro leu como a mesma dizem a diferença: o material certo, a quantidade toda (D792 §3)', () => {
    const [, , material, quantidade] = PERGUNTAS_DO_MESTRE;
    expect(material.texto).toMatch(/material certo/);
    expect(quantidade.texto).toMatch(/quantidade toda/);
    expect(material.dica).toMatch(/tipo.*marca.*medida/);
    expect(quantidade.dica).toMatch(/faltou/);
    // nenhuma das duas fala do que a outra fala
    expect(material.texto + material.dica).not.toMatch(/quantidade|tudo|faltou/);
    expect(quantidade.texto + quantidade.dica).not.toMatch(/material|marca|medida/);
  });

  it('o número da nota: só os dígitos, com os zeros da frente', () => {
    expect(numeroDaNotaEmDigitos('NF 000.123-4')).toBe('0001234');
    expect(numeroDaNotaEmDigitos('  ')).toBe('');
    expect(oQueFalta(tudoSim, 'NF', '')).toBe('Tire a foto da nota, ou escreva o número dela.');
    expect(avaliacaoDoMestre(tudoSim, 'nº 4.567', '', '2026-10-13').notaFiscal).toBe('4567');
  });

  it('a busca da lista: o começo de qualquer palavra, sem acento e sem maiúscula (D793 §2.3, D795 §2)', () => {
    expect(empresaAchada('Cerâmica Beta', 'cera')).toBe(true);
    expect(empresaAchada('Cerâmica Beta', 'BETA')).toBe(true);
    expect(empresaAchada('Elétrica Ômega', 'ome')).toBe(true);
    expect(empresaAchada('Cerâmica Beta', 'ceramica b')).toBe(true);
    expect(empresaAchada('Ferragens-Sigma', 'sig')).toBe(true);
    // pelo meio da palavra, não
    expect(empresaAchada('Cerâmica Beta', 'eta')).toBe(false);
    expect(empresaAchada('Cerâmica Beta', 'amica')).toBe(false);
    expect(empresaAchada('Cerâmica Beta', '  ')).toBe(true);
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
    expect(oQueFalta({ ...tudoSim, tudo: null }, '1', '')).toBe('Falta responder: Veio a quantidade toda?');
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

describe('a quantidade por item do "Só uma parte" (CTO-D794)', () => {
  const PEDIDO: CartaoAChegar = {
    ocId: 'oc-1', intervencaoId: 'obra-1', obra: 'Obra de Teste', numero: '2026/101', fornecedor: 'Teste',
    combinadoPara: '', total: 100,
    itens: [
      { posicao: 1, descricao: 'Cimento de teste', quantidade: 40, unidade: 'sc' },
      { posicao: 2, descricao: 'Areia de teste', quantidade: 2.5, unidade: 'm³' },
    ],
  };
  const ANTIGO: CartaoAChegar = { ...PEDIDO, itens: PEDIDO.itens.map((i) => ({ descricao: i.descricao, quantidade: i.quantidade, unidade: i.unidade })) };

  it('o número que ele escreve: inteiro, com vírgula, com ponto de milhar; o resto não é número', () => {
    expect(quantidadeEscrita('6')).toBe(6);
    expect(quantidadeEscrita(' 0 ')).toBe(0);
    expect(quantidadeEscrita('2,5')).toBe(2.5);
    expect(quantidadeEscrita('2.5')).toBe(2.5);
    expect(quantidadeEscrita('1.000')).toBe(1000);
    expect(quantidadeEscrita('1.000,5')).toBe(1000.5);
    for (const x of ['', '  ', '-1', 'seis', '2,5,1', '1,']) expect(quantidadeEscrita(x), x).toBeNull();
  });

  it('"Sim": vai a quantidade pedida de cada item', () => {
    expect(itensDoEnvio(PEDIDO, true, { 1: '3' })).toEqual([{ posicao: 1, quantidade: 40 }, { posicao: 2, quantidade: 2.5 }]);
  });

  it('"Só uma parte": vai o que ficou em cada campo, e o que ele não mexeu vai como pedido', () => {
    expect(itensDoEnvio(PEDIDO, false, { 1: '30' })).toEqual([{ posicao: 1, quantidade: 30 }, { posicao: 2, quantidade: 2.5 }]);
    expect(itensDoEnvio(PEDIDO, false, { 2: '0' })).toEqual([{ posicao: 1, quantidade: 40 }, { posicao: 2, quantidade: 0 }]);
  });

  it('o cartão antigo, sem posição, não conta por item: nenhum item vai, e a entrega grava como antes', () => {
    expect(contaPorItem(ANTIGO)).toBe(false);
    expect(itensDoEnvio(ANTIGO, true, {})).toEqual([]);
    expect(itensDoEnvio(ANTIGO, false, { 1: '3' })).toEqual([]);
    expect(problemaDaContagem(ANTIGO, {})).toBe('');
    expect(itensDoEnvio(PEDIDO, null, {})).toEqual([]);
  });

  it('o que falta na contagem: o campo sem número, e o "Só uma parte" sem nada a menos', () => {
    expect(problemaDaContagem(PEDIDO, { 2: '' })).toBe('Escreva quanto veio de Areia de teste. Se não veio, escreva 0.');
    expect(problemaDaContagem(PEDIDO, {})).toBe('Você disse "Só uma parte": mude a quantidade do que veio a menos.');
    expect(problemaDaContagem(PEDIDO, { 1: '50', 2: '3' })).toBe('Você disse "Só uma parte": mude a quantidade do que veio a menos.');
    expect(problemaDaContagem(PEDIDO, { 1: '39' })).toBe('');
  });

  it('o "Pronto" pede a contagem logo depois das perguntas, e só com "Só uma parte"', () => {
    const parte = { ...tudoSim, tudo: false };
    expect(oQueFalta(parte, '', '', 'falta a contagem')).toBe('falta a contagem');
    expect(oQueFalta(tudoSim, '1', '', 'falta a contagem')).toBe('');
    expect(oQueFalta({ ...parte, noDia: null }, '1', '', 'falta a contagem')).toBe('Falta responder: Chegou no dia combinado?');
  });
});
