/**
 * CTO-D730 — o procedimento de compras como lógica pura: as âncoras paradas,
 * o título do cartão sem emoji, o nome do PDF, o caminho das telas para o item
 * e a leitura do que vem do banco (que não reescreve nada).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ITEM_DA_QUALIFICACAO,
  ITEM_DOS_LABORATORIOS,
  ancorasDe,
  caminhoParaOItem,
  linhaDaRevisao,
  nomeDoPdfDoProcedimento,
  revisaoDoProcedimento,
  secaoDaAncora,
  semEmoji,
  textoSimples,
} from '../../src/domain/procedimento';
import { procedimentoDoBanco, revisoesDoProcedimentoDoBanco } from '../../src/domain/procedimentoDoBanco';
import { itemDoPs02 } from '../../src/domain/ajudaDosCriterios';
import { ps02Rev00 } from '../fixtures/ps02Rev00';

/**
 * O procedimento como a linha do banco o traz (o contrato do Banco, D733): o
 * `documento` é o jsonb da carga da Rev. 00, tirado da migration do ramo
 * `6e8a0a8` do Banco, sem mudar uma letra. Os nomes do histórico são os
 * inventados do dado de teste.
 */
function comoNoBanco() {
  const { codigo, titulo, revisao, data, revisoes } = ps02Rev00();
  const documento: unknown = JSON.parse(readFileSync(join(__dirname, '../fixtures/ps02Rev00DoBanco.json'), 'utf-8'));
  return {
    linha: { codigo, titulo, revisao, emitida_em: data, documento },
    revisoes: (revisoes ?? []).map((r, i) => ({
      id: i + 1,
      revisao: r.revisao,
      emitida_em: r.data,
      descricao: r.descricao,
      revisado_por_nome: r.revisado_por,
      aprovado_por_nome: r.aprovado_por,
    })),
  };
}

/** As 11 âncoras que o próprio documento tem: as 7 seções e as 4 linhas de tabela. */
const ancorasDoDocumento = [
  ...['objetivo', 'qualificacao', 'contratacao', 'avaliacao', 'laboratorios', 'registros', 'revisoes'],
  ...['materiais', 'servicos', 'locacao', 'projetos'],
];

describe('as âncoras do documento ficam paradas', () => {
  const p = ps02Rev00();
  const ancoras = ancorasDe(p);

  it('as 7 seções e as 4 linhas de tabela têm a âncora do próprio documento', () => {
    for (const a of ['objetivo', 'qualificacao', 'contratacao', 'avaliacao', 'laboratorios', 'registros', 'revisoes']) {
      expect(ancoras).toContain(a);
    }
    for (const a of ['materiais', 'servicos', 'locacao', 'projetos']) expect(ancoras).toContain(a);
  });

  it('nenhuma âncora se repete', () => {
    expect(new Set(ancoras).size).toBe(ancoras.length);
  });

  it('os 5 cartões do fluxo levam a lugares que existem', () => {
    for (const c of p.fluxo.cartoes) expect(ancoras).toContain(c.destino);
  });

  it('a linha de tabela é da seção dela: "projetos" é do item 3, "materiais" do item 2', () => {
    expect(secaoDaAncora(p, 'projetos')?.numero).toBe(3);
    expect(secaoDaAncora(p, 'materiais')?.numero).toBe(2);
    expect(secaoDaAncora(p, 'laboratorios-2-6')?.numero).toBe(5);
    expect(secaoDaAncora(p, 'nao-existe')).toBeNull();
  });
});

describe('o que a tela e o PDF escrevem', () => {
  it('o cartão sem o emoji, e o texto inteiro', () => {
    const titulos = ps02Rev00().fluxo.cartoes.map((c) => semEmoji(c.titulo));
    expect(titulos).toEqual([
      'Material controlado',
      'Serviço de obra',
      'Laboratório',
      'Projeto / engenharia',
      'Locação de equipamento',
    ]);
    expect(semEmoji('Sem emoji nenhum')).toBe('Sem emoji nenhum');
  });

  it('o nome do PDF e a revisão', () => {
    const p = ps02Rev00();
    expect(nomeDoPdfDoProcedimento(p)).toBe('PS.02 - Aquisição & Qualificação de Fornecedores - Rev 00.pdf');
    expect(revisaoDoProcedimento(p)).toBe('Rev. 00 · 31/08/2026');
    expect(linhaDaRevisao(p.revisoes![0]!)).toEqual(['00', '31/08/2026', 'Emissão inicial.', 'Revisor de teste', 'Aprovador de teste']);
    expect(linhaDaRevisao({ ...p.revisoes![0]!, data: null })[1]).toBe('—');
  });

  it('o "item 6" da tabela do item 2 fica como o documento diz (consertar é a Rev. 01)', () => {
    const tabela = ps02Rev00().secoes[1]!.blocos.find((b) => b.tipo === 'tabela');
    const celulas = tabela?.tipo === 'tabela' ? tabela.linhas.flatMap((l) => l.celulas.map(textoSimples)) : [];
    expect(celulas).toContain('Aplicar os critérios específicos do item 6 deste procedimento.');
  });
});

