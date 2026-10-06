/**
 * CTO-D739 — a Rev. 01 do PS.02 pela mão do Pedro: o rascunho que o script
 * gera, a comparação por âncora que marca o que mudou, e as frases da porta.
 * Nada aqui fala com o banco.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { procedimentoDoBanco } from '../../src/domain/procedimentoDoBanco';
import { semEmoji, textoSimples, type Procedimento } from '../../src/domain/procedimento';
import {
  fraseDaRecusaDoProcedimento,
  motivosPorAncora,
  oQueMudou,
  revisaoSeguinte,
  type MudancasDoRascunho,
} from '../../src/domain/revisaoDoProcedimento';
import { letrasQueOPdfNaoImprime } from '../../src/domain/letrasDoPdf';
import { ancorasDoDocumento, foraDaForma } from './formaDoProcedimento';

const ler = (caminho: string): unknown => JSON.parse(readFileSync(join(__dirname, caminho), 'utf-8'));
const rev00 = () => ler('../fixtures/ps02Rev00DoBanco.json') as Record<string, unknown>;
const rascunho = () => ler('../../src/features/procedimento/rev01/documento.json') as Record<string, unknown>;
const mudancas = () => ler('../../src/features/procedimento/rev01/mudancas.json') as MudancasDoRascunho;

/** O documento solto, para sabotar: só o que as sabotagens mexem. */
interface BlocoSolto { tipo: string; ancora: string; tom?: string; linhas?: { celulas: unknown[] }[]; itens?: unknown[] }
interface DocSolto {
  secoes: ({ ancora: string; blocos: BlocoSolto[] } & Record<string, unknown>)[];
  fluxo: { cartoes: { destino: string }[] };
  como_usar: unknown;
}

const comoProcedimento = (documento: unknown, revisao: string): Procedimento =>
  procedimentoDoBanco({ codigo: 'PS.02', titulo: 'PS.02', revisao, emitida_em: '2026-10-06', documento }, [])!;

describe('o rascunho da Rev. 01 na forma do Banco (D739 §4: passa no verificador)', () => {
  it('a Rev. 00 do Banco passa: o verificador aceita o que a peça do Banco aceita', () => {
    expect(foraDaForma(rev00())).toBeNull();
  });

  it('o rascunho passa: 61 âncoras, as 11 do documento lá, nenhuma repetida', () => {
    const doc = rascunho();
    expect(foraDaForma(doc)).toBeNull();
    expect(ancorasDoDocumento(doc)).toHaveLength(61);
  });

  it('o verificador reprova: âncora do documento sumida, tom errado, célula a mais, âncora repetida, destino falso', () => {
    const sabota = (f: (d: DocSolto) => void) => {
      const d = rascunho() as unknown as DocSolto;
      f(d);
      return foraDaForma(d);
    };
    expect(sabota((d) => (d.secoes[1]!.ancora = 'qualif'))).toMatch(/faltam: qualificacao/);
    expect(sabota((d) => (d.secoes[1]!.blocos.find((b) => b.tipo === 'aviso')!.tom = 'perigo'))).not.toBeNull();
    expect(sabota((d) => d.secoes[1]!.blocos.find((b) => b.tipo === 'tabela')!.linhas![0]!.celulas.push([]))).not.toBeNull();
    expect(sabota((d) => (d.secoes[0]!.blocos[0]!.ancora = d.secoes[0]!.blocos[1]!.ancora))).toMatch(/repetida/);
    expect(sabota((d) => (d.fluxo.cartoes[0]!.destino = 'nada'))).toMatch(/nada/);
    expect(sabota((d) => (d.como_usar = [{ texto: '  ', negrito: false }]))).toBe('como_usar');
    expect(sabota((d) => (d.secoes[0]!['extra'] = 1))).not.toBeNull();
  });

  it('parte da Rev. 00 e grava a Rev. 01, com a descrição do histórico dentro do limite', () => {
    const m = mudancas();
    expect(m.revisao_de).toBe('00');
    expect(revisaoSeguinte(m.revisao_de)).toBe('01');
    expect(m.descricao.length).toBeGreaterThan(0);
    expect(m.descricao.length).toBeLessThanOrEqual(500);
    expect(letrasQueOPdfNaoImprime(m.descricao)).toEqual([]);
  });

  it('o PDF imprime cada letra do rascunho (fora o emoji dos cartões, que a tela e o PDF tiram)', () => {
    const p = comoProcedimento(rascunho(), '01');
    const textos = [
      p.situacao, textoSimples(p.comoUsar), ...p.fluxo.cartoes.flatMap((c) => [semEmoji(c.titulo), c.texto]),
      ...p.fluxo.sequencia.flatMap((s) => [s.titulo, s.texto]),
      ...p.secoes.flatMap((s) => [s.titulo, s.ajuda, ...s.blocos.flatMap((b) =>
        b.tipo === 'paragrafo' ? [textoSimples(b.texto)]
          : b.tipo === 'quadros' ? b.quadros.flatMap((q) => [q.titulo, q.texto])
            : b.tipo === 'lista' ? b.itens.map((i) => i.texto)
              : b.tipo === 'tabela' ? b.linhas.flatMap((l) => l.celulas.map(textoSimples)) : [])]),
    ];
    expect(textos.flatMap(letrasQueOPdfNaoImprime)).toEqual([]);
  });
});

