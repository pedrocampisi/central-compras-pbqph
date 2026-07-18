/**
 * Aba Dashboard — resumo de OCs recentes e indicadores.
 * Cards: total de OCs, emitidas, rascunhos, volume, fornecedores ativos, obras ativas.
 * Listas: últimas 8 OCs, top 5 fornecedores por valor e OCs por obra.
 *
 * Volume total e rankings EXCLUEM OCs canceladas — cancelada não é compra.
 */

import { useMemo } from 'react';
import styles from './DashboardPage.module.css';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { computeOcTotals } from '../../domain/compute';
import { formatBrl, formatDate } from '../../domain/format';
import { Pill } from '../../components/Pill/Pill';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Button } from '../../components/Button/Button';

interface RankEntry {
  nome: string;
  sub: string;
  valor: number;
}

export function DashboardPage() {
  const data = useDataStore((s) => s.data);
  const setTab = useUiStore((s) => s.setActiveTab);

  const resumo = useMemo(() => {
    if (!data) return null;

    const fornecedorById = new Map(data.fornecedores.map((f) => [f.id, f]));
    const obraById = new Map(data.obras.map((o) => [o.id, o]));

    const ocs = [...data.ordens_compra].sort((a, b) => (b.criado_em > a.criado_em ? 1 : -1));
    const validas = ocs.filter((o) => o.status !== 'cancelada');

    let totalGeral = 0;
    const porFornecedor = new Map<string, number>();
    const porObra = new Map<string, { valor: number; qtd: number }>();

    for (const oc of validas) {
      const tot = computeOcTotals(oc).total_geral;
      totalGeral += tot;
      porFornecedor.set(oc.fornecedor_id, (porFornecedor.get(oc.fornecedor_id) ?? 0) + tot);
      const obra = porObra.get(oc.obra_id) ?? { valor: 0, qtd: 0 };
      obra.valor += tot;
      obra.qtd += 1;
      porObra.set(oc.obra_id, obra);
    }

    const topForn: RankEntry[] = [...porFornecedor.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, valor]) => ({
        nome: fornecedorById.get(id)?.razao_social ?? 'Desconhecido',
        sub: fornecedorById.get(id)?.cnpj ?? '',
        valor,
      }));

    const topObras: RankEntry[] = [...porObra.entries()]
      .sort((a, b) => b[1].valor - a[1].valor)
      .slice(0, 5)
      .map(([id, { valor, qtd }]) => ({
        nome: obraById.get(id)?.nome ?? 'Obra removida',
        sub: `${qtd} OC(s)`,
        valor,
      }));

    return {
      ocs,
      fornecedorById,
      emitidas: ocs.filter((o) => o.status === 'emitida').length,
      rascunhos: ocs.filter((o) => o.status === 'rascunho').length,
      totalGeral,
      topForn,
      topObras,
    };
  }, [data]);

  if (!data || !resumo) return null;

  const { ocs, fornecedorById, emitidas, rascunhos, totalGeral, topForn, topObras } = resumo;

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
          <small>Volume total (exceto canceladas)</small>
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

      {/* Grid: últimas OCs + rankings */}
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
                const f = fornecedorById.get(oc.fornecedor_id);
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

        <div>
          <div className={styles.card}>
            <h3>Top Fornecedores (por valor)</h3>
            {topForn.length === 0 ? (
              <EmptyState title="Sem dados" />
            ) : (
              <RankList entries={topForn} />
            )}
          </div>

          <div className={styles.card} style={{ marginTop: 16 }}>
            <h3>OCs por Obra (por valor)</h3>
            {topObras.length === 0 ? (
              <EmptyState title="Sem dados" />
            ) : (
              <RankList entries={topObras} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RankList({ entries }: { entries: RankEntry[] }) {
  return (
    <div className={styles.list}>
      {entries.map((e, i) => (
        <div key={i} className={styles.listItem}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{e.nome}</div>
            {e.sub && <div className={styles.meta}>{e.sub}</div>}
          </div>
          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{formatBrl(e.valor)}</div>
        </div>
      ))}
    </div>
  );
}
