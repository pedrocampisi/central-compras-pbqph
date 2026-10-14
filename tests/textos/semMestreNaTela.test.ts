import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

/**
 * "Encarregado" em todas as telas (CTO-D799, palavra do Pedro). Varre todo texto
 * literal do código (aspas, crase e o texto do JSX): nenhum diz "mestre", a não
 * ser os nomes de dentro, que ninguém lê e que o banco conhece por esse nome.
 * O texto do PS.02 (`procedimento/rev01/*.json`) fica de fora de propósito: é
 * documento controlado, e a revisão é do Pedro.
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

describe('"encarregado" em todas as telas (CTO-D799)', () => {
  it('nenhum texto do código que alguém lê diz "mestre"', () => {
    const achados = arquivos(join(RAIZ, 'src')).flatMap((f) => textosComMestre(relative(RAIZ, f), readFileSync(f, 'utf8')));
    expect(achados).toEqual([]);
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
