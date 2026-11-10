import { describe, expect, it } from 'vitest';
import { NOMES_VELHOS_DA_PONTE } from './nomesVelhosDaPonte';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * D1034, lote (c), passo 1: o app do mestre, os Recebimentos, o editor de ECR
 * e as folhas gerais falam só a língua do padrão. Com isso nenhuma folha da
 * casa lê mais a ponte dos nomes (`ponte-dos-nomes.css`), e ela saiu.
 */

const semComentario = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
// A ponte saiu no fim do lote (c); a lista dos nomes dela fica congelada no teste.
const NOMES_VELHOS = NOMES_VELHOS_DA_PONTE;

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

  it('a ponte saiu: o arquivo não existe, e o main.tsx não a importa', () => {
    expect(existsSync('src/styles/ponte-dos-nomes.css')).toBe(false);
    expect(readFileSync('src/main.tsx', 'utf-8')).not.toContain('ponte-dos-nomes');
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

describe('D1034i — os itens da Nova OC em cartão abaixo de 720 px', () => {
  const tsx = readFileSync('src/features/ordens-compra/NovaOcPage.tsx', 'utf-8');
  const css = semComentario(readFileSync('src/features/ordens-compra/NovaOcPage.module.css', 'utf-8'));
  const estreito = css.slice(css.indexOf('@media (max-width: 720px) {\n  .tableWrap') >= 0 ? css.indexOf('@media (max-width: 720px) {\n  .tableWrap') : css.search(/@media \(max-width: 720px\) \{\s*\.tableWrap/));

  it('nenhum campo some: cada célula tem o seu lugar no cartão', () => {
    for (const lugar of ['num', 'descricao', 'qtd', 'un', 'preco', 'ecr', 'ipi', 'desc', 'obs', 'total', 'tirar']) {
      expect(tsx).toContain(`data-cartao="${lugar}"`);
      expect(estreito).toContain(`td[data-cartao='${lugar}']`);
    }
  });

  it('a descrição em cima, na largura inteira; o cabeçalho sai; nada rola de lado', () => {
    expect(estreito).toMatch(/td\[data-cartao='descricao'\]\s*\{\s*grid-column:\s*2 \/ 13;\s*grid-row:\s*1;/);
    expect(estreito).toMatch(/\.itemsTable thead\s*\{\s*display:\s*none/);
    expect(estreito).toMatch(/\.tableWrap\s*\{\s*overflow:\s*visible/);
  });

  it('o alvo do toque tem 44 px: os campos e o X de tirar', () => {
    expect(estreito).toMatch(/\.cellSelect\s*\{\s*min-height:\s*44px/);
    expect(estreito).toMatch(/\.removeBtn\s*\{\s*width:\s*44px;\s*height:\s*44px/);
  });
});
