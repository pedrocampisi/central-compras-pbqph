/**
 * A conta decimal do banco, para a tela fazer a MESMA conta que a
 * `compras.oc_totais` (perícia de 26/10, achado 2; CTO-D960).
 *
 * O banco guarda cada valor da linha numa coluna `numeric(16,4)`: arredonda às
 * quatro casas, com o empate para longe do zero, ANTES de somar. Em número do
 * JavaScript isso não se faz: 285,015 vira 285,01499999… e o centavo cai. Aqui
 * tudo é inteiro (`bigint`) com a escala ao lado, como o `numeric` do Postgres:
 * a multiplicação é exata, e a divisão arredonda na escala que o Postgres
 * escolhe (`select_div_scale`). Lógica pura, sem React e sem banco.
 */

/** Um `numeric`: o valor inteiro `v` vale `v / 10^escala`. */
export interface Numeric {
  v: bigint;
  escala: number;
}

const DEZ = 10n;
const pot = (n: number): bigint => DEZ ** BigInt(n);
const abs = (v: bigint): bigint => (v < 0n ? -v : v);

/** Arredonda para `escala` casas, com o empate para longe do zero (o `round_var` do Postgres). */
export function arredondar(n: Numeric, escala: number): Numeric {
  if (escala >= n.escala) return { v: n.v * pot(escala - n.escala), escala };
  const d = pot(n.escala - escala);
  const q = abs(n.v) / d;
  const r = abs(n.v) % d;
  const m = r * 2n >= d ? q + 1n : q;
  return { v: n.v < 0n ? -m : m, escala };
}

/**
 * O número como o banco o recebe: a tela manda JSON, e o JSON escreve o número
 * pela forma decimal mais curta (`String(n)`), às vezes com expoente. O banco lê
 * esse texto exato.
 */
export function deNumero(n: number): Numeric {
  if (!Number.isFinite(n) || n === 0) return { v: 0n, escala: 0 };
  const [mantissa, exp = '0'] = String(n).toLowerCase().split('e');
  const negativo = mantissa!.startsWith('-');
  const [int, frac = ''] = mantissa!.replace('-', '').split('.');
  let v = BigInt(int! + frac);
  let escala = frac.length - Number(exp);
  if (escala < 0) {
    v *= pot(-escala);
    escala = 0;
  }
  return { v: negativo ? -v : v, escala };
}

/** A coluna `numeric(p, escala)`: o valor que chega é arredondado na gravação. */
export function naColuna(n: number, escala: number): Numeric {
  return arredondar(deNumero(n), escala);
}

export const inteiro = (n: number): Numeric => ({ v: BigInt(n), escala: 0 });

export function mais(a: Numeric, b: Numeric): Numeric {
  const e = Math.max(a.escala, b.escala);
  return { v: arredondar(a, e).v + arredondar(b, e).v, escala: e };
}

export function menos(a: Numeric, b: Numeric): Numeric {
  return mais(a, { v: -b.v, escala: b.escala });
}

export function vezes(a: Numeric, b: Numeric): Numeric {
  return { v: a.v * b.v, escala: a.escala + b.escala };
}

/** O peso e o primeiro dígito na base 10000, como o Postgres guarda o `numeric`. */
function pesoEPrimeiro(n: Numeric): [number, bigint] {
  let x = abs(n.v);
  if (x === 0n) return [0, 0n];
  // Alinha a escala a um múltiplo de 4: os grupos começam na vírgula.
  const resto = ((n.escala % 4) + 4) % 4;
  let escala = n.escala;
  if (resto !== 0) {
    x *= pot(4 - resto);
    escala += 4 - resto;
  }
  const grupos: bigint[] = [];
  while (x > 0n) {
    grupos.unshift(x % 10000n);
    x /= 10000n;
  }
  const peso = grupos.length - 1 - escala / 4;
  const i = grupos.findIndex((g) => g !== 0n);
  return [peso - i, grupos[i]!];
}

/** A escala do resultado da divisão (`select_div_scale` do Postgres). */
function escalaDaDivisao(a: Numeric, b: Numeric): number {
  const [peso1, primeiro1] = pesoEPrimeiro(a);
  const [peso2, primeiro2] = pesoEPrimeiro(b);
  let qpeso = peso1 - peso2;
  if (primeiro1 <= primeiro2) qpeso--;
  const escala = Math.max(16 - qpeso * 4, a.escala, b.escala, 0);
  return Math.min(escala, 1000);
}

/** A divisão do `numeric`: na escala do Postgres, arredondada para longe do zero. */
export function dividido(a: Numeric, b: Numeric): Numeric {
  if (b.v === 0n) throw new Error('divisão por zero');
  const escala = escalaDaDivisao(a, b);
  // a/b com `escala` casas: (a.v / 10^a.escala) / (b.v / 10^b.escala) * 10^escala
  let num = a.v * pot(Math.max(0, escala + b.escala - a.escala));
  let den = b.v * pot(Math.max(0, a.escala - escala - b.escala));
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const q = abs(num) / den;
  const r = abs(num) % den;
  const m = r * 2n >= den ? q + 1n : q;
  return { v: num < 0n ? -m : m, escala };
}

/** O valor em número do JavaScript, pelo texto decimal exato. */
export function emNumero(n: Numeric): number {
  const s = abs(n.v).toString().padStart(n.escala + 1, '0');
  const texto = n.escala > 0 ? `${s.slice(0, -n.escala)}.${s.slice(-n.escala)}` : s;
  return Number(n.v < 0n ? `-${texto}` : texto);
}

/**
 * Os centavos de um valor da conta, como o banco e a tela os mostram: o `round`
 * do Postgres e o `formatBrl` desempatam para longe do zero. `Math.round(v * 100)`
 * não serve: 285,015 × 100 dá 28501,4999…
 */
export function emCentavos(v: number): number {
  return Number(arredondar(deNumero(v), 2).v);
}
