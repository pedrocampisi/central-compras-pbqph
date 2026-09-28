/**
 * D589 §4.1 — o PDF de cada ECR, parecido com o documento: o cabeçalho e a
 * tabela de revisões em toda página, as cinco seções "01.", o quadradinho na
 * lista e a nota fora dela. O teste lê o texto de dentro do PDF, página por
 * página, sem baixar nada. Os textos são os das ECRs 03 e 08.
 */
import { describe, expect, it } from 'vitest';
import type jsPDF from 'jspdf';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { desenhaPdfDaEcr, paraAFonteDoPdf } from '../../src/services/pdf/generateEcrPdf';
import { problemasDaRevisao, secoesDoBanco } from '../../src/domain/ecr';
import { normalizeEcr } from '../../src/domain/normalize';
import type { Ecr, EcrRevisao } from '../../src/domain/types';
import ecrs from '../fixtures/ecrs-03-e-08.json';

const HISTORICO: EcrRevisao[] = [
  { revisao: '00', data: '2026-04-15', descricao: 'Emissão Inicial', revisado_por: 'Revisor de teste', aprovado_por: 'Aprovador de teste' },
];

function ecr(i: 0 | 1, extra: Partial<Ecr> = {}): Ecr {
  const e = ecrs[i]!;
  return {
    ...normalizeEcr({ id: i === 0 ? 3 : 8, codigo: e.codigo, nome: i === 0 ? 'Concreto Usinado' : 'Revestimento de Parede e Piso' }),
    revisao: e.revisao,
    emitida_em: e.emitida_em,
    secoes: secoesDoBanco(e.secoes),
    revisoes: HISTORICO,
    ...extra,
  };
}

/** Os textos desenhados numa página, na ordem, juntos por espaço. */
function textoDaPagina(doc: jsPDF, pagina: number): string {
  const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[pagina]!.join('\n');
  return [...conteudo.matchAll(/\(((?:\\.|[^\\)])*)\) Tj/g)]
    .map((m) => m[1]!.replace(/\\(.)/g, '$1'))
    .join(' ');
}

/** Os retângulos cheios pequenos (o quadradinho da lista) de uma página. */
function quadradinhos(doc: jsPDF, pagina: number): number {
  const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[pagina]!.join('\n');
  return [...conteudo.matchAll(/ 3\.685\d* -3\.685\d* re\nf/g)].length;
}

describe('D589 — o PDF da ECR 03 (cabe numa página)', () => {
  const doc = desenhaPdfDaEcr(ecr(0), null);
  const p1 = textoDaPagina(doc, 1);

  it('uma página, com o cabeçalho do documento', () => {
    expect(doc.getNumberOfPages()).toBe(1);
    expect(p1).toContain('ECR \x96 ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO');
    expect(p1).toContain('CONCRETO USINADO');
    expect(p1).toContain('ECR 03');
    expect(p1).toContain('Rev.: 00');
  });

  it('as cinco seções numeradas como no documento, na ordem', () => {
    const titulos = [
      '01. REFERÊNCIA',
      '02. ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO',
      '03. REGISTRO DO FORNECEDOR',
      '04. INSPEÇÃO DO RECEBIMENTO',
      '05. MANUSEIO, ARMAZENAMENTO E IDENTIFICAÇÃO',
    ];
    const posicoes = titulos.map((t) => p1.indexOf(t));
    expect(posicoes.every((p) => p >= 0)).toBe(true);
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
  });

  it('cada linha da lista tem o quadradinho; a nota "Atenção" não tem', () => {
    // 4 + 4 + 1 + 5 + 3 linhas na lista; a nota fica fora.
    expect(quadradinhos(doc, 1)).toBe(17);
    expect(p1).toContain('Especificações: Com a chegada de cada caminhão na obra');
    expect(p1).toContain('Atenção: Qualquer divergência entre material entregue');
  });

  it('o "mᶟ" sai como "m³", que a fonte desenha', () => {
    expect(p1).toContain('Volume (m³);');
    expect(p1).not.toContain('ᶟ');
  });

  it('a tabela de revisões no pé, com as cinco colunas, e o número da página', () => {
    for (const t of ['Revisão', 'Data', 'Descrição', 'Revisado por', 'Aprovado por', '15/04/2026', 'Emissão Inicial', 'Revisor de teste', 'Aprovador de teste']) {
      expect(p1).toContain(t);
    }
    expect(p1).toContain('Página 1 de 1');
  });
});

