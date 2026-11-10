import { useEffect, useRef } from 'react';

/**
 * O foco preso na janela aberta (D1034k, achado 1 do laudo da pintura).
 *
 * Enquanto a janela está aberta, o Tab e o Shift+Tab dão a volta dentro dela,
 * e o teclado não sai para a tela de trás. Ao abrir, se o foco está fora, ele
 * entra: na própria caixa, quando ela tem `tabIndex`, ou no primeiro alvo. Ao
 * fechar, volta para quem a abriu.
 *
 * Com uma janela por cima de outra (a confirmação sobre a gaveta), só a de
 * cima prende: é a última `[aria-modal="true"]` da página.
 *
 * Toda janela modal da casa usa esta peça; a trava `TriagemDaPintura` confere.
 */
const ALVOS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

function alvos(caixa: HTMLElement): HTMLElement[] {
  return [...caixa.querySelectorAll<HTMLElement>(ALVOS)].filter((el) => !el.closest('[hidden], [inert]'));
}

function eAJanelaDeCima(caixa: HTMLElement): boolean {
  const minha = caixa.closest('[aria-modal="true"]') ?? caixa;
  const todas = document.querySelectorAll('[aria-modal="true"]');
  const ultima = todas[todas.length - 1];
  return !ultima || ultima === minha || minha.contains(ultima);
}

export function useFocoPreso<T extends HTMLElement>(aberta = true) {
  const caixa = useRef<T>(null);

  useEffect(() => {
    if (!aberta) return;
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const no = caixa.current;
    if (no && !no.contains(document.activeElement)) {
      (no.hasAttribute('tabindex') ? no : (alvos(no)[0] ?? no)).focus();
    }

    const noTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !no || !eAJanelaDeCima(no)) return;
      const lista = alvos(no);
      const atual = document.activeElement;
      const dentro = atual instanceof Node && no.contains(atual);
      if (lista.length === 0) {
        e.preventDefault();
        no.focus();
        return;
      }
      const primeiro = lista[0]!;
      const ultimo = lista[lista.length - 1]!;
      if (e.shiftKey && (!dentro || atual === primeiro || atual === no)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (!dentro || atual === ultimo)) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener('keydown', noTab);
    return () => {
      document.removeEventListener('keydown', noTab);
      if (antes?.isConnected) antes.focus();
    };
  }, [aberta]);

  return caixa;
}
