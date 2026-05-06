/**
 * Aba Catálogo ECR — exibe todos os 20 ECRs com conteúdo rico.
 * TODO Fase 7: implementação completa de renderCatalogo().
 */

import { useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import type { Ecr } from '../../domain/types';
import styles from './CatalogoPage.module.css';

function EcrCard({ ecr }: { ecr: Ecr }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.head} onClick={() => setOpen((o) => !o)}>
        <div className={styles.titleRow}>
          <span className={styles.code}>{ecr.codigo}</span>
          <span className={styles.name}>{ecr.nome}</span>
          {ecr.categoria && <span className={styles.meta}>{ecr.categoria}</span>}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className={styles.body}>
          {ecr.objetivo && (
            <div className={styles.section}>
              <h4>Objetivo</h4>
              <p>{ecr.objetivo}</p>
            </div>
          )}
          {ecr.escopo && (
            <div className={styles.section}>
              <h4>Escopo</h4>
              <p>{ecr.escopo}</p>
            </div>
          )}

          <div className={styles.specs}>
            {ecr.normas.length > 0 && (
              <div>
                <h4>Normas Técnicas</h4>
                <ul>
                  {ecr.normas.map((n, i) => (
                    <li key={i}>
                      {n.codigo && <strong>{n.codigo} — </strong>}
                      {n.titulo}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ecr.documentos_obrigatorios.length > 0 && (
              <div>
                <h4>Documentos Obrigatórios</h4>
                <ul>
                  {ecr.documentos_obrigatorios.map((d, i) => (
                    <li key={i}>
                      {d.nome}
                      {d.periodicidade && (
                        <span className={styles.tag}>{d.periodicidade}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ecr.criterios_recebimento.length > 0 && (
              <div>
                <h4>Critérios de Recebimento</h4>
                <ul>
                  {ecr.criterios_recebimento.map((c, i) => (
                    <li key={i}>
                      {c.criterio}
                      {(c.tolerancia || c.metodo) && (
                        <span className={styles.sub}>
                          {c.tolerancia && `Tolerância: ${c.tolerancia}`}
                          {c.tolerancia && c.metodo && ' · '}
                          {c.metodo && `Método: ${c.metodo}`}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ecr.ensaios.length > 0 && (
              <div>
                <h4>Ensaios</h4>
                <ul>
                  {ecr.ensaios.map((en, i) => (
                    <li key={i}>
                      {en.nome}
                      {en.periodicidade && <span className={styles.tag}>{en.periodicidade}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {ecr.materiais.length > 0 && (
            <div className={styles.section}>
              <h4>Materiais</h4>
              <ul>
                {ecr.materiais.map((m) => (
                  <li key={m.id}>{m.descricao} <span className={styles.tag}>{m.unidade_padrao}</span></li>
                ))}
              </ul>
            </div>
          )}

          {ecr.observacoes && (
            <div className={styles.section}>
              <h4>Observações</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{ecr.observacoes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CatalogoPage() {
  const data = useDataStore((s) => s.data);
  const [search, setSearch] = useState('');

  if (!data) return null;

  const ecrs = search
    ? data.ecrs.filter(
        (e) =>
          e.nome.toLowerCase().includes(search.toLowerCase()) ||
          e.codigo.toLowerCase().includes(search.toLowerCase()) ||
          e.categoria.toLowerCase().includes(search.toLowerCase()),
      )
    : data.ecrs;

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Catálogo ECR</h2>
          <p className="section-sub">Especificações de Compra e Recebimento — {data.ecrs.length} ECRs</p>
        </div>
      </div>
      <input
        placeholder="Buscar ECR..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: 14, padding: '9px 11px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 13 }}
      />
      {ecrs.map((ecr) => (
        <EcrCard key={ecr.id} ecr={ecr} />
      ))}
    </div>
  );
}
