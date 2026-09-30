import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

/**
 * A tela das ECRs (CTO-D586 §4, com a D588 §4 e a D589 §4.1): cada ECR aberta
 * mostra as cinco seções como o documento, os materiais e o histórico de
 * revisões no fim; cada ECR tem o botão do PDF. Os textos são os das ECRs 03
 * e 08; os nomes do histórico são inventados.
 */

const baixar = vi.fn<(ecr: unknown) => Promise<void>>(async () => {});
vi.mock('../../src/services/pdf/generateEcrPdf', () => ({ baixarPdfDaEcr: (e: unknown) => baixar(e) }));
// Nada aqui fala com o banco (o .env.local aponta para a produção): quem pergunta se pode revisar ouve "não".
vi.mock('../../src/services/supabase/ecrs', () => ({ podeRevisarEcr: async () => false, revisarEcr: vi.fn() }));
vi.mock('../../src/services/supabase/sync', () => ({ recarregarDados: vi.fn() }));

import { CatalogoPage } from '../../src/features/catalogo-ecr/CatalogoPage';
import { useDataStore } from '../../src/stores/useDataStore';
import { useUiStore } from '../../src/stores/useUiStore';
import { secoesDoBanco } from '../../src/domain/ecr';
import { normalizeEcr } from '../../src/domain/normalize';
import type { Data, Ecr } from '../../src/domain/types';
import ecrs from '../fixtures/ecrs-03-e-08.json';

function ecr(i: 0 | 1, extra: Partial<Ecr> = {}): Ecr {
  const e = ecrs[i]!;
  return {
    ...normalizeEcr({
      id: i === 0 ? 3 : 8,
      codigo: e.codigo,
      nome: i === 0 ? 'Concreto Usinado' : 'Revestimento de Parede e Piso',
      categoria: 'Estrutura',
      // Os campos de antes: o banco ainda pode mandá-los, e nem o código nem a tela os leem (CTO-D596).
      objetivo: 'OBJETIVO VELHO',
      escopo: 'ESCOPO VELHO',
      normas: [{ codigo: 'NBR VELHA', titulo: 'norma velha' }],
      observacoes: 'OBSERVAÇÃO VELHA',
      materiais: [{ id: 'm1', descricao: 'Concreto fck 30', unidade_padrao: 'm³' }],
    }),
    revisao: e.revisao,
    emitida_em: e.emitida_em,
    secoes: secoesDoBanco(e.secoes),
    revisoes: [
      { revisao: '00', data: '2026-04-15', descricao: 'Emissão Inicial', revisado_por: 'Revisor de teste', aprovado_por: 'Aprovador de teste' },
    ],
    ...extra,
  };
}

const SEM_TEXTO = normalizeEcr({ id: 21, codigo: 'ECR 21', nome: 'Ainda sem texto' });

function montar(lista: Ecr[]) {
  useDataStore.setState({ data: { ecrs: lista } as unknown as Data });
  render(<CatalogoPage />);
}

function abrir(codigo: string) {
  const botao = screen.getByText(codigo).closest('button')!;
  fireEvent.click(botao);
  return document.querySelector('[data-ecr-aberta]') as HTMLElement;
}

beforeEach(() => {
  useUiStore.setState({ catalogoFilter: { search: '' } });
  baixar.mockClear();
});

describe('D586/D588 — a lista e o que a página diz', () => {
  it('o subtítulo diz o que é: o texto em vigor, com o histórico — e não "cópia do SGQ"', () => {
    montar([ecr(0), ecr(1)]);
    const sub = document.querySelector('.section-sub')!.textContent!;
    expect(sub).toContain('2 ECRs. O texto em vigor de cada ECR, com o histórico de revisões no fim.');
    expect(sub).not.toMatch(/SGQ|cópia/i);
  });

  it('fechada, cada ECR mostra código, nome e "Rev. 00 · emitida em 15/04/2026"', () => {
    montar([ecr(0)]);
    const botao = screen.getByText('ECR 03').closest('button')!;
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(botao.textContent).toContain('Concreto Usinado');
    expect(botao.textContent).toContain('Rev. 00 · emitida em 15/04/2026');
    expect(document.querySelector('[data-ecr-aberta]')).toBeNull();
  });
});

