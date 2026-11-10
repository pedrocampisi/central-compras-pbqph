import { describe, expect, it } from 'vitest';
import { NOMES_VELHOS_DA_PONTE } from './nomesVelhosDaPonte';
import { readFileSync } from 'node:fs';

/**
 * D1034, lote (b): as telas do pedido (Nova OC, importação, tutorial, entrega,
 * Stepper, Procedimento, Configurações e os diálogos da qualificação) falam só
 * a língua do padrão "Dia e noite". A trava lê as folhas do lote e procura:
 *   - nome velho da ponte (`ponte-dos-nomes.css`), que sai no fim do lote (c);
 *   - letra abaixo de 13 px (DESIGN.md: "nenhuma letra fica abaixo de 13 px");
 *   - caixa alta (DESIGN.md: "caixa de frase em tudo");
 *   - cor solta.
 */

const FOLHAS = [
  'src/features/ordens-compra/CampoDeImportacao.module.css',
  'src/features/ordens-compra/NovaOcPage.module.css',
  'src/features/ordens-compra/RegistrarEntregaDialogo.module.css',
  'src/features/ordens-compra/TutorialDaNovaOc.module.css',
  'src/features/procedimento/ProcedimentoPage.module.css',
  'src/features/qualificacao/DialogosDoRegistro.module.css',
  'src/features/qualificacao/RegistrosDaEmpresa.module.css',
  'src/components/Stepper/Stepper.module.css',
  'src/features/configuracoes/ConfigPage.module.css',
  'src/features/fornecedores/QualificarDialogo.module.css',
];

const semComentario = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
// A ponte saiu no fim do lote (c); a lista dos nomes dela fica congelada no teste.
const NOMES_VELHOS = NOMES_VELHOS_DA_PONTE;

describe('D1034b — as folhas do pedido falam só a língua do padrão', () => {
  it('a ponte tem nomes para procurar (a trava não passa vazia)', () => {
    expect(NOMES_VELHOS.length).toBeGreaterThan(30);
  });

  for (const folha of FOLHAS) {
    const css = semComentario(readFileSync(folha, 'utf-8'));

    it(`${folha}: nenhum nome velho da ponte`, () => {
      const usados = [...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]!);
      expect(usados.filter((n) => NOMES_VELHOS.includes(n))).toEqual([]);
    });

    it(`${folha}: nenhuma letra abaixo de 13 px, nada em caixa alta, nenhuma cor solta`, () => {
      expect(css).not.toMatch(/font-size:\s*([0-9]|1[0-2])(\.\d+)?px/);
      expect(css).not.toMatch(/font-size:\s*0\.[0-7]\d*rem/);
      expect(css).not.toMatch(/text-transform:\s*uppercase/);
      expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    });
  }
});

describe('D1034b — a Nova OC', () => {
  const tsx = readFileSync('src/features/ordens-compra/NovaOcPage.tsx', 'utf-8');
  const css = semComentario(readFileSync('src/features/ordens-compra/NovaOcPage.module.css', 'utf-8'));

  it('o título fica inteiro: ele toma a largura dele, e a fila de botões desce', () => {
    expect(css).toMatch(/\.tituloDoTopo\s*\{[^}]*flex:\s*1 1 auto/);
  });

  it('as ações de apoio do alto moram no "Mais" (no b2 isso vale em toda largura, D1034h item 1)', () => {
    expect(tsx).toContain('rotulo="Mais ações da OC"');
    for (const acao of ['Tutorial', 'Visualizar o PDF', 'Cancelar']) {
      expect(tsx).toContain(`rotulo: '${acao}'`);
    }
  });

  it('o vazio dos itens é o compacto, sem o mascote no meio do formulário', () => {
    expect(tsx).toMatch(/<EmptyState\s+compacto\s+title="Nenhum item adicionado"/);
  });
});
