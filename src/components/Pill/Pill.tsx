import type { StatusOc } from '../../domain/constants';
import { STATUS_LABEL } from '../../domain/constants';

/**
 * O status da OC na peça Selo do pacote (pecas\Selo), sempre com a palavra.
 * Rascunho é neutro (não pede nada); emitida está andando, no azul de
 * informação (era o azul da marca), e não no ocre de "espera alguém": a lista
 * inteira de emitidas em ocre gastaria a cor que avisa; entregue é pronto;
 * cancelada é anulação.
 */
const SELO: Record<StatusOc, string> = {
  rascunho: 'cp-selo',
  emitida: 'cp-selo cp-selo--info',
  entregue: 'cp-selo cp-selo--pronto',
  cancelada: 'cp-selo cp-selo--erro',
};

interface PillProps {
  status: StatusOc;
}

export function Pill({ status }: PillProps) {
  return <span className={SELO[status]}>{STATUS_LABEL[status]}</span>;
}