describe('o caminho das telas para o item (D730 §3.3)', () => {
  it('"ver no PS.02, item N", e o item de cada categoria com "?"', () => {
    expect(caminhoParaOItem(2)).toBe('ver no PS.02, item 2');
    expect(itemDoPs02('material')).toEqual(ITEM_DA_QUALIFICACAO);
    expect(itemDoPs02('controle_tecnologico')).toEqual(ITEM_DOS_LABORATORIOS);
    expect(itemDoPs02('servico')).toBeNull();
  });

  it('o item 2 é a seção da qualificação, e o 5 a dos laboratórios', () => {
    const p = ps02Rev00();
    expect(p.secoes.find((s) => s.ancora === ITEM_DA_QUALIFICACAO.ancora)?.numero).toBe(ITEM_DA_QUALIFICACAO.numero);
    expect(p.secoes.find((s) => s.ancora === ITEM_DOS_LABORATORIOS.ancora)?.numero).toBe(ITEM_DOS_LABORATORIOS.numero);
  });
});

/** O procedimento sem as âncoras que não são do documento (as do Banco são pela posição; as do dado de teste, outras). */
function semAncorasDePosicao(v: unknown): unknown {
  const DO_DOCUMENTO = new Set(ancorasDoDocumento);
  if (Array.isArray(v)) return v.map(semAncorasDePosicao);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k, x]) => k !== 'ancora' || DO_DOCUMENTO.has(x as string))
        .map(([k, x]) => [k, k === 'sumario' ? x : semAncorasDePosicao(x)]),
    );
  }
  return v;
}

describe('a leitura do banco (o contrato da D733)', () => {
  it('a carga do Banco dá o mesmo procedimento do dado de teste, palavra por palavra', () => {
    const { linha, revisoes } = comoNoBanco();
    const p = procedimentoDoBanco(linha, revisoes)!;
    expect(semAncorasDePosicao(p)).toEqual(semAncorasDePosicao(ps02Rev00()));
  });

  it('as âncoras do documento estão lá, e nenhuma se repete', () => {
    const { linha, revisoes } = comoNoBanco();
    const todas = ancorasDe(procedimentoDoBanco(linha, revisoes)!);
    for (const a of ancorasDoDocumento) expect(todas).toContain(a);
    expect(new Set(todas).size).toBe(todas.length);
  });

  it('Código, Revisão e Data vêm das colunas, não do documento', () => {
    const { linha, revisoes } = comoNoBanco();
    const p = procedimentoDoBanco({ ...linha, codigo: 'PS.99', revisao: '07', emitida_em: '2027-01-02' }, revisoes)!;
    expect([p.codigo, p.revisao, p.data]).toEqual(['PS.99', '07', '2027-01-02']);
    expect(p.situacao).toBe('Emissão inicial formal');
  });

  it('o aviso guarda o tom: "warn" é a faixa de aviso, "info" a de informação', () => {
    const { linha, revisoes } = comoNoBanco();
    const blocos = procedimentoDoBanco(linha, revisoes)!.secoes.flatMap((s) => s.blocos);
    const destaque = (ancora: string) => {
      const b = blocos.find((x) => x.ancora === ancora);
      return b?.tipo === 'paragrafo' ? b.destaque : undefined;
    };
    expect(destaque('qualificacao.a1')).toBe('aviso');
    expect(destaque('laboratorios.a1')).toBe('aviso');
    expect(destaque('avaliacao.a1')).toBe('informacao');
    expect(destaque('revisoes.a1')).toBe('informacao');
    expect(destaque('qualificacao.p2')).toBe('miudo');
    expect(destaque('objetivo.p1')).toBeNull();
  });

  it('o endereço da planilha não vira link: o quadro fica como texto', () => {
    const { linha, revisoes } = comoNoBanco();
    const registros = procedimentoDoBanco(linha, revisoes)!.secoes.find((s) => s.ancora === 'registros')!;
    expect(registros.blocos[0]).toEqual({
      tipo: 'quadros',
      ancora: 'registros.q1',
      quadros: expect.arrayContaining([{ ancora: 'registros.q1.i1', titulo: 'FO 8.4.1.1', texto: 'Qualificação de fornecedores' }]),
    });
  });

  it('sem documento na linha, não há procedimento', () => {
    expect(procedimentoDoBanco({ codigo: 'PS.02' }, [])).toBeNull();
    expect(procedimentoDoBanco(null, null)).toBeNull();
  });

  it('o histórico não lido é null; a ordem é a data e, no empate, a chave', () => {
    expect(revisoesDoProcedimentoDoBanco(undefined)).toBeNull();
    const r = revisoesDoProcedimentoDoBanco([
      { id: 3, revisao: '01', emitida_em: '2026-10-20' },
      { id: 2, revisao: '00b', emitida_em: '2026-08-31' },
      { id: 1, revisao: '00', emitida_em: '2026-08-31' },
    ]);
    expect(r!.map((x) => x.revisao)).toEqual(['00', '00b', '01']);
  });

  it('um bloco de tipo desconhecido não some: vira parágrafo com o texto dele', () => {
    const { linha, revisoes } = comoNoBanco();
    const doc = linha.documento as { secoes: { blocos: unknown[] }[] };
    doc.secoes[0]!.blocos.push({ tipo: 'novo', ancora: 'x', texto: 'Texto de um bloco novo.' });
    const p = procedimentoDoBanco(linha, revisoes)!;
    const ultimo = p.secoes[0]!.blocos.at(-1)!;
    expect(ultimo.tipo).toBe('paragrafo');
    expect(ultimo.tipo === 'paragrafo' && textoSimples(ultimo.texto)).toBe('Texto de um bloco novo.');
  });
});
