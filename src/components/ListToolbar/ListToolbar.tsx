/**
 * Barra de filtros padrão das páginas de lista (busca + selects + toggle).
 * Substitui os blocos .filterBar/.searchInput/.toggleGroup/.filterSelect
 * que estavam duplicados em Histórico, Fornecedores e Obras.
 */

import type { ReactNode, SelectHTMLAttributes } from 'react';
import { CampoDeBusca } from '../CampoDeBusca/CampoDeBusca';
import { Icon } from '../Icon/Icon';
import styles from './ListToolbar.module.css';

interface ListToolbarProps {
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  /** Selects e toggles adicionais, à direita da busca. */
  children?: ReactNode;
}

export function ListToolbar({
  searchValue,
  searchPlaceholder = 'Buscar…',
  onSearchChange,
  children,
}: ListToolbarProps) {
  return (
    <div className={styles.filterBar}>
      {/* A busca da tela de trabalho, a candidata `cc-busca`: sem botão
          "Buscar", porque a lista filtra enquanto se digita (DESIGN.md §10);
          o botão dourado fica para a ação da tela. */}
      <div className="cc-busca">
        <Icon name="search" size={18} />
        <CampoDeBusca
          className={styles.searchInput}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
          aria-label={searchPlaceholder}
        />
      </div>
      {children}
    </div>
  );
}

// ── Recorte da lista (Todos / Ativos / Inativos …): a peça Chips do pacote ─────

interface ToggleGroupProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** O texto do botão, quando não é o próprio valor com a primeira letra maiúscula. */
  labels?: Partial<Record<T, string>>;
  /** O nome do grupo para o leitor de tela, quando há mais de um na barra. */
  label?: string;
}

export function ToggleGroup<T extends string>({ options, value, onChange, labels, label }: ToggleGroupProps<T>) {
  return (
    <div className="cp-chips" role={label ? 'group' : undefined} aria-label={label}>
      {options.map((v) => (
        <button
          key={v}
          type="button"
          className="cp-chip"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {labels?.[v] ?? v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ── Select de filtro ──────────────────────────────────────────────────────────

export function FilterSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={styles.filterSelect} {...props} />;
}
