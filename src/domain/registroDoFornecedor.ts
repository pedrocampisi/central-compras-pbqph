/**
 * O registro do fornecedor no recebimento (CTO-D809 §3, D811 §3, D812 §2,
 * D840): o papel que a ECR manda o fornecedor enviar — certificado, laudo,
 * FISPQ, licença, GCA.
 *
 * - **O papel entra pelo escritório** (D840 §2): ninguém pergunta o papel na
 *   entrega. O carimbo só oferece "Anexar papel do fornecedor", para o papel que
 *   viaja com o caminhão; sem papel em mãos, o encarregado não faz nada, e o
 *   "Pronto" grava. A entrega sem papel cai na lista do escritório.
 * - **Quem decide se oferece é o banco** (as seis regras da D811, na
 *   `material_a_chegar`): a tela só oferece quando ele diz `pede`, e nunca
 *   reescreve a regra.
 * - **O que se pede vem com as palavras da ECR**: as linhas do "REGISTRO DO
 *   FORNECEDOR" da revisão que valia na Data da OC, como estão. A moldura em
 *   volta fala como o canteiro fala, sem "ECR".
 * - **O alcance do papel** é o que a leitura disse e o encarregado conferiu
 *   (D812 §2, ajuste 3): deste lote, vale até uma data, ou vale para o produto.
 *   Sem leitura, ou na dúvida, é deste lote. Na ECR com a marca "a cada
 *   entrega" (01, 02, 17), é deste lote, sem escolha: ali, só o papel do lote
 *   que nomeia a entrega a cobre (Banco-D840, escolha 1).
 *
 * Lógica pura, sem tela.
 */

import { formatDate } from './format';
import type { EcrItem } from './types';

/** Os alcances, na ordem dos botões. */
export const ALCANCES = ['lote', 'vale_ate', 'produto'] as const;
export type Alcance = (typeof ALCANCES)[number];

/**
 * Uma linha do "REGISTRO DO FORNECEDOR", como está na ECR (CTO-D813 §3): a
 * numerada é da lista, a sem número é nota (a da CDL, na 02).
 */
export type LinhaDoRegistro = EcrItem;

/** O que o banco diz de uma ECR da entrega (`material_a_chegar.registros`). */
export interface RegistroPedido {
  ecrId: number;
  /** O banco diz que a ECR pede o papel? */
  pede: boolean;
  /** A marca "a cada entrega" (ECRs 01, 02, 17): o papel só vale para o lote que ele nomeia. */
  aCadaEntrega: boolean;
  /** A regra que decidiu, na frase do banco. */
  porque: string;
  /** A revisão da ECR que valia na Data da OC. */
  revisao: string;
  /** O que a ECR pede, linha por linha, como está; vazio quando a revisão não tem o texto no sistema. */
  linhas: LinhaDoRegistro[];
  /** As posições, na OC, dos itens desta ECR. */
  posicoes: number[];
}

/** Só o papel que veio vai ao banco (Banco-D840): o que não veio, a lista do escritório cuida. */
export type RespostaDoRegistro = 'veio';

/** O que a leitura do papel disse; `null` quando ela não leu. */
export interface LeituraDoRegistro {
  alcance: Alcance | null;
  /** AAAA-MM-DD, só no `vale_ate`. */
  validoAte: string;
  confira: string;
  /**
   * A resposta da leitura como veio. Ela sobe com o papel, no `extracao` da
   * arquivar-documento, e o banco a guarda uma vez só, no documento (Banco-D812 §4).
   */
  bruta?: Record<string, unknown>;
}

/** O papel que o encarregado anexou numa ECR (a foto mora fora, no celular); `resposta` nula: não anexou. */
export interface RegistroRespondido {
  resposta: RespostaDoRegistro | null;
  /** O alcance que ele conferiu; enquanto não confere, o da leitura. */
  alcance: Alcance;
  validoAte: string;
  /** Ele tocou em "Está certo", ou escolheu outro. */
  conferido: boolean;
  /** A leitura, como veio: sobe com o papel (`extracao`). */
  lido: LeituraDoRegistro | null;
}

export const SEM_REGISTRO: RegistroRespondido = {
  resposta: null, alcance: 'lote', validoAte: '', conferido: false, lido: null,
};

const DIA = /^\d{4}-\d{2}-\d{2}$/;

/** As ECRs em que o banco diz que pede o papel, na ordem em que vieram. */
export function registrosPedidos(registros: readonly RegistroPedido[] | undefined): RegistroPedido[] {
  return (registros ?? []).filter((r) => r.pede);
}

/**
 * A leitura vira o alcance da tela. Na dúvida — sem leitura, sem alcance, ou
 * "vale até" sem data —, deste lote (D809 §3): é o lado seguro, porque a
 * próxima entrega pergunta de novo.
 */
