/**
 * Loader do martelo — o único movimento que o padrão permite fora do login.
 *
 * Os dois quadros (133 KB) só ganham endereço se a espera passar de 250ms:
 * abaixo disso o loader apenas piscaria, e piscada chama mais atenção que o
 * vazio que ela vinha esconder.
 */

import { useEffect, useState } from 'react';
import styles from './Loader.module.css';

const ATRASO_MS = 250;

export function Loader({ texto }: { texto?: string }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), ATRASO_MS);
    return () => clearTimeout(t);
  }, []);

  if (!visivel) return null;

  const base = `${import.meta.env.BASE_URL}marca/`;

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={`${styles.loader} ${styles.ativo}`}>
        <img src={`${base}loader-quadro-04.png`} alt="" />
        <img src={`${base}loader-quadro-05.png`} alt="" />
      </div>
      {texto && <p className={styles.texto}>{texto}</p>}
    </div>
  );
}
