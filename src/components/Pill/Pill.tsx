import type { StatusOc } from '../../domain/constants';
import { STATUS_LABEL } from '../../domain/constants';
import styles from './Pill.module.css';

interface PillProps {
  status: StatusOc;
}

export function Pill({ status }: PillProps) {
  return (
    <span className={[styles.pill, styles[status]].join(' ')}>
      {STATUS_LABEL[status]}
    </span>
  );
}
