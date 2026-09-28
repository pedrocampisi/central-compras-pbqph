/**
 * Perícia do Codex, 27/09/2026, achados 3 e 7 (CTO-D607): "enquanto o
 * histórico couber no rodapé, o PDF fica igual ao de hoje" — e a fonte dos
 * sinais (≥, ≤…) só entra quando o texto tem sinal.
 *
 * A fotografia: o sha256 do que se desenha em cada página, tirado do gerador
 * de ANTES dos consertos (o do `5f287cd`), nos casos abaixo. O gerador de hoje
 * tem de desenhar exatamente o mesmo. Nenhum destes casos tem sinal, e todos
 * cabem no rodapé.
 */
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type jsPDF from 'jspdf';
import { desenhaPdfDaEcr } from '../../src/services/pdf/generateEcrPdf';
import { secoesDoBanco } from '../../src/domain/ecr';
import { normalizeEcr } from '../../src/domain/normalize';
import type { Ecr, EcrRevisao } from '../../src/domain/types';
import ecrs from '../fixtures/ecrs-03-e-08.json';

const revisao = (n: number, descricao: string): EcrRevisao => ({
  revisao: String(n).padStart(2, '0'),
  data: '2026-04-15',
  descricao,
  revisado_por: 'Revisor de teste',
  aprovado_por: 'Aprovador de teste',
});
const UMA = [revisao(0, 'Emissão Inicial')];

function ecr(i: 0 | 1, extra: Partial<Ecr> = {}): Ecr {
  const e = ecrs[i]!;
  return {
    ...normalizeEcr({ id: i === 0 ? 3 : 8, codigo: e.codigo, nome: i === 0 ? 'Concreto Usinado' : 'Revestimento de Parede e Piso' }),
    revisao: e.revisao,
    emitida_em: e.emitida_em,
    secoes: secoesDoBanco(e.secoes),
    revisoes: UMA,
    ...extra,
  };
}

/** Uma descrição de 500 caracteres (o limite), em palavras. */
const QUINHENTOS = Array.from({ length: 100 }, (_, i) => `p${String(i).padStart(3, '0')}`).join(' ').slice(0, 499) + '.';

const CASOS: [string, () => Ecr, string][] = [
  ['a ECR 03 com uma revisão', () => ecr(0), '16cad62294ff779505b6ecfa54c877dfe618133672c3ebf6afddca98ca55a53c'],
  ['a ECR 08 três vezes (três páginas)', () => {
    const s = ecr(1).secoes!;
    return ecr(1, { secoes: [...s, ...s, ...s] });
  }, 'cd205b3db20f491fc76f40c322ccb7c60ee55ec4f882c302c7c440cd07f69a67'],
  ['a ECR 03 com dez revisões de uma linha', () => ecr(0, { revisoes: Array.from({ length: 10 }, (_, n) => revisao(n, `Revisão sintética ${n}`)) }), 'e5de733f986fae8436099ca4b32316d9c2f4958c269b84c53d1291527039747b'],
  ['a ECR 03 com a descrição no tamanho máximo (500)', () => ecr(0, { revisoes: [revisao(0, QUINHENTOS)] }), '0bbf92eaa40ffe58f8aa474280acdd2aab1728b1ff4688ae54a638f0db87ff66'],
  ['a ECR 03 sem histórico lido', () => ecr(0, { revisoes: null }), 'e2f41802046b795f159cc179189aef37208862128203ebc0007b87082c64c31d'],
  ['a ECR 03 sem texto e com o histórico vazio', () => ecr(0, { secoes: null, revisoes: [] }), '1c4a1e4336ad89fbf2839187a2591373a93fe0f2ff50b15fb46b8c0eadc072cf'],
];

function fotografia(doc: jsPDF): string {
  const paginas = (doc.internal as unknown as { pages: (string[] | undefined)[] }).pages.slice(1);
  return createHash('sha256').update(JSON.stringify(paginas)).digest('hex');
}

describe('Perícia 27/09, achados 3 e 7 — o PDF de hoje fica igual ao de antes dos consertos', () => {
  it('a descrição do caso máximo tem 500 caracteres', () => {
    expect(QUINHENTOS).toHaveLength(500);
  });

  it.each(CASOS)('%s: o mesmo desenho, página por página', (_nome, montar, antes) => {
    const agora = fotografia(desenhaPdfDaEcr(montar(), null));
    expect(agora).toBe(antes);
  });
});
