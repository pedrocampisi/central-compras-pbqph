import type { ReactNode } from 'react';
import { EmptyState } from '../EmptyState/EmptyState';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
  /** Called when a data cell (not actions cell) is clicked. */
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDetail?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowActions,
  onRowClick,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDetail,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} detail={emptyDetail} />;
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
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
            {rowActions && <th className={styles.actionsCol}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                  {col.render ? col.render(row, i) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
              {rowActions && (
                <td onClick={(e) => e.stopPropagation()}>
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