describe('D589 — um texto que passa de uma página', () => {
  // A ECR 08 cabe numa página do PDF (no Word eram duas: a letra de lá é
  // maior). Para provar a quebra, as cinco seções dela vão três vezes.
  const secoes = ecr(1).secoes!;
  const doc = desenhaPdfDaEcr(ecr(1, { secoes: [...secoes, ...secoes, ...secoes] }), null);

  it('a ECR 08 sozinha cabe numa página', () => {
    expect(desenhaPdfDaEcr(ecr(1), null).getNumberOfPages()).toBe(1);
  });

  it('o cabeçalho e a tabela de revisões se repetem em toda página', () => {
    const n = doc.getNumberOfPages();
    expect(n).toBeGreaterThan(1);
    for (let p = 1; p <= n; p += 1) {
      const t = textoDaPagina(doc, p);
      expect(t).toContain('ECR 08');
      expect(t).toContain('REVESTIMENTO DE PAREDE E PISO');
      expect(t).toContain('Emissão Inicial');
      expect(t).toContain(`Página ${p} de ${n}`);
    }
  });

  it('nenhuma linha se perde entre as páginas: as 24 linhas estão lá, três vezes cada', () => {
    // O espaço duplo de dentro do texto fica como distância no PDF, e não
    // como letra: a comparação junta os espaços dos dois lados.
    const junta = (t: string) => t.replace(/ +/g, ' ');
    const tudo = junta(Array.from({ length: doc.getNumberOfPages() }, (_, i) => textoDaPagina(doc, i + 1)).join(' '));
    const linhas = secoes.flatMap((s) => s.itens);
    expect(linhas).toHaveLength(24);
    for (const l of linhas) {
      const palavras = junta(paraAFonteDoPdf(l.rotulo ? `${l.rotulo}: ${l.texto}` : l.texto));
      expect(tudo.split(palavras).length - 1, palavras).toBe(3);
    }
  });
});

describe('D589 — o PDF com a marca pesa pouco', () => {
  it('a ECR 03 com a marca de verdade fica abaixo de 300 KB (sem compressão, passava de 4 MB)', () => {
    const png = readFileSync(join(__dirname, '../../public/brazao1.png')).toString('base64');
    const doc = desenhaPdfDaEcr(ecr(0), `data:image/png;base64,${png}`);
    expect((doc.output('arraybuffer') as ArrayBuffer).byteLength).toBeLessThan(300 * 1024);
  });
});

describe('D589 — o PDF diz o que falta, e não quebra', () => {
  it('sem texto: a linha que diz isso', () => {
    const doc = desenhaPdfDaEcr(ecr(0, { secoes: null }), null);
    expect(textoDaPagina(doc, 1)).toContain('O texto desta ECR ainda não foi carregado.');
  });

  it('sem histórico lido: a tabela diz, com as colunas', () => {
    const t = textoDaPagina(desenhaPdfDaEcr(ecr(0, { revisoes: null }), null), 1);
    expect(t).toContain('O histórico de revisões desta ECR ainda não foi carregado.');
    expect(t).toContain('Aprovado por');
  });

  it('um caractere que a fonte não tem vira "?", e nunca some calado', () => {
    expect(paraAFonteDoPdf('a→b ᶟ – “x”')).toBe('a?b ³ – “x”');
  });
});

// Perícia do Codex, 27/09/2026, achado 3 — MEDIDA, não conserto (CTO-D603).
// O "como conferir" do perito: uma ECR sintética com "≥" e "≤" em linhas
// diferentes e uma quebra de linha dentro do texto; passa pelas regras do
// editor e vira PDF em memória. O certo: ou as regras recusam, ou o PDF mostra
// o sinal (sem aplicar `paraAFonteDoPdf` no esperado).
describe('Perícia 27/09, achado 3 — os sinais que o editor aceita e o PDF troca', () => {
  // `it.fails`: esta medida REPRODUZ o achado no código de hoje. Quando o conserto
  // entrar, ela passa a falhar — aí o `.fails` sai e a medida vira trava.
  it.fails('"≥" e "≤" e a quebra de linha: o editor recusa, ou o PDF os mantém', () => {
    const vigente = ecr(0);
    const nova = vigente.secoes!.map((s, i) =>
      i === 0
        ? {
            ...s,
            itens: [
              { rotulo: null, texto: 'Resistência ≥ 30 MPa', numerado: true },
              { rotulo: null, texto: 'Abatimento ≤ 10 cm', numerado: true },
              { rotulo: null, texto: 'Linha um\nLinha dois', numerado: true },
            ],
          }
        : s,
    );
    const problemas = problemasDaRevisao(vigente.secoes!, nova, vigente.revisao);
    const recusou = problemas.length > 0;

    const doc = desenhaPdfDaEcr({ ...vigente, secoes: nova }, null);
    const tudo = Array.from({ length: doc.getNumberOfPages() }, (_, i) => textoDaPagina(doc, i + 1)).join(' ');
    const manteve =
      !tudo.includes('Resistência ? 30 MPa') && !tudo.includes('Abatimento ? 10 cm') && !tudo.includes('um?Linha');
    const trechos = tudo.match(/Resistência . 30 MPa|Abatimento . 10 cm|um.Linha/g);
    expect(recusou || manteve, JSON.stringify({ recusou, problemas: problemas.length, trechos })).toBe(true);
  });
});

