/**
 * O texto que o vendedor escreve na nota fiscal (CTO-D655, 30/09/2026).
 *
 * A palavra do Pedro: "um dos principais objetivos [da OC] é o vendedor
 * colocar na nota fiscal o endereço da obra". A nota chega à
 * Central_Financeiro, e o motor dela acha a obra pelo CNO, pelo CEP, pelo nome
 * e pelo logradouro com número, nessa ordem. O endereço do destinatário da
 * nota não conta como o da obra, de propósito. Então o que precisa estar
 * escrito, num campo que o vendedor preenche (INFORMAÇÕES COMPLEMENTARES), é
 * exatamente isto: a obra, o endereço com o CEP, o CNO quando houver e o
 * número da OC, para o dia em que a nota se casar com a OC.
 *
 * Lógica pura: o PDF só desenha o que sai daqui.
 */

import type { Endereco, Obra } from './types';

/** "38400-000" a partir de "38400000"; o que não tiver 8 dígitos sai como veio. */
function cepFormatado(cep: string): string {
  const d = cep.replace(/\D/g, '');
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep.trim();
}

/** "Rua X, 100, sala 2": o logradouro com número e complemento. */
function logradouroComNumero(e: Partial<Endereco> | undefined): string {
  if (!e) return '';
  return [e.logradouro, e.numero, e.complemento].map((s) => (s ?? '').trim()).filter(Boolean).join(', ');
}

/**
 * O texto pronto para o campo INFORMAÇÕES COMPLEMENTARES. Cada parte vazia
 * some, com o rótulo dela: sem CNO no cadastro, a palavra "CNO" não aparece;
 * rascunho sem número não leva "OC nº".
 */
export function textoParaANotaFiscal(
  obra: Pick<Obra, 'nome' | 'cei' | 'endereco'> | undefined,
  numeroOc: string,
): string {
  const e = obra?.endereco;
  const cidadeUf = [e?.cidade?.trim(), e?.uf?.trim()].filter(Boolean).join('/');
  const partes = [
    obra?.nome?.trim() ? `OBRA: ${obra.nome.trim()}` : '',
    logradouroComNumero(e) ? `ENDEREÇO: ${logradouroComNumero(e)}` : '',
    e?.bairro?.trim() ?? '',
    cidadeUf,
    e?.cep?.trim() ? `CEP ${cepFormatado(e.cep)}` : '',
    obra?.cei?.trim() ? `CNO ${obra.cei.trim()}` : '',
    numeroOc.trim() ? `OC nº ${numeroOc.trim()}` : '',
  ];
  return partes.filter(Boolean).join(' - ');
}
