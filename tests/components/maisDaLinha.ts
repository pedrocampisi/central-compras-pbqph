/**
 * O caminho de teste até uma ação que mora no "Mais" (CTO-D1034f item 1): abre
 * os três pontos da linha e escolhe a ação pelo nome. As ações não sumiram,
 * mudaram de lugar; os testes que as clicavam passam a ir por aqui.
 */
import { fireEvent, within } from '@testing-library/react';

const botaoDoMais = (dentro: HTMLElement) => within(dentro).queryByRole('button', { name: /^Mais ações/ });

/** As ações que o "Mais" da linha oferece, pelo nome; vazio quando a linha não tem "Mais". */
export function acoesDoMais(dentro: HTMLElement): string[] {
  const botao = botaoDoMais(dentro);
  if (!botao) return [];
  fireEvent.click(botao);
  const nomes = within(dentro)
    .getAllByRole('menuitem')
    .map((b) => b.textContent ?? '');
  fireEvent.click(botao); // fecha de novo
  return nomes;
}

/** O item do "Mais", com o menu aberto (para olhar se está desabilitado, o título etc.). */
export function itemDoMais(dentro: HTMLElement, nome: string | RegExp): HTMLElement {
  const botao = botaoDoMais(dentro);
  if (!botao) throw new Error('a linha não tem o botão "Mais"');
  if (botao.getAttribute('aria-expanded') !== 'true') fireEvent.click(botao);
  return within(dentro).getByRole('menuitem', { name: nome });
}

/** Abre o "Mais" da linha e escolhe a ação. */
export function escolherNoMais(dentro: HTMLElement, nome: string | RegExp) {
  fireEvent.click(itemDoMais(dentro, nome));
}
