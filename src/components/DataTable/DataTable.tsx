import type { KeyboardEvent, ReactNode } from 'react';
import { EmptyState } from '../EmptyState/EmptyState';
import styles from './DataTable.module.css';

/**
 * Onde a coluna vai quando, abaixo de 720 px, a tabela vira cartões (candidata
 * `cc-cartoes`, CTO-D1034f item 4): o título e o selo na primeira linha, os
 * detalhes embaixo, com o nome da coluna; `fora` não aparece no cartão.
 */
export type LugarNoCartao = 'titulo' | 'selo' | 'detalhe' | 'fora';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cartao?: LugarNoCartao;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
  /**
   * A linha abre a coisa (CTO-D1034f item 2; a D976): o clique, e também o
   * Enter e o Espaço com o foco na linha. Sem botão que repete o clique.
   */
  onRowClick?: (row: T) => void;
  /** O nome da linha para o leitor de tela ("Abrir a obra X"), quando ela abre. */
  rowLabel?: (row: T) => string;
  /** A largura fixa da coluna de ações (D1034f item 1): a coluna não anda de uma linha para outra. */
  larguraDasAcoes?: string;
  emptyTitle?: string;
  emptyDetail?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowActions,
  onRowClick,
  rowLabel,
  larguraDasAcoes,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDetail,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} detail={emptyDetail} />;
  }

  const abrirPeloTeclado = (row: T) => (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.target !== e.currentTarget) return; // o Enter num botão de dentro é do botão
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick?.(row);
    }
  };

  return (
    <div className={styles.wrap}>
      <table className={`cp-tabela cc-cartoes ${styles.table}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
              >
                {col.label}
              </th>
            ))}
            {rowActions && (
              <th className={styles.actionsCol} style={larguraDasAcoes ? { width: larguraDasAcoes } : undefined}>
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? abrirPeloTeclado(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              aria-label={onRowClick && rowLabel ? rowLabel(row) : undefined}
              className={onRowClick ? 'cc-linha-abre' : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{ textAlign: col.align ?? 'left' }}
                  data-cartao={col.cartao ?? 'detalhe'}
                  data-rotulo={col.label}
                >
                  {col.render ? col.render(row, i) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
              {rowActions && (
                <td onClick={(e) => e.stopPropagation()} data-cartao="acoes">
                  <div className={styles.rowActions}>{rowActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
