import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * D1034, lote (c), passo 1: o app do mestre, os Recebimentos, o editor de ECR
 * e as folhas gerais falam só a língua do padrão. Com isso nenhuma folha da
 * casa lê mais a ponte dos nomes (`ponte-dos-nomes.css`), e ela pode sair.
 */

const semComentario = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const ponte = semComentario(readFileSync('src/styles/ponte-dos-nomes.css', 'utf-8'));
const NOMES_VELHOS = [...ponte.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]!);

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return /\.(css|tsx?)$/.test(nome) ? [caminho] : [];
  });
}

describe('D1034c — ninguém em src lê a ponte dos nomes', () => {
  it('a ponte tem nomes para procurar (a trava não passa vazia)', () => {
    expect(NOMES_VELHOS.length).toBeGreaterThan(30);
  });

  it('nenhuma folha nem tela usa var() de um nome velho', () => {
    const achados: string[] = [];
    for (const f of arquivos('src')) {
      if (f.replace(/\\/g, '/').endsWith('styles/ponte-dos-nomes.css')) continue;
      const texto = semComentario(readFileSync(f, 'utf-8'));
      for (const m of texto.matchAll(/var\((--[a-z0-9-]+)/g)) {
        if (NOMES_VELHOS.includes(m[1]!)) achados.push(`${f}: ${m[1]}`);
      }
    }
    expect(achados).toEqual([]);
  });

  it('o QR do mestre usa as duas cores fixas da candidata cc-qr', () => {
    const candidatas = semComentario(readFileSync('src/styles/candidatas.css', 'utf-8'));
    expect(candidatas).toMatch(/--cc-qr-claro:\s*#ffffff/);
    expect(candidatas).toMatch(/--cc-qr-escuro:\s*#0b1a23/);
    const mestres = readFileSync('src/features/mestres/MestresPage.module.css', 'utf-8');
    expect(mestres).toContain('var(--cc-qr-claro)');
    expect(mestres).toContain('var(--cc-qr-escuro)');
  });
});
