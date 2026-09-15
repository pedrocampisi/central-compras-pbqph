/**
 * O destinatário da nota fiscal de uma OC é o da OBRA — não uma lista solta.
 *
 * Até 14/09/2026 a OC tinha um campo "Emitente" com cinco nomes cadastrados à
 * mão em agosto, todos com o endereço do escritório, e nenhum deles era o
 * destinatário da nota de obra alguma. O cadastro de obras (Central) já sabe
 * quem recebe a nota de cada obra; é de lá que a OC passa a ler (CTO-D390,
 * palavra do Pedro: "faça assim").
 *
 * Lógica pura: não conhece a tela nem o banco.
 */

import type { Destinatario, Obra, OrdemCompra } from './types';

export const MENSAGEM_OBRA_SEM_DESTINATARIO =
  'Esta obra não tem destinatário da nota cadastrado. Cadastre no Central.';

/** O destinatário que a obra aponta hoje, ou nada — e nada quer dizer "não emite". */
export function destinatarioDaObra(obra: Obra | undefined): Destinatario | undefined {
  return obra?.destinatario;
}

/** Só dígitos — o grão que o banco aceita (11 pf / 14 pj). */
export function soDigitos(s: string | undefined): string {
  return (s ?? '').replace(/\D/g, '');
}

/** 00.000.000/0000-00 ou 000.000.000-00; o que não couber no grão volta como veio. */
export function formatarDocumento(documento: string, tipo: Destinatario['tipo']): string {
  const d = soDigitos(documento);
  if (tipo === 'pj' && d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  if (tipo === 'pf' && d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  return documento;
}

/** "CNPJ 00.000.000/0000-00" ou "CPF 000.000.000-00". */
export function documentoRotulado(d: Destinatario): string {
  return `${d.tipo === 'pj' ? 'CNPJ' : 'CPF'} ${formatarDocumento(d.documento, d.tipo)}`;
}

/** A linha que a tela mostra embaixo da obra: "Faturar para: Nome · CNPJ …". */
export function rotuloFaturarPara(d: Destinatario | undefined): string {
  if (!d) return '';
  return `Faturar para: ${d.nome} · ${documentoRotulado(d)}`;
}

/**
 * O que a OC leva para o banco na emissão: a fotografia, nas três colunas de
 * `compras.ordens_compra`, ou nada — as duas trancas do banco exigem os três
 * juntos ou nenhum, e o documento só em dígitos.
 */
export function fotografiaDoDestinatario(
  d: Destinatario | undefined,
): { destinatario_nome: string; destinatario_documento: string; destinatario_tipo: 'pf' | 'pj' } | undefined {
  if (!d) return undefined;
  const documento = soDigitos(d.documento);
  const nome = d.nome.trim();
  if (!nome || !documento) return undefined;
  return { destinatario_nome: nome, destinatario_documento: documento, destinatario_tipo: d.tipo };
}

/**
 * Quem vai no PDF como "Faturar para": a fotografia gravada na OC, se ela já
 * foi emitida com uma; senão, o que a obra aponta hoje (rascunho, prévia).
 *
 * A fotografia guarda nome, documento e tipo — não endereço. Se a obra ainda
 * aponta para a mesma pessoa (mesmo documento), o endereço do cadastro de hoje
 * vai junto; se a obra mudou de destinatário, sai só o que foi fotografado.
 */
export function destinatarioParaImpressao(
  oc: Pick<OrdemCompra, 'destinatario' | 'obra_id'>,
  obras: Obra[],
): Destinatario | undefined {
  const daObra = destinatarioDaObra(obras.find((o) => o.id === oc.obra_id));
  const foto = oc.destinatario;
  if (!foto) return daObra;
  const mesmaPessoa = daObra && soDigitos(daObra.documento) === soDigitos(foto.documento);
  return mesmaPessoa ? { ...foto, endereco: daObra.endereco } : foto;
}
