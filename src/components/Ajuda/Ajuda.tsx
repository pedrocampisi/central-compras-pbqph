/**
 * O "?" da régua de tela do Pedro (CTO-D475): toda dúvida ganha um. A resposta
 * abre NA PÁGINA, logo abaixo da linha do "?", e empurra o resto — não cobre
 * nada. Abre com clique, Enter ou espaço; fecha com Esc, com o "Fechar", com
 * outro clique no "?" ou com um clique fora.
 *
 * O invólucro é `display: contents`: o "?" e a resposta viram filhos da linha
 * onde o "?" mora. A linha precisa quebrar (`flex-wrap: wrap`), e a resposta
 * ocupa a largura toda.
 */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './Ajuda.module.css';

interface Props {
  /** Do que é a dúvida — vira o nome do botão para quem lê a tela em voz. */
  sobre: string;
  children: ReactNode;
}

export function Ajuda({ sobre, children }: Props) {
  const [aberta, setAberta] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!aberta) return;
    const fora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberta(false);
    };
    // Na captura, e marcando o evento: o Esc que fecha a ajuda não fecha
    // também o que estiver em volta (o campo da importação, por exemplo).
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setAberta(false);
    };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc, true);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc, true);
    };
  }, [aberta]);

  return (
    <span ref={ref} className={styles.ajuda}>
      <button
        type="button"
        className={[styles.botao, aberta ? styles.botaoAberto : ''].filter(Boolean).join(' ')}
        aria-expanded={aberta}
        aria-controls={id}
        aria-label={`Ajuda: ${sobre}`}
        title={sobre}
        onClick={() => setAberta((a) => !a)}
      >
        ?
      </button>
      {aberta && (
        <span id={id} role="note" className={styles.resposta}>
          <span className={styles.texto}>{children}</span>
          <button type="button" className={styles.fechar} onClick={() => setAberta(false)}>
            Fechar
          </button>
        </span>
      )}
    </span>
  );
}