describe('a frase da nota (D739 §2): na entrega da OC, o número é exigido; a foto só ajuda a ler', () => {
  const quadro = (ancora: string) =>
    comoProcedimento(rascunho(), '01').secoes.flatMap((s) => s.blocos).flatMap((b) => (b.tipo === 'quadros' ? b.quadros : []))
      .find((q) => q.ancora === ancora)!.texto;

  it('o quadro do mestre e o dos materiais registram o número da nota, e o app pode ler o número na foto', () => {
    for (const a of ['objetivo.q1.i4', 'avaliacao.q1.i1']) {
      expect(quadro(a)).toMatch(/número da nota/);
      expect(quadro(a)).toMatch(/o app pode ler (o número )?na foto da nota/);
      expect(quadro(a)).not.toMatch(/foto ou o número/);
    }
  });
});

describe('o que mudou, por âncora (D739 §4.1)', () => {
  const vigente = () => comoProcedimento(rev00(), '00');
  const proposto = () => comoProcedimento(rascunho(), '01');

  it('a comparação marca exatamente os lugares que o script diz que mudou, e nada sai', () => {
    const { mudaram, sairam } = oQueMudou(vigente(), proposto());
    expect(new Set(mudaram)).toEqual(new Set(mudancas().mudancas.map((m) => m.ancora)));
    expect(new Set(mudaram).size).toBe(mudaram.length);
    expect(sairam).toEqual([]);
  });

  it('na ordem da página: o cabeçalho, o "Como usar", o fluxo, e as seções de cima para baixo', () => {
    const { mudaram } = oQueMudou(vigente(), proposto());
    expect(mudaram.slice(0, 3)).toEqual(['cabecalho.revisao', 'como_usar', 'fluxo.c1']);
    expect(mudaram.indexOf('objetivo.q1.i1')).toBeLessThan(mudaram.indexOf('qualificacao.p1'));
    expect(mudaram.at(-1)).toBe('revisoes.a1');
  });

  it('o novo entra marcado: o quadro do mestre e o parágrafo da trava', () => {
    const { mudaram } = oQueMudou(vigente(), proposto());
    expect(mudaram).toContain('objetivo.q1.i4');
    expect(mudaram).toContain('qualificacao.p3');
  });

  it('a vigente contra ela mesma: nada mudou', () => {
    expect(oQueMudou(vigente(), vigente())).toEqual({ mudaram: [], sairam: [] });
  });

  it('o que sai aparece: um quadro que o rascunho tira', () => {
    const d = rascunho() as unknown as DocSolto;
    d.secoes[0]!.blocos.find((b) => b.tipo === 'quadros')!.itens!.pop();
    expect(oQueMudou(vigente(), comoProcedimento(d, '01')).sairam).toEqual([]);
    d.secoes[0]!.blocos.find((b) => b.tipo === 'quadros')!.itens!.pop();
    expect(oQueMudou(vigente(), comoProcedimento(d, '01')).sairam).toEqual(['objetivo.q1.i3']);
  });

  it('dois motivos no mesmo lugar ficam os dois (a linha da OC no item 3; o quadro da FO no item 6)', () => {
    const motivos = motivosPorAncora(mudancas().mudancas);
    expect(motivos.get('contratacao.t1.l1')).toHaveLength(2);
    expect(motivos.get('registros.q1.i1')).toHaveLength(2);
  });
});

describe('a recusa da porta, em frase', () => {
  it('quem não é o Pedro, o rascunho velho e a forma', () => {
    expect(fraseDaRecusaDoProcedimento('42501', '')).toMatch(/Só o Pedro revisa o procedimento/);
    expect(fraseDaRecusaDoProcedimento('40001', '')).toMatch(/alguém gravou antes/);
    expect(fraseDaRecusaDoProcedimento('22023', 'ancora repetida: x')).toBe('O banco recusou a revisão: ancora repetida: x');
    expect(fraseDaRecusaDoProcedimento(undefined, 'sem rede')).toBe('Falha ao gravar a revisão: sem rede');
  });
});
