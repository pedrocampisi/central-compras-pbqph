import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'falso' } } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

import { extractItemsFromImages, organizarTexto, paraResultado } from '../../src/services/ai/extractItems';
import { lerLista, ErroDaImportacao } from '../../src/services/ai/lerPedido';
import { linhasDosItens } from '../../src/services/supabase/linhas';
import { corpoDaTabelaDeItens } from '../../src/services/pdf/tabelaDeItens';
import { ItemSchema } from '../../src/domain/schemas/data.schema';
import {
  CONSELHO_DA_IMAGEM,
  avisoDaLeitura,
  avisoDaTroca,
  destinoDaColagem,
  erroDaImagem,
  juntarTexto,
} from '../../src/domain/importacao';

const DUVIDA = 'a lista diz "vergalhão" sem a bitola';
const RESPOSTA = {
  itens: [
    { descricao: 'Cimento CP-II 50kg', quantidade: 10, unidade: 'saco', preco_unit: 0 },
    { descricao: 'Vergalhão CA-50', quantidade: 0, unidade: 'barra', confira: `  ${DUVIDA}  ` },
    { descricao: 'Areia média', quantidade: 3, unidade: 'm3', confira: '   ' },
  ],
  ignoradas: ['bom dia pessoal', '', 42, 'segue a lista'],
  _meta: { modelo: 'qualquer' },
};

function respostaFalsa(status: number, corpo: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } }));
}
afterEach(() => vi.unstubAllGlobals());

describe('D557 — a resposta do servidor vira o resultado da tela', () => {
  const r = paraResultado(RESPOSTA);

  it('os itens entram normalizados como na importação (unidade, números)', () => {
    expect(r.itens.map((i) => [i.descricao, i.quantidade, i.unidade])).toEqual([
      ['Cimento CP-II 50kg', 10, 'sc'],
      ['Vergalhão CA-50', 0, 'un'],
      ['Areia média', 3, 'm³'],
    ]);
  });

  it('o "confira" vai para um mapa pelo id, aparado; em branco não conta', () => {
    expect(r.confira).toEqual({ [r.itens[1]!.id]: DUVIDA });
  });

  it('o item NÃO leva o "confira": tem só as chaves do contrato', () => {
    const chaves = Object.keys(ItemSchema.shape).sort();
    for (const it of r.itens) {
      expect(Object.keys(it).sort()).toEqual(chaves);
      expect(JSON.stringify(it)).not.toContain('bitola');
    }
  });

  it('as ignoradas vêm como vieram, sem vazias nem o que não é texto', () => {
    expect(r.ignoradas).toEqual(['bom dia pessoal', 'segue a lista']);
  });

  it('resposta da imagem sem "ignoradas" (ou do servidor antigo) continua servindo', () => {
    expect(paraResultado({ itens: [{ descricao: 'x' }] })).toMatchObject({ confira: {}, ignoradas: [] });
    expect(paraResultado(null)).toEqual({ itens: [], confira: {}, ignoradas: [], leitor: null });
  });
});

