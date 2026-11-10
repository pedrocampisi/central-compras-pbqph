/**
 * Barra de filtros padrão das páginas de lista (busca + selects + toggle).
 * Substitui os blocos .filterBar/.searchInput/.toggleGroup/.filterSelect
 * que estavam duplicados em Histórico, Fornecedores e Obras.
 */

import { useState, type ReactNode, type SelectHTMLAttributes } from 'react';
import { CampoDeBusca } from '../CampoDeBusca/CampoDeBusca';
import { Icon } from '../Icon/Icon';
import styles from './ListToolbar.module.css';

interface ListToolbarProps {
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  /** Selects e toggles adicionais, à direita da busca. */
  children?: ReactNode;
  /**
   * Quantos filtros estão ligados (fora do padrão). No celular os filtros se
   * recolhem num botão "Filtros", que mostra este número (D1034f item 5).
   */
  filtrosLigados?: number;
}

export function ListToolbar({
  searchValue,
  searchPlaceholder = 'Buscar…',
  onSearchChange,
  children,
  filtrosLigados = 0,
}: ListToolbarProps) {
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
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
      {children && (
        <>
          {/* Só no celular: a primeira linha da lista subia para 560 px do topo
              com os filtros um por linha (D1034f item 5). Os filtros continuam
              na página; o botão só os mostra e esconde. */}
          <button
            type="button"
            className={`cp-btn cp-btn--contorno cp-btn--p ${styles.botaoFiltros}`}
            aria-expanded={filtrosAbertos}
            onClick={() => setFiltrosAbertos((a) => !a)}
          >
            <Icon name="filtro" size={16} />
            Filtros
            {filtrosLigados > 0 && <span className={styles.ligados}>{filtrosLigados}</span>}
          </button>
          <div className={`${styles.filtros} ${filtrosAbertos ? styles.filtrosAbertos : ''}`}>{children}</div>
        </>
      )}
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
  /** O nome do grupo, escrito antes dele ("Tipo", "Situação"): dois grupos lado a lado se confundem sem nome (D1034f item 7). */
  titulo?: string;
}

export function ToggleGroup<T extends string>({ options, value, onChange, labels, label, titulo }: ToggleGroupProps<T>) {
  const chips = (
    <div className="cp-chips" role={label || titulo ? 'group' : undefined} aria-label={label ?? titulo}>
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
  if (!titulo) return chips;
  return (
    <div className={styles.grupo}>
      <span className={styles.nomeDoGrupo} aria-hidden="true">
        {titulo}
      </span>
      {chips}
    </div>
  );
}

// ── Select de filtro ──────────────────────────────────────────────────────────

export function FilterSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={styles.filterSelect} {...props} />;
}
