/**
 * Tema claro/escuro do padrão Campisi.
 *
 * O tema mora no atributo `data-tema` do <html>, e quem o aplica primeiro é o
 * script inline do index.html — antes da primeira pintura, para a tela não
 * piscar branca antes de virar escura. Este hook só lê e alterna.
 *
 * Regra: escolha manual manda e fica salva; sem escolha, segue o sistema.
 */

import { useCallback, useEffect, useState } from 'react';

const CHAVE = 'tema';

function temaAtual(): boolean {
  return document.documentElement.dataset['tema'] === 'escuro';
}

export function useTema(): { escuro: boolean; alternar: () => void } {
  const [escuro, setEscuro] = useState(temaAtual);

  // Enquanto ninguém escolheu, o sistema continua mandando: se a pessoa trocar
  // o tema do Windows com o app aberto, a tela acompanha.
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const aoMudar = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(CHAVE) !== null) return;
      aplicar(e.matches);
      setEscuro(e.matches);
    };
    mq.addEventListener('change', aoMudar);
    return () => mq.removeEventListener('change', aoMudar);
  }, []);

  const alternar = useCallback(() => {
    const novo = !temaAtual();
    aplicar(novo);
    try {
      localStorage.setItem(CHAVE, novo ? 'escuro' : 'claro');
    } catch {
      /* sem localStorage: vale só para esta sessão */
    }
    setEscuro(novo);
  }, []);

  return { escuro, alternar };
}

function aplicar(escuro: boolean) {
  if (escuro) document.documentElement.dataset['tema'] = 'escuro';
  else delete document.documentElement.dataset['tema'];
}
