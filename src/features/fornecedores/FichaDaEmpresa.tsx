/**
 * A ficha da empresa (CTO-D604 §3.1, D613 §2): a qualificação nas cinco
 * categorias da FO 8.4.1.1, aberta da gaveta de qualquer filial.
 *
 * A qualificação é da EMPRESA — todas as filiais mostram a mesma ficha. Só o
 * fornecedor sem empresa cadastrada (o prestador pessoa física, D606 3) tem
 * ficha própria.
 *
 * Cada categoria mostra o selo, a linha que vale e o histórico inteiro:
 * requalificar grava uma linha nova e nunca apaga a velha. Quem pode emitir
 * OC qualifica (D605 §4); os outros só leem.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import {
  dataBr,
  desempenhoDaFilial,
  historicoDaFilial,
  nomeDasEcrs,
  seloDaFilial,
  textoDoDesempenho,
  textoDoSelo,
} from '../../domain/qualificacao';
import { podeEmitirOc } from '../../services/supabase/auth';
import type { CategoriaDaQualificacao, QualificacaoGravada } from '../../services/supabase/qualificacao';
import { recarregarDados } from '../../services/supabase/sync';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDataStore } from '../../stores/useDataStore';
import { useQualificacaoStore } from '../../stores/useQualificacaoStore';
import { useUiStore } from '../../stores/useUiStore';
import type { Fornecedor } from '../../domain/types';
import { QualificarDialogo } from './QualificarDialogo';
import { SeloDaQualificacao } from './SeloDaQualificacao';
import styles from './FichaDaEmpresa.module.css';

export function FichaDaEmpresa({ filial, aoFechar }: { filial: Fornecedor; aoFechar: () => void }) {
  const dados = useQualificacaoStore((s) => s.dados);
  const erro = useQualificacaoStore((s) => s.erro);
  const ecrs = useDataStore((s) => s.data?.ecrs ?? []);
  const perfil = useAuthStore((s) => s.perfil);
  const showToast = useUiStore((s) => s.showToast);
  const [qualificando, setQualificando] = useState<CategoriaDaQualificacao | null>(null);

  const podeQualificar = podeEmitirOc(perfil?.papel);
  const nome = filial.empresa_apelido || filial.razao_social;
  const desempenho = textoDoDesempenho(dados ? desempenhoDaFilial(filial, dados.desempenho) : undefined);

  async function depoisDeQualificar(c: CategoriaDaQualificacao, r: QualificacaoGravada) {
    setQualificando(null);
    try {
      await recarregarDados();
    } catch {
      showToast('A qualificação foi gravada, mas a tela não recarregou. Recarregue a página.', 'warning');
      return;
    }
    showToast(
      r.qualificada
        ? `${c.nome}: ${textoDoSelo({ situacao: r.situacao, qualificadaEm: null, venceEm: r.venceEm, ecrs: [] })}.`
        : `${c.nome}: nota ${r.nota} (o mínimo é ${r.minimo}) — a empresa ficou desqualificada.`,
      r.qualificada ? 'success' : 'warning',
    );
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="ficha-titulo">
      <div className={styles.caixa} data-ficha-da-empresa="">
        <div className={styles.topo}>
          <div>
            <h3 id="ficha-titulo" className={styles.titulo}>
              Ficha da empresa
            </h3>
            <p className={styles.quem}>{nome}</p>
            <p className={styles.pista}>
              {filial.empresa_id
                ? 'A qualificação é da empresa: vale para todas as filiais dela.'
                : 'Fornecedor sem empresa cadastrada: a qualificação vale só para ele.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={aoFechar}>
            Fechar
          </Button>
        </div>

        {!dados ? (
          <p className={styles.semCarga} role="alert">
            As qualificações não carregaram{erro ? ` (${erro})` : ''}. Recarregue a página para ver e gravar.
          </p>
        ) : (
          <>
            <p className={styles.desempenho} data-desempenho="">
              {desempenho}
            </p>
            {dados.categorias.map((c) => {
              const selo = seloDaFilial(filial, dados.linhas, c.categoria);
              const historico = historicoDaFilial(filial, dados.linhas, c.categoria);
              const vale = historico.find((l) => l.vigente);
              return (
                <section key={c.categoria} className={styles.categoria} data-categoria={c.categoria}>
                  <div className={styles.cabecalho}>
                    <h4>{c.nome}</h4>
                    <SeloDaQualificacao selo={selo} />
                    {podeQualificar && (
                      <Button variant="outline" size="sm" onClick={() => setQualificando(c)}>
                        {historico.length > 0 ? 'Requalificar' : 'Qualificar'}
                      </Button>
                    )}
                  </div>
                  {vale && (
                    <p className={styles.vale}>
                      {vale.tipo && <>{vale.tipo} · </>}
                      Qualificada em {dataBr(vale.qualificadaEm)}
                      {vale.qualificadoPorNome && <> por {vale.qualificadoPorNome}</>} · nota {vale.nota} de{' '}
                      {vale.criterios.length} (mínimo {vale.minimo})
                      {c.categoria === 'material' && vale.ecrs.length > 0 && <> · {nomeDasEcrs(vale.ecrs)}</>}
                    </p>
                  )}
                  {historico.length > 0 && (
                    <details className={styles.historico}>
                      <summary>Histórico ({historico.length})</summary>
                      <ol>
                        {historico.map((l) => (
                          <li key={l.id} data-vigente={l.vigente || undefined}>
                            <strong>
                              {dataBr(l.qualificadaEm)} — nota {l.nota}, {l.qualificada ? 'qualificada' : 'desqualificada'}
                              {l.vigente ? ' (a que vale)' : ''}
                            </strong>
                            <ul>
                              {l.criterios.map((k, i) => (
                                <li key={i}>
                                  {c.criterios[i] ?? `Critério ${i + 1}`}: {k.atende ? 'atende' : 'não atende'}
                                  {k.motivo && <> — {k.motivo}</>}
                                </li>
                              ))}
                            </ul>
                            <span className={styles.origem}>
                              {[l.qualificadoPorNome, l.origem].filter(Boolean).join(' · ')}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </section>
              );
            })}
          </>
        )}
      </div>

      {qualificando && dados && (
        <QualificarDialogo
          filial={filial}
          categoria={qualificando}
          ecrs={ecrs}
          ecrsMarcadas={qualificando.categoria === 'material' ? seloDaFilial(filial, dados.linhas).ecrs : []}
          desempenho={desempenho}
          titulo={`${historicoDaFilial(filial, dados.linhas, qualificando.categoria).length > 0 ? 'Requalificar' : 'Qualificar'} — ${qualificando.nome}`}
          aoGravar={(r) => depoisDeQualificar(qualificando, r)}
          aoVoltar={() => setQualificando(null)}
        />
      )}
    </div>,
    document.body,
  );
}