describe('D586 — a ECR aberta como o documento', () => {
  it('as cinco seções, "01." a "05.", na ordem', () => {
    montar([ecr(0)]);
    const corpo = abrir('ECR 03');
    expect([...corpo.querySelectorAll('section h4')].slice(0, 5).map((h) => h.textContent)).toEqual([
      '01. REFERÊNCIA',
      '02. ESPECIFICAÇÃO DE COMPRA E RECEBIMENTO',
      '03. REGISTRO DO FORNECEDOR',
      '04. INSPEÇÃO DO RECEBIMENTO',
      '05. MANUSEIO, ARMAZENAMENTO E IDENTIFICAÇÃO',
    ]);
  });

  it('a lista com as linhas; o rótulo em negrito; a nota "Atenção" fora da lista', () => {
    montar([ecr(0)]);
    const corpo = abrir('ECR 03');
    const inspecao = corpo.querySelectorAll('section')[3]!;
    expect(inspecao.querySelectorAll('li')).toHaveLength(5);
    expect(within(inspecao).getByText('Especificações:').tagName).toBe('STRONG');
    const nota = within(inspecao).getByText('Atenção:').closest('p')!;
    expect(nota.closest('ul')).toBeNull();
    expect(nota.textContent).toMatch(/^Atenção: Qualquer divergência/);
  });

  it('o texto é o do banco, sem conserto: o "mᶟ" fica "mᶟ" na tela', () => {
    montar([ecr(0)]);
    expect(abrir('ECR 03').textContent).toContain('Volume (mᶟ);');
  });

  it('a ECR 08: o registro do fornecedor com as 9 linhas', () => {
    montar([ecr(1)]);
    expect(abrir('ECR 08').querySelectorAll('section')[2]!.querySelectorAll('li')).toHaveLength(9);
  });

  it('as seções antigas saíram da tela', () => {
    montar([ecr(0)]);
    const texto = abrir('ECR 03').textContent!;
    for (const velho of ['Objetivo', 'Escopo', 'Normas Técnicas', 'Documentos Obrigatórios', 'Critérios de Recebimento', 'Ensaios', 'Observações', 'VELH']) {
      expect(texto).not.toContain(velho);
    }
  });

  it('os materiais, com o título simples "Materiais"', () => {
    montar([ecr(0)]);
    const m = abrir('ECR 03').querySelector('[data-materiais]')!;
    expect(m.querySelector('h4')!.textContent).toBe('Materiais');
    expect(m.textContent).toContain('Concreto fck 30');
  });

  it('uma ECR sem texto diz isso numa linha, e não quebra', () => {
    montar([SEM_TEXTO]);
    const corpo = abrir('ECR 21');
    expect(corpo.querySelector('[data-sem-texto]')!.textContent).toBe('O texto desta ECR ainda não foi carregado.');
  });
});

describe('D588 — o histórico de revisões no fim', () => {
  it('a tabela com as cinco colunas e a linha 00, depois dos materiais', () => {
    montar([ecr(0)]);
    const corpo = abrir('ECR 03');
    const h = corpo.querySelector('[data-historico]')!;
    expect(h.querySelector('h4')!.textContent).toBe('Histórico de revisões');
    expect([...h.querySelectorAll('th')].map((t) => t.textContent)).toEqual([
      'Revisão', 'Data', 'Descrição', 'Revisado por', 'Aprovado por',
    ]);
    expect([...h.querySelectorAll('tbody td')].map((t) => t.textContent)).toEqual([
      '00', '15/04/2026', 'Emissão Inicial', 'Revisor de teste', 'Aprovador de teste',
    ]);
    const secoes = [...corpo.children];
    expect(secoes[secoes.length - 1]).toBe(h);
  });

  it('sem histórico lido, a tela diz — e não desenha uma tabela vazia', () => {
    montar([ecr(0, { revisoes: null })]);
    const h = abrir('ECR 03').querySelector('[data-historico]')!;
    expect(h.textContent).toContain('O histórico de revisões desta ECR ainda não foi carregado.');
    expect(h.querySelector('table')).toBeNull();
  });
});

describe('D589 — o botão do PDF em cada ECR', () => {
  it('está em cada ECR com texto, fechada ou aberta, e baixa o PDF daquela ECR', () => {
    montar([ecr(0), ecr(1)]);
    expect(screen.getAllByRole('button', { name: /^PDF da / })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'PDF da ECR 08' }));
    expect(baixar).toHaveBeenCalledTimes(1);
    expect((baixar.mock.calls[0] as unknown as [Ecr])[0].codigo).toBe('ECR 08');
  });

  it('o PDF não abre nem fecha a ECR', () => {
    montar([ecr(0)]);
    fireEvent.click(screen.getByRole('button', { name: 'PDF da ECR 03' }));
    expect(document.querySelector('[data-ecr-aberta]')).toBeNull();
  });

  it('sem texto, não há PDF para baixar', () => {
    montar([SEM_TEXTO]);
    expect(screen.queryByRole('button', { name: /^PDF da / })).toBeNull();
  });
});

describe('CTO-D644 — a busca do Catálogo segue o tema', () => {
  // No escuro, a caixa solta (estilo no próprio elemento, sem fundo) ficava
  // branca no meio da tela. Agora é a barra de busca das outras listas, cujas
  // cores vêm dos tokens do tema.
  it('é a mesma barra das outras listas: com nome, sem estilo solto, e ainda filtra', () => {
    montar([ecr(0), ecr(1)]);
    const caixa = screen.getByRole('searchbox', { name: 'Buscar ECR…' });
    expect(caixa.getAttribute('style')).toBeNull();
    fireEvent.change(caixa, { target: { value: 'revestimento' } });
    expect(screen.queryByText('Concreto Usinado')).toBeNull();
    expect(screen.getByText('Revestimento de Parede e Piso')).toBeTruthy();
  });
});
