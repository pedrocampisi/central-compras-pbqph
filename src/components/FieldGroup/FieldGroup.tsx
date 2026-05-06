import type { ReactNode } from 'react';
import styles from './FieldGroup.module.css';

interface FieldGroupProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function FieldGroup({ title, children, className }: FieldGroupProps) {
  return (
    <div className={[styles.group, className].filter(Boolean).join(' ')}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.grid}>{children}</div>
    </div>
  );
}
