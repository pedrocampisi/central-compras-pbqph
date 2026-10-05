/**
 * O "?" da sigla ECR (CTO-D728 §1): vai na primeira vez que a sigla aparece
 * numa tela, quando ela não vem por extenso ali mesmo. A linha onde ele mora
 * precisa quebrar, como a de qualquer "?" (ver `Ajuda`).
 */

import { O_QUE_E_ECR } from '../../domain/ecr';
import { Ajuda } from './Ajuda';

export function AjudaDaEcr() {
  return <Ajuda sobre="O que é ECR">{O_QUE_E_ECR}</Ajuda>;
}
