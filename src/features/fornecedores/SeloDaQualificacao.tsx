/**
 * O selo da qualificação (CTO-D604 §3.4, D613 §2): ao lado da empresa na
 * Nova OC e na coluna da lista de fornecedores. A cor diz a situação — verde
 * só onde verde significa alguma coisa, como no selo do status da OC.
 *
 * `selo === null` é "não se sabe" (as qualificações não carregaram): o selo
 * diz isso, em vez de fingir "sem qualificação".
 */

import { textoDoSelo, type Selo } from '../../domain/qualificacao';
import styles from './SeloDaQualificacao.module.css';

export function SeloDaQualificacao({ selo, rotulo }: { selo: Selo | null; rotulo?: string }) {
  const texto = selo ? textoDoSelo(selo) : 'Qualificação não carregou';
  return (
    <span className={styles.selo} data-situacao={selo?.situacao ?? 'nao_carregou'}>
      {rotulo ? `${rotulo}: ${texto}` : texto}
    </span>
  );
}
