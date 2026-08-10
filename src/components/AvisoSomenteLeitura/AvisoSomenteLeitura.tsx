/**
 * Aviso de tela somente-leitura.
 *
 * Regra desta versão: onde a camada de dados ainda não grava no banco, a
 * interface NÃO pode fingir que grava — aceitar a edição e perdê-la no reload
 * é pior do que não deixar editar. Este aviso, junto com os campos
 * desabilitados, é o jeito da tela contar a verdade.
 *
 * Não confundir com falta de permissão (podeEditar/podeEmitirOc): aqui a
 * limitação é da VERSÃO, igual para todo mundo.
 */

import styles from './AvisoSomenteLeitura.module.css';

export function AvisoSomenteLeitura({ oQue }: { oQue?: string }) {
  return (
    <p className={styles.aviso} role="note">
      <span aria-hidden="true">🔒</span>{' '}
      Somente leitura nesta versão — {oQue ?? 'este cadastro'} ainda não é
      gravado no banco. A edição chega numa próxima etapa.
    </p>
  );
}
