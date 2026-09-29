/**
 * As letras que o PDF da ECR desenha (perícia de 27/09, achado 3; CTO-D607).
 *
 * O PDF usa duas fontes padrão, que todo leitor de PDF já tem e que por isso
 * não vão dentro do arquivo (o PDF não cresce):
 * - a Helvetica, com a tabela do Windows (cp1252): letras, acentos, "°", "±",
 *   "²", "³", "µ", as aspas curvas e os travessões;
 * - a Symbol, com os sinais das especificações — "≥", "≤", "≠", "≈", "√",
 *   "∞", as setas — e as letras gregas.
 *
 * O editor só aceita o que uma das duas desenha: nada que ele aceita vira "?"
 * no PDF. O "?" fica só para o texto que não passou pelo editor.
 */

/** Os 27 sinais da tabela do Windows que ficam fora do Latin-1 (aspas curvas, travessões…). */
const EXTRAS_DO_CP1252 = new Set(
  [0x152, 0x153, 0x160, 0x161, 0x178, 0x17d, 0x17e, 0x192, 0x2c6, 0x2dc, 0x2013, 0x2014, 0x2018, 0x2019, 0x201a,
    0x201c, 0x201d, 0x201e, 0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2039, 0x203a, 0x20ac, 0x2122],
);

/**
 * Medido nas 20 ECRs: um caractere só ficava de fora, o "ᶟ" de "mᶟ", na
 * ECR 03. Ele sai como "³", que é como o documento o mostra.
 */
const TROCAS: Record<string, string> = { 'ᶟ': '³' };

const GREGAS = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω';
const NA_SYMBOL = 'ABGDEZHQIKLMNXOPRSTUFCYWabgdezhqiklmnxoprstufcyw';

/** O sinal → o código dele na fonte Symbol. */
const SINAIS: Record<string, number> = {
  '≥': 0xb3, '≤': 0xa3, '≠': 0xb9, '≈': 0xbb, '≡': 0xba, '≅': 0x40, '−': 0x2d, '√': 0xd6, '∞': 0xa5,
  '∝': 0xb5, '∂': 0xb6, '∑': 0xe5, '∫': 0xf2, '∅': 0xc6, '′': 0xa2, '″': 0xb2,
  // O incremento e o ohm são outros caracteres, com o mesmo desenho do Δ e do Ω gregos.
  '∆': 0x44, 'Ω': 0x57,
  '→': 0xae, '←': 0xac, '↑': 0xad, '↓': 0xaf, '↔': 0xab, 'ς': 0x56, 'ϕ': 0x6a, 'ϑ': 0x4a,
  ...Object.fromEntries(Array.from(GREGAS, (g, i) => [g, NA_SYMBOL.charCodeAt(i)])),
};

/**
 * A largura de cada sinal na Symbol, em milésimos do tamanho da letra (as
 * métricas públicas da fonte, da Adobe). A tabela da biblioteca do PDF dá
 * 580 para quase todos, e a seta tem 987: medida por ela, a palavra seguinte
 * encostava na seta.
 */
export const LARGURA_NA_SYMBOL: Record<number, number> = {
  0x20: 250, 0x2d: 549, 0x40: 549,
  0x41: 722, 0x42: 667, 0x43: 722, 0x44: 612, 0x45: 611, 0x46: 763, 0x47: 603, 0x48: 722, 0x49: 333, 0x4a: 631,
  0x4b: 722, 0x4c: 686, 0x4d: 889, 0x4e: 722, 0x4f: 722, 0x50: 768, 0x51: 741, 0x52: 556, 0x53: 592, 0x54: 611,
  0x55: 690, 0x56: 439, 0x57: 768, 0x58: 645, 0x59: 795, 0x5a: 611,
  0x61: 631, 0x62: 549, 0x63: 549, 0x64: 494, 0x65: 439, 0x66: 521, 0x67: 411, 0x68: 603, 0x69: 329, 0x6a: 603,
  0x6b: 549, 0x6c: 549, 0x6d: 576, 0x6e: 521, 0x6f: 549, 0x70: 549, 0x71: 521, 0x72: 549, 0x73: 603, 0x74: 439,
  0x75: 576, 0x76: 713, 0x77: 686, 0x78: 493, 0x79: 686, 0x7a: 494,
  0xa2: 247, 0xa3: 549, 0xa5: 713, 0xab: 1042, 0xac: 987, 0xad: 603, 0xae: 987, 0xaf: 603, 0xb2: 411, 0xb3: 549,
  0xb5: 713, 0xb6: 494, 0xb9: 549, 0xba: 549, 0xbb: 549, 0xc6: 823, 0xd6: 549, 0xe5: 713, 0xf2: 274,
};

function naHelvetica(c: string): boolean {
  const n = c.codePointAt(0) ?? 0;
  return (n >= 0x20 && n <= 0x7e) || (n >= 0xa0 && n <= 0xff) || EXTRAS_DO_CP1252.has(n);
}

/** O PDF desenha esta letra (por uma das duas fontes). */
export function oPdfImprime(c: string): boolean {
  return naHelvetica(c) || c in TROCAS || c in SINAIS;
}

/** As letras do texto que o PDF não desenha, cada uma uma vez, na ordem. */
export function letrasQueOPdfNaoImprime(texto: string): string[] {
  return [...new Set(Array.from(texto).filter((c) => !oPdfImprime(c)))];
}

/** Um pedaço do texto numa fonte só; `sinal` é a Symbol, já nos códigos dela. */
export interface Trecho {
  texto: string;
  sinal: boolean;
}

/**
 * O texto em trechos, na ordem: os da Helvetica (com a troca do "ᶟ") e os da
 * Symbol. Letra que nenhuma das duas desenha vira "?", e nunca some calada.
 */
export function trechosDoPdf(texto: string): Trecho[] {
  const trechos: Trecho[] = [];
  for (const c of texto) {
    const sinal = c in SINAIS;
    const letra = sinal ? String.fromCharCode(SINAIS[c]!) : naHelvetica(c) ? c : (TROCAS[c] ?? '?');
    const ultimo = trechos[trechos.length - 1];
    if (ultimo && ultimo.sinal === sinal) ultimo.texto += letra;
    else trechos.push({ texto: letra, sinal });
  }
  return trechos;
}

/** O texto tem sinal da Symbol. Sem sinal, o PDF sai como sempre saiu. */
export function temSinal(texto: string): boolean {
  return Array.from(texto).some((c) => c in SINAIS);
}

/** O texto na Helvetica, para quem não tem sinal: a troca do "ᶟ" e o "?". */
export function paraAHelvetica(texto: string): string {
  return Array.from(texto, (c) => (naHelvetica(c) ? c : (TROCAS[c] ?? '?'))).join('');
}

/** A volta, para quem lê o PDF (o teste): o código da Symbol → o sinal. */
export const SINAL_DO_CODIGO: Record<number, string> = Object.fromEntries(
  Object.entries(SINAIS).filter(([s]) => s !== '∆' && s !== 'Ω').map(([s, n]) => [n, s]),
);
