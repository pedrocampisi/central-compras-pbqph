/**
 * A entrega prevista da OC que nasce agora (CTO-D728 §2, pedido do Pedro): o
 * dia seguinte ao da Data, e o engenheiro troca se precisar.
 *
 * - A Data já é o "hoje" de Brasília (`todayIso`). Depois das 21h o UTC já
 *   virou o dia, e o "amanhã" contado em UTC daria dois dias.
 * - Enquanto ninguém mexeu na entrega, ela acompanha a Data. Depois que o
 *   engenheiro mexeu, ela é dele.
 * - Rascunho salvo e OC que já existe ficam com o que têm: só a OC que nasce
 *   agora (a nova e a duplicada) ganha o dia seguinte.
 */

import { somaDias } from './qualificacao';

function diaValido(dia: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dia) && !Number.isNaN(Date.parse(`${dia}T00:00:00Z`));
}

/** O dia seguinte ao da Data; vazio se a Data não é um dia. */
export function entregaDaOcNova(data: string): string {
  return diaValido(data) ? somaDias(data, 1) : '';
}

/**
 * A entrega quando a Data muda: acompanha enquanto ainda é a que nasceu com a
 * OC; senão, fica. A Data apagada não apaga a entrega.
 */
export function entregaAoMudarAData(entrega: string, dataNova: string, acompanha: boolean): string {
  return acompanha && diaValido(dataNova) ? somaDias(dataNova, 1) : entrega;
}