// Perícia do Codex, 27/09/2026, achado 7 — MEDIDA, não conserto (CTO-D603).
// O "como conferir" do perito: uma ECR sintética com 50 linhas curtas de
// histórico, e outra com uma descrição longa; olhar ONDE os textos caem na
// página. O certo: a tabela de revisões fica abaixo do texto do corpo, sem
// cobrir o cabeçalho nem o conteúdo (o corpo começa a 36 mm do topo).
describe('Perícia 27/09, achado 7 — o histórico que cresce no rodapé', () => {
  const MM = 72 / 25.4;
  /** Cada texto de uma página e a altura dele, em mm a partir do topo. */
  function textosComAltura(doc: jsPDF, pagina: number): { texto: string; mm: number }[] {
    const ph = doc.internal.pageSize.getHeight() * MM;
    const conteudo = (doc.internal as unknown as { pages: string[][] }).pages[pagina]!.join('\n');
    return [...conteudo.matchAll(/[\d.]+ ([\d.]+) Td\n\(((?:\\.|[^\\)])*)\) Tj/g)].map((m) => ({
      texto: m[2]!.replace(/\\(.)/g, '$1'),
      mm: Math.round(((ph - Number(m[1])) / MM) * 10) / 10,
    }));
  }
  const DA_TABELA = /^(Revisão|Data|Descrição|Revisado por|Aprovado por|Revisor de teste|Aprovador de teste|Emissão Inicial|15\/04\/2026|\d\d)$|^Revisão sintética|^Descrição longa|^palavra/;
  const DO_CABECALHO = 26; // o cabeçalho vai até ~21 mm; o corpo começa a 36
  /** Por página: onde começa a tabela, e quantos textos do corpo caem nela ou abaixo dela. */
  function medida(revisoes: EcrRevisao[]) {
    const doc = desenhaPdfDaEcr(ecr(0, { revisoes }), null);
    const paginas = Array.from({ length: doc.getNumberOfPages() }, (_, i) => {
      const t = textosComAltura(doc, i + 1);
      const topo = Math.min(...t.filter((x) => DA_TABELA.test(x.texto)).map((x) => x.mm));
      const corpo = t.filter((x) => x.mm >= DO_CABECALHO && !DA_TABELA.test(x.texto) && !/^Página /.test(x.texto));
      return { topo, corpoNaTabela: corpo.filter((x) => x.mm >= topo - 1).length, corpo: corpo.length };
    });
    const ruins = paginas.filter((p) => p.topo < 36 || p.corpoNaTabela > 0);
    return { paginas: paginas.length, topoDaTabelaNaPagina1: paginas[0]!.topo, paginasComSobreposicao: ruins.length, pagina1: paginas[0] };
  }
  const umaRevisao = (i: number, descricao = `Revisão sintética ${i}`): EcrRevisao => ({
    revisao: String(i).padStart(2, '0'), data: '2026-04-15', descricao, revisado_por: 'Revisor de teste', aprovado_por: 'Aprovador de teste',
  });

  it('a régua da medida: com a revisão de hoje, nada se sobrepõe', () => {
    const m = medida(HISTORICO);
    expect(m.paginasComSobreposicao, JSON.stringify(m)).toBe(0);
  });

  // `it.fails`: esta medida REPRODUZ o achado no código de hoje. Quando o conserto
  // entrar, ela passa a falhar — aí o `.fails` sai e a medida vira trava.
  it.fails('com 50 revisões curtas, a tabela não cobre o cabeçalho nem o corpo', () => {
    const m = medida(Array.from({ length: 50 }, (_, i) => umaRevisao(i)));
    expect(m.paginasComSobreposicao, JSON.stringify(m)).toBe(0);
  });

  // O tamanho da descrição: nem a tela nem o contrato do banco o limitam.
  const comDescricaoDe = (letras: number) => medida([umaRevisao(0, `Descrição longa ${'palavra '.repeat(letras / 8)}`.trim())]);
  it('com uma descrição de 2.000 letras, ainda cabe', () => {
    const m = comDescricaoDe(2000);
    expect(m.paginasComSobreposicao, JSON.stringify(m)).toBe(0);
  });
  // `it.fails`: esta medida REPRODUZ o achado no código de hoje. Quando o conserto
  // entrar, ela passa a falhar — aí o `.fails` sai e a medida vira trava.
  it.fails('com uma descrição de 6.000 letras, a tabela não cobre o cabeçalho nem o corpo', () => {
    const m = comDescricaoDe(6000);
    expect(m.paginasComSobreposicao, JSON.stringify(m)).toBe(0);
  });
});
