/**
 * Estado vazio do padrão Campisi: mascote de corpo inteiro, uma frase curta e
 * UMA ação.
 *
 * O mascote só aparece quando o vazio É a tela — lista sem resultado, aba
 * ainda sem cadastro. Dentro de um cartão que divide espaço com números
 * (gráficos do Dashboard), use `compacto`: o padrão proíbe o mascote ao lado
 * de dado, e um boneco no meio de três indicadores vira ruído.
 */

import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface ActionConfig {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  /** Alias for title — some call sites use `description`. */
  description?: string;
  detail?: string;
  /** Either a ReactNode or a simple {label, onClick} config. */
  action?: ReactNode | ActionConfig;
  /** Sem mascote, para vazio dentro de cartão que convive com dados. */
  compacto?: boolean;
}

function isActionConfig(a: unknown): a is ActionConfig {
  return typeof a === 'object' && a !== null && 'label' in a && 'onClick' in a;
}

export type { EmptyStateProps };

export function EmptyState({ title, description, detail, action, compacto }: EmptyStateProps) {
  const subtitle = description ?? detail;

  const actionNode = isActionConfig(action) ? (
    <button className={styles.actionBtn} onClick={action.onClick}>
      {action.label}
    </button>
  ) : (
    action
  );

  return (
    <div className={compacto ? styles.wrapCompacto : styles.wrap}>
      {!compacto && (
        <img
          className={styles.mascote}
          src={`${import.meta.env.BASE_URL}marca/mascote-corpo.png`}
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <strong className={styles.title}>{title}</strong>
      {subtitle && <p className={styles.detail}>{subtitle}</p>}
      {actionNode && <div className={styles.action}>{actionNode}</div>}
    </div>
  );
}
