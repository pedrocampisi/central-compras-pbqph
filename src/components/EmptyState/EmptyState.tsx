import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface ActionConfig {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  /** Optional large icon/emoji displayed above the title. */
  icon?: string;
  title: string;
  /** Alias for title — some call sites use `description`. */
  description?: string;
  detail?: string;
  /** Either a ReactNode or a simple {label, onClick} config. */
  action?: ReactNode | ActionConfig;
}

function isActionConfig(a: unknown): a is ActionConfig {
  return typeof a === 'object' && a !== null && 'label' in a && 'onClick' in a;
}

export type { EmptyStateProps };

export function EmptyState({ icon, title, description, detail, action }: EmptyStateProps) {
  const subtitle = description ?? detail;

  const actionNode = isActionConfig(action) ? (
    <button className={styles.actionBtn} onClick={action.onClick}>
      {action.label}
    </button>
  ) : (
    action
  );

  return (
    <div className={styles.wrap}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <strong className={styles.title}>{title}</strong>
      {subtitle && <p className={styles.detail}>{subtitle}</p>}
      {actionNode && <div className={styles.action}>{actionNode}</div>}
    </div>
  );
}
