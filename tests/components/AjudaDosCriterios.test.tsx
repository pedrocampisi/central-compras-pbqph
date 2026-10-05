import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';

/**
 * O "?" dos critérios da qualificação (CTO-D728 §3): só onde o PS.02 diz algo
 * além da pergunta, com a fonte. As perguntas são as do banco
 * (`compras.criterios_qualificacao`); a empresa é INVENTADA; nada sai daqui.
 */

vi.mock('../../src/services/supabase/client', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
  core: () => ({}),
  compras: () => ({}),
}));

import { QualificarDialogo } from '../../src/features/fornecedores/QualificarDialogo';
import { ajudaDoCriterio } from '../../src/domain/ajudaDosCriterios';
import type { Categoria } from '../../src/domain/qualificacao';

const PERGUNTAS: Record<Categoria, string[]> = {
  material: [
    'O fornecedor atende no critério de qualidade?',
    'O fornecedor tem o menor preço de mercado?',
    'O fornecedor consegue atender conforme o prazo estipulado pela construtora?',
  ],
  servico: [
    'O fornecedor possui todas as documentações de contratação do pessoal e treinamentos de NR?',
    'O fornecedor fornece EPI para os colaboradores?',
    'O fornecedor possui menor preço do mercado?',
  ],
  controle_tecnologico: [
    'O laboratório é acreditado ou está em processo de acreditação pelo CGCRE/INMETRO?',
    'O laboratório atende aos requisitos da ABNT NBR ISO/IEC 17025?',
    'O laboratório possui certificação ABNT NBR ISO 9001?',
  ],
  projeto: [
    'O fornecedor possui todas as documentações de responsabilidade técnica?',
    'O fornecedor possui conhecimento da ABNT NBR 15575?',
    'O fornecedor possui menor preço do mercado?',
  ],
  locacao: [
    'O fornecedor possui contrato de locação do equipamento?',
    'O fornecedor possui check list de verificação do equipamento locado?',
    'O fornecedor possui menor preço do mercado?',
  ],
};

function caixa(categoria: Categoria) {
  render(
    <QualificarDialogo
      filial={{ id: 'f1', empresa_id: 'e1', razao_social: 'Fornecedor (teste)' } as never}
      categoria={{ categoria, nome: categoria, minimo: 2, criterios: PERGUNTAS[categoria] }}
      ecrs={[]}
      ecrsMarcadas={[]}
      aoGravar={() => {}}
      aoVoltar={() => {}}
    />,
  );
  return document.querySelector('[data-dialogo-qualificar]') as HTMLElement;
}

/** Em que critérios (1 a 3) a caixa mostra o "?". */
function comAjuda(c: HTMLElement): number[] {
  return [1, 2, 3].filter((n) =>
    within(c.querySelector(`[data-criterio="${n}"]`) as HTMLElement).queryByRole('button', {
      name: `Ajuda: O que é atender o critério ${n}`,
    }),
  );
}

describe('o "?" do critério de qualidade de Materiais (o pedido do Pedro)', () => {
  it('diz o que é atender: a ECR do material e o PSQ, com a fonte', () => {
    const c = caixa('material');
    expect(comAjuda(c)).toEqual([1]);
    fireEvent.click(within(c).getByRole('button', { name: 'Ajuda: O que é atender o critério 1' }));
    const r = within(c).getByRole('note').textContent!;
    expect(r).toContain('cumpre a ECR daquele material');
    expect(r).toContain('não conforme');
    expect(r).toContain('certificado avulso');
    expect(r).toContain('Fonte: PS.02, item 2.');
  });

  it('a pergunta da planilha não muda: a legenda é a do banco', () => {
    const c = caixa('material');
    expect(c.querySelector('[data-criterio="1"] legend')!.textContent).toBe('1. O fornecedor atende no critério de qualidade?');
  });
});

describe('os outros critérios: "?" só onde o PS.02 diz algo além da pergunta', () => {
  it.each([
    ['servico', []],
    ['projeto', []],
    ['locacao', []],
    ['controle_tecnologico', [1, 2, 3]],
  ] as [Categoria, number[]][])('%s: "?" nos critérios %j', (categoria, esperado) => {
    expect(comAjuda(caixa(categoria))).toEqual(esperado);
  });

  it('o laboratório: a fonte é o item 5 do PS.02, e cada "?" diz o que a pergunta não diz', () => {
    expect(ajudaDoCriterio('controle_tecnologico', 1)).toMatch(/ensaios que vão ser contratados.*PS\.02, item 5\.$/);
    expect(ajudaDoCriterio('controle_tecnologico', 2)).toMatch(/Anexo 7.*12 meses.*PS\.02, item 5\.$/);
    expect(ajudaDoCriterio('controle_tecnologico', 3)).toMatch(/escopo os ensaios.*PS\.02, item 5\.$/);
  });

  it('critério fora de 1 a 3 não tem "?"', () => {
    expect(ajudaDoCriterio('material', 0)).toBeNull();
    expect(ajudaDoCriterio('material', 4)).toBeNull();
  });
});
