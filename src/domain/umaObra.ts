/**
 * "Mostrar só uma obra" (CTO-D599, palavra do Pedro): para a auditoria do
 * PBQP-H, este navegador mostra uma obra só, durante uma janela de tempo. É uma
 * máscara: o banco não muda, e os outros computadores continuam vendo tudo.
 *
 * As horas são sempre as de Brasília (America/Sao_Paulo), nunca as do fuso do
 * computador: um notebook em UTC ligaria a máscara três horas antes.
 *
 * Lógica pura: nada aqui sabe de tela, de banco ou do navegador.
 */

import type { Data } from './types';

export const FUSO_DA_MASCARA = 'America/Sao_Paulo';

export interface MascaraDeObra {
  obraId: string;
  /** Só para a tela de Configurações dizer qual obra está armada. */
  obraNome: string;
  /** O começo, em ISO UTC: a partir deste instante a máscara está ligada. */
  inicio: string;
  /** O fim, em ISO UTC, exclusivo: o primeiro instante em que ela já desligou. */
  fim: string;
  /** Ligada pelo "Ver agora (ensaio)". */
  ensaio: boolean;
}

/** A janela que a tela sugere: a auditoria (CTO-D599 §2.2). O Pedro pode mudar. */
export const JANELA_SUGERIDA = { deDia: '2026-11-16', deHora: '00:00', ateDia: '2026-11-17', ateHora: '23:59' } as const;

const UM_MINUTO = 60_000;

const partesEmBrasilia = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSO_DA_MASCARA,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function partes(instante: number): Record<string, string> {
  return Object.fromEntries(partesEmBrasilia.formatToParts(new Date(instante)).map((p) => [p.type, p.value]));
}

/** Quantos milissegundos o relógio de Brasília está à frente do UTC naquele instante (negativo). */
function deslocamento(instante: number): number {
  const p = partes(instante);
  const comoSeFosseUtc = Date.UTC(+p['year']!, +p['month']! - 1, +p['day']!, +p['hour']!, +p['minute']!, +p['second']!);
  return comoSeFosseUtc - Math.floor(instante / 1000) * 1000;
}

/** "2026-11-16" e "00:00", lidos no relógio de Brasília → o instante. */
export function instanteEmBrasilia(dia: string, hora: string): Date {
  const [a, m, d] = dia.split('-').map(Number);
  const [h, mi] = hora.split(':').map(Number);
  const ingenuo = Date.UTC(a!, m! - 1, d!, h!, mi!);
  // Campo apagado na tela: o instante inválido segue adiante, e quem arma diz o
  // que falta. O relógio de Brasília lançaria exceção com ele (perícia 28/09, A4).
  if (Number.isNaN(ingenuo)) return new Date(NaN);
  // Duas voltas: a segunda acerta o caso de o deslocamento mudar no meio.
  const primeira = ingenuo - deslocamento(ingenuo);
  return new Date(ingenuo - deslocamento(primeira));
}

/** O instante no relógio de Brasília: { dia: "2026-11-17", hora: "23:59" }. */
export function emBrasilia(instante: Date): { dia: string; hora: string } {
  const p = partes(instante.getTime());
  return { dia: `${p['year']}-${p['month']}-${p['day']}`, hora: `${p['hour']}:${p['minute']}` };
}

/** "17/11/2026 23:59", no relógio de Brasília. */
export function textoEmBrasilia(instante: Date): string {
  const { dia, hora } = emBrasilia(instante);
  const [a, m, d] = dia.split('-');
  return `${d}/${m}/${a} ${hora}`;
}

/**
 * A janela escolhida na tela. "Até 23:59" inclui o minuto inteiro: o fim
 * exclusivo é o minuto seguinte (às 23:59:59 ainda está ligada).
 */
export function janelaEscolhida(deDia: string, deHora: string, ateDia: string, ateHora: string): { inicio: Date; fim: Date } {
  return {
    inicio: instanteEmBrasilia(deDia, deHora),
    fim: new Date(instanteEmBrasilia(ateDia, ateHora).getTime() + UM_MINUTO),
  };
}

/** O último minuto ligado, para mostrar ("ligada até 17/11/2026 23:59"). */
export function ultimoMinuto(m: MascaraDeObra): Date {
  return new Date(Date.parse(m.fim) - UM_MINUTO);
}

export function ligadaAgora(m: MascaraDeObra | null, agora: Date): boolean {
  if (!m) return false;
  const t = agora.getTime();
  return Date.parse(m.inicio) <= t && t < Date.parse(m.fim);
}

/**
 * A próxima borda da janela depois de agora (o começo, ou o fim), em
 * milissegundos, ou `null` sem nada adiante. A tela marca a virada para esse
 * instante, e não para a próxima volta do relógio (perícia 28/09, A2).
 */
export function proximaVirada(m: MascaraDeObra | null, agora: Date): number | null {
  if (!m) return null;
  const t = agora.getTime();
  const bordas = [Date.parse(m.inicio), Date.parse(m.fim)].filter((b) => b > t);
  return bordas.length ? Math.min(...bordas) : null;
}

/**
 * Os dados já carregados, só com a obra: o que a tela mostra no instante em
 * que a máscara liga, antes de a busca filtrada voltar (perícia 28/09, A1). As
 * mesmas duas listas que a busca filtra; o resto não é por obra.
 */
export function soDaObra(data: Data, obraId: string): Data {
  return {
    ...data,
    obras: data.obras.filter((o) => o.id === obraId),
    ordens_compra: data.ordens_compra.filter((oc) => oc.obra_id === obraId),
  };
}

/** Passou do fim: a opção se desarma sozinha. */
export function vencida(m: MascaraDeObra, agora: Date): boolean {
  return agora.getTime() >= Date.parse(m.fim);
}

/** O ensaio: liga já e desliga sozinho às 23:59 de hoje, em Brasília. */
export function mascaraDeEnsaio(obraId: string, obraNome: string, agora: Date): MascaraDeObra {
  const { dia } = emBrasilia(agora);
  return {
    obraId,
    obraNome,
    inicio: agora.toISOString(),
    fim: new Date(instanteEmBrasilia(dia, '23:59').getTime() + UM_MINUTO).toISOString(),
    ensaio: true,
  };
}

/** O que impede de armar, ou `null`. */
export function problemaParaArmar(obraId: string, inicio: Date, fim: Date, agora: Date): string | null {
  if (!obraId) return 'Escolha a obra.';
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return 'Preencha as datas e as horas.';
  if (fim.getTime() <= inicio.getTime()) return 'O fim tem de vir depois do começo.';
  if (fim.getTime() <= agora.getTime()) return 'Essa janela já passou.';
  return null;
}

/** O que veio do navegador. Qualquer coisa fora da forma vira "nada armado". */
export function mascaraDoTexto(texto: string | null): MascaraDeObra | null {
  if (!texto) return null;
  try {
    const o = JSON.parse(texto) as Record<string, unknown>;
    const { obraId, obraNome, inicio, fim, ensaio } = o;
    if (typeof obraId !== 'string' || !obraId) return null;
    if (typeof inicio !== 'string' || typeof fim !== 'string') return null;
    if (Number.isNaN(Date.parse(inicio)) || Number.isNaN(Date.parse(fim))) return null;
    return { obraId, obraNome: typeof obraNome === 'string' ? obraNome : '', inicio, fim, ensaio: ensaio === true };
  } catch {
    return null;
  }
}