export function alcanceDaLeitura(l: LeituraDoRegistro | null): { alcance: Alcance; validoAte: string } {
  if (!l?.alcance || !ALCANCES.includes(l.alcance)) return { alcance: 'lote', validoAte: '' };
  if (l.alcance === 'vale_ate') return DIA.test(l.validoAte) ? { alcance: 'vale_ate', validoAte: l.validoAte } : { alcance: 'lote', validoAte: '' };
  return { alcance: l.alcance, validoAte: '' };
}

/** O alcance, como a tela fala. */
export function textoDoAlcance(alcance: Alcance, validoAte: string): string {
  if (alcance === 'vale_ate') return DIA.test(validoAte) ? `Vale até ${formatDate(validoAte)}` : 'Vale até uma data';
  if (alcance === 'produto') return 'Vale para o produto, sem prazo';
  return 'Deste lote';
}

/** O que a leitura disse, para ele conferir. */
export function fraseDaLeitura(l: LeituraDoRegistro | null): string {
  const { alcance, validoAte } = alcanceDaLeitura(l);
  if (!l?.alcance) return 'Não consegui ler o papel. Ele conta como deste lote.';
  return `O papel diz: ${textoDoAlcance(alcance, validoAte).toLowerCase()}.`;
}

/** "Cimento CP-II", "Tubo PVC e mais 2": os itens desta ECR, pelo nome do pedido. */
export function materialDoRegistro(
  r: Pick<RegistroPedido, 'posicoes'>,
  itens: readonly { posicao?: number; descricao: string }[],
): string {
  const nomes = r.posicoes
    .map((p) => itens.find((i) => i.posicao === p)?.descricao.trim())
    .filter((n): n is string => !!n);
  if (nomes.length === 0) return 'este material';
  return nomes.length === 1 ? nomes[0]! : `${nomes[0]} e mais ${nomes.length - 1}`;
}

/** O título de cada ECR, sem a palavra do escritório. */
export function tituloDoRegistro(material: string): string {
  return `Papel do fornecedor para ${material}`;
}

/** Na ECR com a marca, o papel vale para esta entrega, sem escolha. */
export const VALE_PARA_ESTA_ENTREGA = 'Este papel vale para esta entrega.';

/** O alcance que vai ao banco: na ECR com a marca, deste lote, seja o que for que a leitura disse. */
export function alcanceDoEnvio(
  p: Pick<RegistroPedido, 'aCadaEntrega'>,
  r: Pick<RegistroRespondido, 'alcance' | 'validoAte'>,
): { alcance: Alcance; validoAte: string } {
  return p.aCadaEntrega ? { alcance: 'lote', validoAte: '' } : { alcance: r.alcance, validoAte: r.validoAte };
}

/**
 * O que falta no papel anexado para o "Pronto"; '' quando pode. A ECR sem papel
 * anexado não segura a entrega: ela cai na lista do escritório (D840 §2). `temFoto`
 * diz, por ECR, se a foto do papel está no celular.
 */
export function problemaDoRegistro(
  pedidos: readonly RegistroPedido[],
  respostas: Readonly<Record<number, RegistroRespondido>>,
  temFoto: (ecrId: number) => boolean,
  material: (r: RegistroPedido) => string,
): string {
  for (const p of pedidos) {
    const r = respostas[p.ecrId] ?? SEM_REGISTRO;
    if (r.resposta !== 'veio') continue;
    const m = material(p);
    if (!temFoto(p.ecrId)) return `Tire a foto do papel de ${m}, ou toque em "Tirar".`;
    if (p.aCadaEntrega) continue;
    if (!r.conferido) return `Confira o que o papel de ${m} diz: toque em "Está certo", ou escolha o certo.`;
    if (r.alcance === 'vale_ate' && !DIA.test(r.validoAte)) return `Escreva até quando vale o papel de ${m}.`;
  }
  return '';
}

/** Um registro no envio ao banco (`registrar_entrega`, `p.registros`). */
export interface RegistroNoEnvio {
  ecrId: number;
  resposta: RespostaDoRegistro;
  alcance?: Alcance;
  validoAte?: string;
  lido?: LeituraDoRegistro | null;
}

/** Os papéis anexados nas ECRs que o banco pede, prontos para o envio; as outras não vão. */
export function registrosDoEnvio(
  pedidos: readonly RegistroPedido[],
  respostas: Readonly<Record<number, RegistroRespondido>>,
): RegistroNoEnvio[] {
  return pedidos.flatMap((p): RegistroNoEnvio[] => {
    const r = respostas[p.ecrId];
    if (r?.resposta !== 'veio') return [];
    const { alcance, validoAte } = alcanceDoEnvio(p, r);
    return [{
      ecrId: p.ecrId,
      resposta: 'veio',
      alcance,
      ...(alcance === 'vale_ate' ? { validoAte } : {}),
      lido: r.lido,
    }];
  });
}