describe('D557 — o "confira" não chega ao banco nem ao PDF', () => {
  // Mesmo que alguém pendure o confira no item, as duas saídas o deixam de fora.
  const item = { ...paraResultado(RESPOSTA).itens[1]!, confira: DUVIDA } as never;

  it('salvar_oc: as linhas dos itens têm só as colunas do contrato', () => {
    const [linha] = linhasDosItens([item]);
    expect(Object.keys(linha!).sort()).toEqual(
      ['desc_pct', 'descricao', 'ecr_id', 'ipi_pct', 'material_id', 'observacao', 'posicao', 'prazo_entrega', 'preco_unit', 'quantidade', 'unidade'],
    );
    expect(JSON.stringify(linha)).not.toContain('bitola');
  });

  it('o PDF: nenhuma célula da tabela traz a dúvida', () => {
    expect(corpoDaTabelaDeItens([item]).flat().join(' ')).not.toContain('bitola');
  });

  it('o salvar_oc e o PDF usam essas duas funções (e não o item espalhado)', () => {
    const dados = readFileSync('src/services/supabase/dados.ts', 'utf-8');
    expect(dados).toMatch(/itens: linhasDosItens\(oc\.itens \?\? \[\]\)/);
    const pdf = readFileSync('src/services/pdf/generateOcPdf.ts', 'utf-8');
    expect(pdf).toMatch(/const body = corpoDaTabelaDeItens\(oc\.itens \?\? \[\]\)/);
    for (const f of ['src/services/supabase/dados.ts', 'src/services/supabase/linhas.ts', 'src/services/pdf/generateOcPdf.ts', 'src/services/pdf/tabelaDeItens.ts']) {
      expect(readFileSync(f, 'utf-8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''), f).not.toMatch(/confira/);
    }
  });
});

describe('D557 — o contrato com o servidor', () => {
  it('manda { texto } como a pessoa colou, e devolve o resultado', async () => {
    const f = respostaFalsa(200, RESPOSTA);
    vi.stubGlobal('fetch', f);
    const r = await organizarTexto('10 sacos de cimento\nbom dia');
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/functions\/v1\/extrair-itens$/);
    // D567: o leitor vai junto; sem escolha, o rápido.
    expect(JSON.parse(String(init.body))).toEqual({ texto: '10 sacos de cimento\nbom dia', leitor: 'rapido' });
    expect(r.itens).toHaveLength(3);
  });

  it('o erro do servidor aparece como veio', async () => {
    vi.stubGlobal('fetch', respostaFalsa(400, { erro: 'A lista passa de 6000 caracteres. Mande em duas partes.' }));
    const e = await organizarTexto('x').catch((x: unknown) => x);
    // ErroDaImportacao: a página mostra a mensagem inteira, sem "Erro na importação:".
    expect(e).toBeInstanceOf(ErroDaImportacao);
    expect((e as Error).message).toBe('A lista passa de 6000 caracteres. Mande em duas partes.');
  });

  it('sem mensagem do servidor, a do status (e o 422 fala de texto)', async () => {
    vi.stubGlobal('fetch', respostaFalsa(422, {}));
    await expect(organizarTexto('x')).rejects.toThrow('A IA não encontrou itens neste texto.');
  });

  it('caixa vazia não sai do navegador', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    await expect(lerLista('   \n ')).rejects.toBeInstanceOf(ErroDaImportacao);
    await expect(organizarTexto('  ')).rejects.toThrow();
    expect(f).not.toHaveBeenCalled();
  });

  it('a imagem: as mesmas mensagens; o 400 e o 422 (D567: a resposta cortada) trazem a do servidor', async () => {
    vi.stubGlobal('fetch', respostaFalsa(422, {}));
    await expect(extractItemsFromImages(['a'])).rejects.toThrow('A IA não conseguiu ler itens neste arquivo.');
    vi.stubGlobal('fetch', respostaFalsa(422, { erro: 'A resposta da IA foi cortada antes do fim.' }));
    const cortada = await extractItemsFromImages(['a']).catch((x: unknown) => x);
    expect(cortada).toBeInstanceOf(ErroDaImportacao);
    expect((cortada as Error).message).toBe('A resposta da IA foi cortada antes do fim.');
    vi.stubGlobal('fetch', respostaFalsa(503, { erro: 'Serviço de extração não configurado.' }));
    await expect(extractItemsFromImages(['a'])).rejects.toThrow('A importação por IA ainda não foi configurada');
    vi.stubGlobal('fetch', respostaFalsa(400, { erro: 'A imagem é grande demais.' }));
    await expect(extractItemsFromImages(['a'])).rejects.toBeInstanceOf(ErroDaImportacao);
    vi.stubGlobal('fetch', respostaFalsa(200, { itens: [{ descricao: 'x' }], ignoradas: [] }));
    await expect(extractItemsFromImages(['a'])).resolves.toMatchObject({ ignoradas: [] });
  });

  it('D757: o 502 é nenhum dos dois fornecedores ter lido, e a frase não cita fornecedor', async () => {
    vi.stubGlobal('fetch', respostaFalsa(502, {}));
    const erroDaImagem = await extractItemsFromImages(['a']).catch((x: unknown) => x);
    expect((erroDaImagem as Error).message).toBe('Os serviços de IA estão fora do ar. Tente novamente em instantes.');
    vi.stubGlobal('fetch', respostaFalsa(502, {}));
    const erroDoTexto = await organizarTexto('x').catch((x: unknown) => x);
    expect((erroDoTexto as Error).message).toBe((erroDaImagem as Error).message);
    expect((erroDaImagem as Error).message).not.toMatch(/OpenRouter|Anthropic/);
  });
});

