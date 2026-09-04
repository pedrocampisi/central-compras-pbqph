/**
 * Barra de filtros padrão das páginas de lista (busca + selects + toggle).
 * Substitui os blocos .filterBar/.searchInput/.toggleGroup/.filterSelect
 * que estavam duplicados em Histórico, Fornecedores, Obras e Prestadores.
 */

import type { ReactNode, SelectHTMLAttributes } from 'react';
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
      {/* Busca em pílula do padrão. Aqui ela NÃO leva botão "Buscar": estas são
          telas de trabalho, onde a lista filtra enquanto se digita — botão só
          na tela de entrada. */}
      <div className={styles.busca}>
        <Icon name="search" size={18} className={styles.buscaIcone} />
        <input
          className={styles.searchInput}
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={searchPlaceholder}
        />
      </div>
      {children}
    </div>
  );
}

// ── Toggle de status (Todos / Ativos / Inativos …) ────────────────────────────

interface ToggleGroupProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function ToggleGroup<T extends string>({ options, value, onChange }: ToggleGroupProps<T>) {
  return (
    <div className={styles.toggleGroup}>
      {options.map((v) => (
        <button
          key={v}
          type="button"
          className={[styles.toggleBtn, value === v ? styles.toggleActive : ''].join(' ')}
          onClick={() => onChange(v)}
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  );
}

// ── Select de filtro ──────────────────────────────────────────────────────────

export function FilterSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={styles.filterSelect} {...props} />;
}
