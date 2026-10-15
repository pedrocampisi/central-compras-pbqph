/**
 * O que o PDF da OC diz sobre a qualidade (CTO-D805 §1): a política da
 * qualidade e, para cada ECR dos itens, o que o fornecedor deve enviar.
 *
 * Lógica pura, sem jsPDF: o desenho mora em `services/pdf/generateOcPdf.ts`,
 * e o teste lê daqui o que vai ao papel.
 *
 * - **A política** é a frase do FO 5.2, palavra por palavra, guardada no
 *   código: a configuração não a tira do PDF. Sem revisão e sem data, para o
 *   PDF não envelhecer quando o documento ganhar revisão.
 * - **O registro do fornecedor** é a seção "REGISTRO DO FORNECEDOR" da ECR,
 *   como está: o PDF não resume, não conserta e não esconde linha (D586/D588).
 * - **A revisão que vale é a da Data da OC**: a última revisão da ECR com data
 *   até a Data. A OC de outubro não mostra o texto de dezembro. O banco guarda
 *   o texto inteiro de cada revisão (`compras.ecr_revisoes.secoes`); o texto
 *   antigo só é pedido quando a revisão vigente é mais nova que a Data.
 */

import { TITULOS_DA_ECR } from './ecr';
import { formatDate } from './format';
import type { Ecr, EcrItem, EcrSecao, Item } from './types';

/** O título do quadro da política: a referência ao documento, sem revisão e sem data. */
export const TITULO_DA_POLITICA = 'POLÍTICA DA QUALIDADE (FO 5.2)';

/**
 * A frase da política, como está no FO 5.2 - Política de Qualidade (pasta
 * "05 - PS e MQ" do SGQ), lida do documento em 15/10/2026. Só a frase: as
 * sete diretrizes ficam no documento.
 */
export const POLITICA_DA_QUALIDADE =
  'Buscar a satisfação do cliente com excelência técnica, promover a melhoria contínua de nossos processos, ' +
  'cumprir os requisitos legais e aplicáveis, e atuar com sustentabilidade em tudo que fazemos.';

/** O título da seção da ECR que diz o que o fornecedor envia. */
export const REGISTRO_DO_FORNECEDOR = TITULOS_DA_ECR[2];

/** O título do quadro das ECRs no PDF. */
export const TITULO_DO_REGISTRO = 'REGISTRO DO FORNECEDOR, CONFORME A ECR DE CADA ITEM';

/** A OC sem ECR em item nenhum: o quadro diz, e não some. */
export const OC_SEM_ECR = 'Nenhum item desta OC tem ECR: esta OC não pede registro do fornecedor por ECR.';

/** O texto de uma revisão de ECR, como o banco o guarda. */
export interface TextoDaRevisao {
  ecr_id: number;
  revisao: string;
  /** AAAA-MM-DD. */
  emitida_em: string;
  /** `null` onde o banco não conhece o texto daquela revisão. */
  secoes: EcrSecao[] | null;
}

/** O que o PDF escreve para uma ECR. */
export interface RegistroDaEcr {
  ecr_id: number;
  /** "ECR 08 - Nome · Rev. 00 · itens 1, 3" */
  titulo: string;
  /** As linhas da seção, como estão; `null` quando o texto falta. */
  itens: EcrItem[] | null;
  /** Por que o texto falta, numa frase; vazio quando há texto. */
  falta: string;
}

/** As ECRs dos itens, na ordem da primeira aparição. */
export function ecrsNaOrdemDosItens(itens: readonly Pick<Item, 'ecr_id'>[]): number[] {
  const ids: number[] = [];
  for (const it of itens) if (it.ecr_id != null && !ids.includes(it.ecr_id)) ids.push(it.ecr_id);
  return ids;
}

/**
 * A ECR precisa do texto antigo para esta Data? Só quando a revisão vigente é
 * mais nova que a Data da OC.
 */
export function precisaDaRevisaoAntiga(ecr: Pick<Ecr, 'emitida_em'> | undefined, dataDaOc: string): boolean {
  return !!ecr?.emitida_em && !!dataDaOc && ecr.emitida_em > dataDaOc;
}

