/**
 * O registro do fornecedor no recebimento (CTO-D809 §3, D811 §3, D812 §2): o
 * papel que a ECR manda o fornecedor enviar — certificado, laudo, FISPQ, licença,
 * GCA —, perguntado no carimbo do encarregado.
 *
 * - **Quem decide se pergunta é o banco** (as seis regras da D811, na
 *   `material_a_chegar`): a tela só pergunta quando ele diz `pede`, e nunca
 *   reescreve a regra.
 * - **O que se pede vem com as palavras da ECR**: as linhas do "REGISTRO DO
 *   FORNECEDOR" da revisão que valia na Data da OC, como estão. A moldura em
 *   volta fala como o canteiro fala, sem "ECR".
 * - **Três respostas:** veio (com a foto), não veio, e não se aplica a esta
 *   entrega (com uma frase: "é compensado").
 * - **O alcance do papel** é o que a leitura disse e o encarregado conferiu
 *   (D812 §2, ajuste 3): deste lote, vale até uma data, ou vale para o produto.
 *   Sem leitura, ou na dúvida, é deste lote.
 *
 * Lógica pura, sem tela.
 */

import { formatDate } from './format';

/**
 * Os alcances, na ordem dos botões. ⚠️ Com a outra opção do Pedro (o item 24),
 * sai o `produto`, e o papel sem prazo é deste lote.
 */
export const ALCANCES = ['lote', 'vale_ate', 'produto'] as const;
export type Alcance = (typeof ALCANCES)[number];

/** Uma linha do "REGISTRO DO FORNECEDOR", como está na ECR. */
export interface LinhaDoRegistro {
  texto: string;
  numerado: boolean;
}

/** O que o banco diz de uma ECR da entrega (`material_a_chegar.registros`). */
export interface RegistroPedido {
  ecrId: number;
  /** O banco manda perguntar? */
  pede: boolean;
  /** A regra que decidiu, na frase do banco. */
  porque: string;
  /** A revisão da ECR que valia na Data da OC. */
  revisao: string;
  /** O que a ECR pede, linha por linha, como está. */
  linhas: LinhaDoRegistro[];
  /** As posições, na OC, dos itens desta ECR. */
  posicoes: number[];
}

export type RespostaDoRegistro = 'veio' | 'nao_veio' | 'nao_se_aplica';

/** O que a leitura do papel disse; `null` quando ela não leu. */
export interface LeituraDoRegistro {
  alcance: Alcance | null;
  /** AAAA-MM-DD, só no `vale_ate`. */
  validoAte: string;
  confira: string;
}

/** O que o encarregado respondeu para uma ECR (a foto mora fora, no celular). */
export interface RegistroRespondido {
  resposta: RespostaDoRegistro | null;
  /** A frase do "não se aplica". */
  motivo: string;
  /** O alcance que ele conferiu; enquanto não confere, o da leitura. */
  alcance: Alcance;
  validoAte: string;
  /** Ele tocou em "Está certo", ou escolheu outro. */
  conferido: boolean;
  /** A leitura, como veio, para o banco guardar (`lido_pela_ia`). */
  lido: LeituraDoRegistro | null;
}

export const SEM_REGISTRO: RegistroRespondido = {
  resposta: null, motivo: '', alcance: 'lote', validoAte: '', conferido: false, lido: null,
};

const DIA = /^\d{4}-\d{2}-\d{2}$/;

/** As ECRs em que o banco manda perguntar, na ordem em que vieram. */
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

/** A pergunta de cada ECR, sem a palavra do escritório. */
export function perguntaDoRegistro(material: string): string {
  return `Veio o papel do fornecedor para ${material}?`;
}

/**
 * O que falta no registro para o "Pronto"; '' quando pode. `temFoto` diz, por
 * ECR, se a foto do papel está no celular.
 */
export function problemaDoRegistro(
  pedidos: readonly RegistroPedido[],
  respostas: Readonly<Record<number, RegistroRespondido>>,
  temFoto: (ecrId: number) => boolean,
  material: (r: RegistroPedido) => string,
): string {
  for (const p of pedidos) {
    const r = respostas[p.ecrId] ?? SEM_REGISTRO;
    const m = material(p);
    if (r.resposta === null) return `Falta responder: ${perguntaDoRegistro(m)}`;
    if (r.resposta === 'nao_se_aplica' && !r.motivo.trim()) return `Diga por que o papel de ${m} não se aplica.`;
    if (r.resposta !== 'veio') continue;
    if (!temFoto(p.ecrId)) return `Tire a foto do papel de ${m}.`;
    if (!r.conferido) return `Confira o que o papel de ${m} diz: toque em "Está certo", ou escolha o certo.`;
    if (r.alcance === 'vale_ate' && !DIA.test(r.validoAte)) return `Escreva até quando vale o papel de ${m}.`;
  }
  return '';
}

/** Um registro no envio ao banco (`registrar_entrega`, `p.registros`). */
export interface RegistroNoEnvio {
  ecrId: number;
  resposta: RespostaDoRegistro;
  motivo?: string;
  alcance?: Alcance;
  validoAte?: string;
  lido?: LeituraDoRegistro | null;
}

/** As respostas das ECRs que o banco pediu, prontas para o envio; as outras não vão. */
export function registrosDoEnvio(
  pedidos: readonly RegistroPedido[],
  respostas: Readonly<Record<number, RegistroRespondido>>,
): RegistroNoEnvio[] {
  return pedidos.flatMap((p): RegistroNoEnvio[] => {
    const r = respostas[p.ecrId];
    if (!r?.resposta) return [];
    if (r.resposta === 'nao_veio') return [{ ecrId: p.ecrId, resposta: 'nao_veio' }];
    if (r.resposta === 'nao_se_aplica') return [{ ecrId: p.ecrId, resposta: 'nao_se_aplica', motivo: r.motivo.trim() }];
    return [{
      ecrId: p.ecrId,
      resposta: 'veio',
      alcance: r.alcance,
      ...(r.alcance === 'vale_ate' ? { validoAte: r.validoAte } : {}),
      lido: r.lido,
    }];
  });
}
