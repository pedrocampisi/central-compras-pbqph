/**
 * O caminho do "?" para o procedimento (CTO-D730 §3.3): "ver no PS.02, item 2"
 * abre a página do procedimento no lugar do item.
 *
 * Quem chama decide se pode sair dali: `antesDeIr` devolve `false` para ficar
 * (a caixa de qualificar pergunta antes de perder o que foi marcado).
 */

import { caminhoParaOItem } from '../../domain/procedimento';
import { useUiStore } from '../../stores/useUiStore';
import styles from './Ajuda.module.css';

interface Props {
  item: { numero: number; ancora: string };
  antesDeIr?: () => boolean | Promise<boolean>;
}

export function CaminhoParaOItem({ item, antesDeIr }: Props) {
  const abrir = useUiStore((s) => s.abrirProcedimento);
  async function ir() {
    if (antesDeIr && !(await antesDeIr())) return;
    abrir(item.ancora);
  }
  return (
    <button type="button" className={styles.caminho} onClick={() => void ir()}>
      {caminhoParaOItem(item.numero)}
    </button>
  );
}
