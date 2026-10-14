import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

/**
 * "Encarregado" em todas as telas (CTO-D799, palavra do Pedro). Varre todo texto
 * literal do código (aspas, crase e o texto do JSX): nenhum diz "mestre", a não
 * ser os nomes de dentro, que ninguém lê e que o banco conhece por esse nome.
 * O rascunho da Rev. 01 do PS.02 (`procedimento/rev01/*.json`) também é lido
 * (CTO-D800 §2). A revisão gravada é a 00, que não diz "mestre"; o rascunho
 * espera o "Gravar" do Pedro, que lê os trechos marcados antes.
 */

/** Os nomes de dentro: o papel, as tabelas, as funções do banco, a guarda do celular e o id da tela. */
const NOMES_DE_DENTRO = new Set([
  'mestre',
  'mestres',
  'campisi-oc-mestre',
  'mestre_da_obra',
  'acesso_do_mestre',
  'id, mestre, evento, por_nome, em, motivo',
  'acesso-do-mestre',
  'por_mestre_na_obra',
  'tirar_mestre_da_obra',
  'desligar_mestre',
  'religar_mestre',
  'obras_do_mestre_com_nome',
]);

const RAIZ = process.cwd();

function arquivos(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((e) => {
    const p = join(pasta, e.name);
    if (e.isDirectory()) return arquivos(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

/** Cada texto literal com "mestre" que não é nome de dentro, com o arquivo e a linha. */
function textosComMestre(nome: string, codigo: string): string[] {
  const sf = ts.createSourceFile(nome, codigo, ts.ScriptTarget.Latest, true, nome.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const achados: string[] = [];
  const visita = (n: ts.Node): void => {
    // O caminho de um import é nome de arquivo.
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return;
    let t: string | null = null;
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateLiteralToken(n)) t = n.text;
    else if (ts.isJsxText(n)) t = n.text.trim();
    if (t && /mestre/i.test(t) && !NOMES_DE_DENTRO.has(t)) {
      achados.push(`${nome}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1} ${JSON.stringify(t)}`);
    }
    ts.forEachChild(n, visita);
  };
  visita(sf);
  return achados;
}

/** Cada texto do JSON com "mestre", com o caminho dele na árvore. No rascunho do PS.02 não há nome de dentro. */
function textosDoJsonComMestre(nome: string, no: unknown, caminho: string[] = []): string[] {
  if (typeof no === 'string') return /mestre/i.test(no) ? [`${nome} ${caminho.join('.')} ${JSON.stringify(no)}`] : [];
  if (Array.isArray(no)) return no.flatMap((v, i) => textosDoJsonComMestre(nome, v, [...caminho, String(i)]));
  if (no && typeof no === 'object') {
    return Object.entries(no).flatMap(([k, v]) => textosDoJsonComMestre(nome, v, [...caminho, k]));
  }
  return [];
}

describe('"encarregado" em todas as telas (CTO-D799)', () => {
  it('nenhum texto do código que alguém lê diz "mestre"', () => {
    const achados = arquivos(join(RAIZ, 'src')).flatMap((f) => textosComMestre(relative(RAIZ, f), readFileSync(f, 'utf8')));
    expect(achados).toEqual([]);
  });

  it('o rascunho da Rev. 01 do PS.02 (os dois JSON) também diz "encarregado" (CTO-D800 §2)', () => {
    const pasta = join(RAIZ, 'src', 'features', 'procedimento', 'rev01');
    const arquivosJson = readdirSync(pasta).filter((n) => n.endsWith('.json'));
    expect(arquivosJson.sort()).toEqual(['documento.json', 'mudancas.json']);
    const achados = arquivosJson.flatMap((n) => textosDoJsonComMestre(n, JSON.parse(readFileSync(join(pasta, n), 'utf8'))));
    expect(achados).toEqual([]);
  });

  it('a varredura do JSON pega o "mestre" no fundo da árvore, no título e no motivo', () => {
    const doc = { secoes: [{ blocos: [{ itens: [{ titulo: 'Mestre de obra', texto: [{ texto: 'pelo app do encarregado' }] }] }] }],
      mudancas: [{ motivo: 'O mestre passou a receber.' }] };
    expect(textosDoJsonComMestre('x.json', doc)).toEqual([
      'x.json secoes.0.blocos.0.itens.0.titulo "Mestre de obra"',
      'x.json mudancas.0.motivo "O mestre passou a receber."',
    ]);
  });

  it('a varredura pega o "mestre" em aspas, em crase, no meio de uma crase e no texto do JSX', () => {
    const codigo = [
      "const a = 'Fale com o mestre';",
      'const b = `Mestres de obra`;',
      'const c = `QR do ${x} mestre ${y}`;',
      'const d = <p>O mestre entra pelo QR</p>;',
      "const e = { papel: 'mestre' };",
      "import { lerMestres } from './services/supabase/mestres';",
    ].join('\n');
    expect(textosComMestre('x.tsx', codigo).map((l) => l.replace(/^x\.tsx:\d+ /, ''))).toEqual([
      '"Fale com o mestre"',
      '"Mestres de obra"',
      '" mestre "',
      '"O mestre entra pelo QR"',
    ]);
  });
});
