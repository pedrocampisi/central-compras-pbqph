import type { ReactNode } from 'react';
import styles from './FieldGroup.module.css';

interface FieldGroupProps {
  title?: string;
  /** Um "?" ao lado do título (CTO-D475); a resposta abre logo abaixo dele. */
  ajuda?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function FieldGroup({ title, ajuda, children, className }: FieldGroupProps) {
  return (
    <div className={[styles.group, className].filter(Boolean).join(' ')}>
      {title && ajuda ? (
        <div className={styles.cabeca}>
          <h3 className={styles.title}>{title}</h3>
          {ajuda}
        </div>
      ) : (
        title && <h3 className={styles.title}>{title}</h3>
      )}
      <div className={styles.grid}>{children}</div>
    </div>
  );
}
