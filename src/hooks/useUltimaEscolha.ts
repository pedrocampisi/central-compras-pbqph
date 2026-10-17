/**
 * Vale só o último arquivo escolhido (CTO-D818 §2.1). A leitura da IA leva até
 * 25 s: se a pessoa escolhe outro arquivo no meio, a resposta do primeiro chega
 * depois e não pode cair em cima do segundo. Cada escolha pega a sua vez, e a
 * resposta só vale enquanto a vez ainda é dela.
 */

import { useCallback, useRef } from 'react';

export function useUltimaEscolha(): () => () => boolean {
  const vez = useRef(0);
  return useCallback(() => {
    const minha = ++vez.current;
    return () => minha === vez.current;
  }, []);
}
