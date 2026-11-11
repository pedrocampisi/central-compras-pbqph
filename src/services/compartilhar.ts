/**
 * A folha de compartilhar do aparelho, com arquivo (CTO-D1036 §2.1 e §2.3).
 *
 * Onde funciona: no celular — Chrome do Android e Safari do iPhone e do iPad,
 * e o ícone instalado deles. Onde não: quase todo navegador de computador
 * (Firefox, e o Chrome do Windows sem a folha de compartilhar do sistema); lá,
 * quem chama esconde o botão ou baixa o arquivo.
 */

type NavegadorQueCompartilha = Navigator & { canShare?: (d: ShareData) => boolean };

/** O aparelho deixa mandar ESTE arquivo pela folha de compartilhar? */
export function podeCompartilharArquivo(arquivo: File): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavegadorQueCompartilha;
  try {
    return typeof nav.share === 'function' && typeof nav.canShare === 'function' && nav.canShare({ files: [arquivo] });
  } catch {
    return false;
  }
}

/** O aparelho compartilha arquivo deste tipo? Medido com uma amostra vazia. */
export function compartilhaArquivoDoTipo(tipo: string, nome: string): boolean {
  try {
    return podeCompartilharArquivo(new File([''], nome, { type: tipo }));
  } catch {
    return false;
  }
}

/** Fechar a folha sem escolher ninguém não é erro. */
export function desistiuDeCompartilhar(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}

/** O aparelho recusou porque o toque "esfriou" enquanto o arquivo era preparado (o Safari faz isso). */
export function toqueEsfriou(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'NotAllowedError';
}
