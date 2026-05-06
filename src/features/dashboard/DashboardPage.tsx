/**
 * Aba Dashboard — resumo de OCs recentes e indicadores.
 * TODO Fase 7: migrar conteúdo completo de renderDashboard().
 */

import styles from './DashboardPage.module.css';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { computeOcTotals } from '../../domain/compute';
import { formatBrl, formatDate } from '../../domain/format';
import { Pill } from '../../components/Pill/Pill';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Button } from '../../components/Button/Button';

export function DashboardPage() {
  const data = useDataStore((s) => s.data);
  const setTab = useUiStore((s) => s.setActiveTab);

  if (!data) return null;

  const ocs = [...data.ordens_compra].sort((a, b) => (b.criado_em > a.criado_em ? 1 : -1));
  const emitidas = ocs.filter((o) => o.status === 'emitida').length;
  const rascunhos = ocs.filter((o) => o.status === 'rascunho').length;
  const totalGeral = ocs.reduce((acc, o) => acc + computeOcTotals(o).total_geral, 0);

  // Top 5 fornecedores por valor total
  const fornValor: Record<string, number> = {};
  for (const oc of ocs) {
    const tot = computeOcTotals(oc).total_geral;
    fornValor[oc.fornecedor_id] = (fornValor[oc.fornecedor_id] ?? 0) + tot;
  }
  const topForn = Object.entries(fornValor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, val]) => ({
      fornecedor: data.fornecedores.find((f) => f.id === id),
      valor: val,
    }));

  return (
    <div>
      {/* Summary strip */}
      <div className={styles.strip}>
        <div className={styles.tile}>
          <small>Total OCs</small>
          <div className={styles.tileValue}>{ocs.length}</div>
        </div>
        <div className={styles.tile}>
          <small>Emitidas</small>
          <div className={styles.tileValue}>{emitidas}</div>
        </div>
        <div className={styles.tile}>
          <small>Rascunhos</small>
          <div className={styles.tileValue}>{rascunhos}</div>
        </div>
        <div className={styles.tile}>
          <small>Volume total</small>
          <div className={styles.tileValue} style={{ fontSize: 18 }}>{formatBrl(totalGeral)}</div>
        </div>
        <div className={styles.tile}>
          <small>Fornecedores</small>
          <div className={styles.tileValue}>{data.fornecedores.filter((f) => f.ativo).length}</div>
        </div>
        <div className={styles.tile}>
          <small>Obras ativas</small>
          <div className={styles.tileValue}>{data.obras.filter((o) => o.ativa).length}</div>
        </div>
      </div>

      {/* Grid: últimas OCs + top fornecedores */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Últimas Ordens de Compra</h3>
          {ocs.length === 0 ? (
            <EmptyState
              title="Nenhuma OC ainda"
              detail="Crie sua primeira ordem de compra."
              action={
                <Button variant="primary" size="sm" onClick={() => setTab('nova-oc')}>
                  + Nova OC
                </Button>
              }
            />
          ) : (
            <div className={styles.list}>
              {ocs.slice(0, 8).map((oc) => {
                const f = data.fornecedores.find((x) => x.id === oc.fornecedor_id);
                const tot = computeOcTotals(oc).total_geral;
                return (
                  <div key={oc.id} className={styles.listItem}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {oc.numero} — {f?.razao_social || '—'}
                      </div>
                      <div className={styles.meta}>
                        {formatDate(oc.data)} · {formatBrl(tot)}
                      </div>
                    </div>
                    <Pill status={oc.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3>Top Fornecedores (por valor)</h3>
          {topForn.length === 0 ? (
            <EmptyState title="Sem dados" />
          ) : (
            <div className={styles.list}>
              {topForn.map(({ fornecedor, valor }, i) => (
                <div key={i} className={styles.listItem}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {fornecedor?.razao_social || 'Desconhecido'}
                    </div>
                    <div className={styles.meta}>{fornecedor?.cnpj || ''}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{formatBrl(valor)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
