/**
 * A oferta do tutorial já foi feita a esta pessoa? (CTO-D763 §1.5: uma vez só.)
 *
 * Fica no `localStorage` deste navegador, por pessoa, como o tema. Em outro
 * computador a oferta volta uma vez — guardar por pessoa em qualquer lugar
 * seria coluna no banco, e esta casa não altera o banco.
 *
 * Navegador que não guarda nada (janela anônima, armazenamento bloqueado): a
 * oferta não aparece, para não perguntar de novo a cada visita. O botão
 * "Tutorial" continua lá.
 */

const PREFIXO = 'oc-tutorial-nova-oc-oferecido:';

/** `true` quando deve oferecer: nunca ofereceu a esta pessoa neste navegador. */
export function deveOferecerTutorial(pessoa: string | undefined): boolean {
  if (!pessoa) return false;
  try {
    return localStorage.getItem(PREFIXO + pessoa) === null;
  } catch {
    return false;
  }
}

/** Ofereceu (aceitou ou recusou, tanto faz): não oferece mais. */
export function marcarTutorialOferecido(pessoa: string | undefined): void {
  if (!pessoa) return;
  try {
    localStorage.setItem(PREFIXO + pessoa, new Date().toISOString().slice(0, 10));
  } catch {
    /* sem armazenamento: a oferta já não aparece nesse caso */
  }
}
