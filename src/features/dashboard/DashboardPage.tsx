/**
 * O Painel — resumo de OCs recentes e indicadores.
 * Cards: total de OCs, emitidas, rascunhos, volume, fornecedores ativos (empresas), obras ativas.
 * Listas: últimas 8 OCs, top 5 fornecedores por valor e OCs por obra.
 * No topo, para quem revisa ECR, as tratativas abertas (CTO-D613 §3).
 *
 * Volume total e rankings EXCLUEM OCs canceladas — cancelada não é compra.
 */

import { useMemo } from 'react';
import styles from './DashboardPage.module.css';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { computeOcTotals } from '../../domain/compute';
import { agruparPorEmpresa } from '../../domain/fornecedores';
import { formatarDocumento } from '../../domain/destinatario';
import { formatBrl, formatDate } from '../../domain/format';
import { Pill } from '../../components/Pill/Pill';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Button } from '../../components/Button/Button';
import { TratativasAbertas } from './TratativasAbertas';

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

    // Por empresa, e não por filial (CTO-D1034f item 11; a D644): as filiais da
    // mesma empresa somam numa linha só, igual ao número de cima e à tela de Fornecedores.
    // A linha diz quantas filiais a empresa TEM no cadastro, e não quantas compraram
    // (D1034k, achado 5): 3 filiais com OC em 1 mostravam o CNPJ dessa uma.
    const empresaDaFilial = new Map<string, { chave: string; apelido: string; cadastradas: string[] }>();
    for (const g of agruparPorEmpresa(data.fornecedores)) {
      const cadastradas = g.filiais.map((f) => f.id);
      for (const f of g.filiais) empresaDaFilial.set(f.id, { chave: g.chave, apelido: g.apelido, cadastradas });
    }
    const porEmpresa = new Map<string, RankEntry & { filiais: string[] }>();
    for (const [id, valor] of porFornecedor) {
      const e = empresaDaFilial.get(id) ?? { chave: `sem:${id}`, apelido: 'Desconhecido', cadastradas: [id] };
      const linha = porEmpresa.get(e.chave) ?? { nome: e.apelido || 'Desconhecido', sub: '', valor: 0, filiais: e.cadastradas };
      linha.valor += valor;
      porEmpresa.set(e.chave, linha);
    }
    const topForn: RankEntry[] = [...porEmpresa.values()]
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
      .map(({ nome, valor, filiais }) => {
        const unica = filiais.length === 1 ? fornecedorById.get(filiais[0]!) : undefined;
        return {
          nome,
          sub: unica ? (unica.cnpj ? formatarDocumento(unica.cnpj, 'pj') : '') : `${filiais.length} filiais`,
          valor,
        };
      });

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
      {/* O título da tela, uma vez só (CTO-D643): antes, só a barra do alto o dizia. */}
      <div className={`section-header ${styles.cabeca}`}>
        <div>
          <h2>Painel</h2>
        </div>
      </div>

      {/* O que espera ação vem primeiro: só para quem revisa ECR (CTO-D613 §3). */}
      <TratativasAbertas />

      {/* Os números da casa, na peça Métrica do padrão (D1034): o número grande,
          a legenda embaixo e um fio em cima, sem caixa em volta. Aparecem
          prontos: a contagem é animação, e a casa não liga animação (regra 8). */}
      <div className={styles.strip}>
        <Metrica num={ocs.length} cap="ordens de compra no total" />
        <Metrica num={emitidas} cap="emitidas" />
        <Metrica num={rascunhos} cap="rascunhos" />
        <Metrica num={formatBrl(totalGeral)} cap="de volume total, sem as canceladas" dinheiro />
        {/* Conta EMPRESAS com alguma filial ativa, como a lista de Fornecedores
            (CTO-D644; a regra da D501): três filiais da mesma empresa são um
            fornecedor. Contava filiais. */}
        <Metrica
          num={agruparPorEmpresa(data.fornecedores.filter((f) => f.ativo)).length}
          cap="fornecedores ativos"
          marca="data-fornecedores-ativos"
        />
        <Metrica num={data.obras.filter((o) => o.ativa).length} cap="obras ativas" />
      </div>

      {/* Grid: últimas OCs + rankings */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Últimas Ordens de Compra</h3>
          {ocs.length === 0 ? (
            <EmptyState
              compacto
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
                      <div className={styles.nome}>
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
            <h3>Fornecedores com mais compras</h3>
            {topForn.length === 0 ? (
              <EmptyState title="Sem dados" compacto />
            ) : (
              <RankList entries={topForn} />
            )}
          </div>

          <div className={`${styles.card} ${styles.cardSeguinte}`}>
            <h3>OCs por Obra (por valor)</h3>
            {topObras.length === 0 ? (
              <EmptyState title="Sem dados" compacto />
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
            <div className={styles.nome}>{e.nome}</div>
            {e.sub && <div className={styles.meta}>{e.sub}</div>}
          </div>
          <div className={styles.valor}>{formatBrl(e.valor)}</div>
        </div>
      ))}
    </div>
  );
}

/** A peça Métrica do pacote. `marca` põe o atributo que as verificações procuram. */
function Metrica({ num, cap, dinheiro, marca }: { num: number | string; cap: string; dinheiro?: boolean; marca?: string }) {
  const extra = marca ? { [marca]: '' } : {};
  return (
    <div className={`cp-metrica ${dinheiro ? styles.dinheiro : ''}`}>
      <div className="num" {...extra}>
        {num}
      </div>
      <div className="cap">{cap}</div>
    </div>
  );
}
