/**
 * O dia de hoje em Brasília (AAAA-MM-DD), que muda sozinho à meia-noite: a
 * tela que mostra a situação de uma qualificação é redesenhada no dia novo,
 * sem esperar recarga (perícia 28/09, B3).
 */

import { useEffect, useState } from 'react';
import { hojeEmSaoPaulo } from '../domain/ecr';
import { somaDias } from '../domain/qualificacao';
import { instanteEmBrasilia } from '../domain/umaObra';

export function useHojeEmSaoPaulo(): string {
  const [hoje, setHoje] = useState(() => hojeEmSaoPaulo());
  useEffect(() => {
    let espera: ReturnType<typeof setTimeout>;
    const marcar = () => {
      const meiaNoite = instanteEmBrasilia(somaDias(hoje, 1), '00:00').getTime();
      espera = setTimeout(() => {
        const agora = hojeEmSaoPaulo();
        // Chegou adiantado: marca de novo.
        if (agora === hoje) marcar();
        else setHoje(agora);
      }, Math.max(meiaNoite - Date.now(), 0));
    };
    marcar();
    return () => clearTimeout(espera);
  }, [hoje]);
  return hoje;
}
