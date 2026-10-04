/**
 * A entidade de HTML que a leitura do pedido devolve no lugar do caractere
 * (CTO-D680): a OC 2026/010 gravou "DISCO SERRA … F&#x3D;3/4" no item 3, e o
 * PDF imprimiu assim. A leitura desfaz na entrada, antes de o item existir.
 *
 * Uma passada só, de propósito: "&amp;#x3D;" vira "&#x3D;" e para aí — quem
 * escreveu o texto com "&amp;" quis o "&". Lógica pura, sem tela.
 */

const NOMEADAS: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** O caractere que um número pode virar: nada de controle (menos tab e quebra de linha). */
function caractereValido(n: number): boolean {
  return Number.isInteger(n) && n <= 0x10ffff && (n >= 32 || n === 9 || n === 10 || n === 13);
}

export function desfazerEntidades(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (inteira, corpo: string) => {
    if (corpo.startsWith('#')) {
      const hexa = corpo[1] === 'x' || corpo[1] === 'X';
      const n = hexa ? parseInt(corpo.slice(2), 16) : parseInt(corpo.slice(1), 10);
      return caractereValido(n) ? String.fromCodePoint(n) : inteira;
    }
    return NOMEADAS[corpo.toLowerCase()] ?? inteira;
  });
}