describe('D570 — o 422 da resposta cortada, com a frase REAL do servidor', () => {
  // Copiada do código da `extrair-itens` (a dos dois leitores), palavra por palavra.
  const CORTADA =
    'A resposta da IA foi cortada antes do fim, e nenhum item foi devolvido ' +
    'para não faltar item sem aviso. Divida a lista em partes menores.';

  it('na imagem: a primeira frase fica, o conselho da LISTA sai, e entra o da imagem', async () => {
    vi.stubGlobal('fetch', respostaFalsa(422, { erro: CORTADA }));
    const e = await extractItemsFromImages(['a']).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErroDaImportacao);
    const m = (e as Error).message;
    expect(m).toContain('A resposta da IA foi cortada antes do fim, e nenhum item foi devolvido');
    expect(m).not.toMatch(/lista|Divida/i);
    expect(m).toBe(`A resposta da IA foi cortada antes do fim, e nenhum item foi devolvido para não faltar item sem aviso. ${CONSELHO_DA_IMAGEM}`);
  });

  it('na caixa de texto: a frase inteira do servidor fica', async () => {
    vi.stubGlobal('fetch', respostaFalsa(422, { erro: CORTADA }));
    await expect(organizarTexto('10 sc cimento')).rejects.toThrow(CORTADA);
  });

  it('frase do servidor que não fala da lista passa como veio, na imagem', () => {
    expect(erroDaImagem('Máximo de 10 páginas por vez. Recebidas 12.')).toBe('Máximo de 10 páginas por vez. Recebidas 12.');
    expect(erroDaImagem('Resposta da IA sem JSON válido.')).toBe('Resposta da IA sem JSON válido.');
  });

  it('o aviso da troca diz que o certeiro TROCOU, não que importou de novo', () => {
    expect(avisoDaTroca(8, 0)).toBe('O certeiro trocou os 8 itens.');
    expect(avisoDaTroca(1, 0)).toBe('O certeiro trocou o item.');
    expect(avisoDaTroca(3, 2)).toBe('O certeiro trocou os 3 itens · 2 linhas ignoradas.');
  });
});

describe('D557 — o Ctrl+V decide pelo que veio', () => {
  const print = [{ name: 'image.png' }];

  it('imagem sem texto (o print): importa', () => {
    expect(destinoDaColagem(print, '')).toBe('arquivos');
    expect(destinoDaColagem(print, '   ')).toBe('arquivos');
  });

  it('texto sem imagem: vai para a caixa', () => {
    expect(destinoDaColagem([], '10 sacos de cimento')).toBe('texto');
  });

  it('nada: nada', () => {
    expect(destinoDaColagem([], ' \n ')).toBe('nada');
  });

  it('texto E imagem (Ctrl+C de planilha: o Excel manda as células e uma foto delas): vale o texto', () => {
    expect(destinoDaColagem(print, 'Cimento\t10\tsc\r\nAreia\t3\tm3\r\n')).toBe('texto');
    expect(destinoDaColagem(print, 'cimento 10 sacos')).toBe('texto');
  });

  it('arquivo copiado no Explorer que traz o caminho como texto: continua importando', () => {
    const pdf = [{ name: 'pedido.pdf' }];
    expect(destinoDaColagem(pdf, 'C:\\Users\\alguem\\Downloads\\pedido.pdf')).toBe('arquivos');
    expect(destinoDaColagem(pdf, '\\\\servidor\\compras\\pedido.pdf')).toBe('arquivos');
    expect(destinoDaColagem(pdf, 'pedido.pdf')).toBe('arquivos');
  });

  it('o texto colado entra no fim do que já está, numa linha nova', () => {
    expect(juntarTexto('', 'a')).toBe('a');
    expect(juntarTexto('a\n\n  ', 'b')).toBe('a\nb');
  });

  it('o aviso: quantos itens e quantas linhas ficaram de fora', () => {
    expect(avisoDaLeitura(7, 2)).toBe('7 itens importados via IA · 2 linhas ignoradas.');
    expect(avisoDaLeitura(1, 1)).toBe('1 item importado via IA · 1 linha ignorada.');
    expect(avisoDaLeitura(3, 0)).toBe('3 itens importados via IA.');
  });
});