/** As ECRs desta OC que pedem o texto antigo ao banco. */
export function ecrsQuePedemRevisaoAntiga(
  oc: { data: string; itens: readonly Pick<Item, 'ecr_id'>[] },
  ecrs: readonly Ecr[],
): number[] {
  return ecrsNaOrdemDosItens(oc.itens).filter((id) =>
    precisaDaRevisaoAntiga(
      ecrs.find((e) => e.id === id),
      oc.data,
    ),
  );
}

/** A última revisão com data até a Data da OC; `undefined` se a ECR ainda não existia. */
export function revisaoNaData(revisoes: readonly TextoDaRevisao[], dataDaOc: string): TextoDaRevisao | undefined {
  return [...revisoes]
    .filter((r) => r.emitida_em <= dataDaOc)
    .sort((a, b) => a.emitida_em.localeCompare(b.emitida_em) || a.revisao.localeCompare(b.revisao))
    .pop();
}

function itensDoRegistro(secoes: readonly EcrSecao[]): EcrItem[] | null {
  return secoes.find((s) => s.titulo === REGISTRO_DO_FORNECEDOR)?.itens ?? null;
}

/**
 * O registro do fornecedor de cada ECR da OC, na ordem da primeira aparição,
 * no texto da revisão que valia na Data da OC.
 *
 * `antigas` são os textos das revisões que o banco mandou para as ECRs de
 * `ecrsQuePedemRevisaoAntiga`; as outras usam o texto vigente que a tela já
 * tem. Quando o texto falta, a frase diz por quê: o PDF nunca põe o texto de
 * outra revisão no lugar.
 */
export function registrosDaOc(
  oc: { data: string; itens: readonly Pick<Item, 'ecr_id'>[] },
  ecrs: readonly Ecr[],
  antigas: readonly TextoDaRevisao[] = [],
): RegistroDaEcr[] {
  return ecrsNaOrdemDosItens(oc.itens).map((id): RegistroDaEcr => {
    const posicoes = oc.itens.flatMap((it, i) => (it.ecr_id === id ? [i + 1] : []));
    const itensDaOc = `${posicoes.length === 1 ? 'item' : 'itens'} ${posicoes.join(', ')}`;
    const ecr = ecrs.find((e) => e.id === id);
    if (!ecr) {
      return { ecr_id: id, titulo: `ECR ${id} · ${itensDaOc}`, itens: null, falta: 'Esta ECR não está no catálogo.' };
    }
    const nome = `${ecr.codigo} - ${ecr.nome}`;
    const comRevisao = (rev: string | null) => [nome, rev ? `Rev. ${rev}` : '', itensDaOc].filter(Boolean).join(' · ');

    if (!precisaDaRevisaoAntiga(ecr, oc.data)) {
      const itens = ecr.secoes ? itensDoRegistro(ecr.secoes) : null;
      return {
        ecr_id: id,
        titulo: comRevisao(ecr.revisao),
        itens,
        falta: !ecr.secoes
          ? 'O texto desta ECR não foi carregado.'
          : itens
            ? ''
            : `Esta ECR não tem a seção ${REGISTRO_DO_FORNECEDOR}.`,
      };
    }

    const naData = revisaoNaData(
      antigas.filter((r) => r.ecr_id === id),
      oc.data,
    );
    const dia = formatDate(oc.data);
    if (!naData) {
      return { ecr_id: id, titulo: comRevisao(null), itens: null, falta: `Esta ECR não tinha revisão em vigor em ${dia}.` };
    }
    const itens = naData.secoes ? itensDoRegistro(naData.secoes) : null;
    return {
      ecr_id: id,
      titulo: comRevisao(naData.revisao),
      itens,
      falta: !naData.secoes
        ? `O texto da Rev. ${naData.revisao}, que valia em ${dia}, não está no sistema.`
        : itens
          ? ''
          : `A Rev. ${naData.revisao} desta ECR não tem a seção ${REGISTRO_DO_FORNECEDOR}.`,
    };
  });
}
