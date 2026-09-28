/**
 * Aba Catálogo ECR — as 20 ECRs em vigor (CTO-D586, com a D588: a ECR do
 * sistema é a que vale). Cada ECR aberta mostra a revisão, as cinco seções na
 * ordem do documento, os materiais e, no fim, o histórico de revisões. Cada
 * ECR tem o botão do PDF (D589 §4.1), para quem vê o catálogo, e o de editar
 * (D589 §4.2), só para o Pedro.
 */

import { useEffect, useState } from 'react';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import type { Ecr, EcrItem } from '../../domain/types';
import {
  COLUNAS_DO_HISTORICO,
  HISTORICO,
  MATERIAIS,
  NENHUMA_REVISAO,
  O_QUE_E_O_CATALOGO,
  SEM_HISTORICO,
  SEM_TEXTO,
  blocosDaSecao,
  linhaDoHistorico,
  numeroDaSecao,
  revisaoDaEcr,
} from '../../domain/ecr';
import { baixarPdfDaEcr } from '../../services/pdf/generateEcrPdf';
import { podeRevisarEcr } from '../../services/supabase/ecrs';
import { useRevisaoEcrStore } from '../../stores/useRevisaoEcrStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { EditorDaEcr } from './EditorDaEcr';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import styles from './CatalogoPage.module.css';

/** A linha como o documento a escreve, com o rótulo em negrito. */
function Linha({ item }: { item: EcrItem }) {
  return item.rotulo ? (
    <>
      <strong>{item.rotulo}:</strong> {item.texto}
    </>
  ) : (
    <>{item.texto}</>
  );
}

/** O histórico de revisões, como a tabela do rodapé do documento. */
function Historico({ ecr }: { ecr: Ecr }) {
  return (
    <section className={styles.historico} data-historico="">
      <h4>{HISTORICO}</h4>
      {!ecr.revisoes ? (
        <p className={styles.semTexto}>{SEM_HISTORICO}</p>
      ) : ecr.revisoes.length === 0 ? (
        <p className={styles.semTexto}>{NENHUMA_REVISAO}</p>
      ) : (
        <table className={styles.tabela}>
          <thead>
            <tr>
              {COLUNAS_DO_HISTORICO.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ecr.revisoes.map((r, i) => (
              <tr key={i}>
                {linhaDoHistorico(r).map((c, j) => (
                  <td key={j} data-coluna={COLUNAS_DO_HISTORICO[j]}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function EcrCard({ ecr, podeRevisar }: { ecr: Ecr; podeRevisar: boolean }) {
  const [open, setOpen] = useState(false);
  const [gerando, setGerando] = useState(false);
  const showToast = useUiStore((s) => s.showToast);
  const emEdicao = useRevisaoEcrStore((s) => s.ecrId);
  const dono = useRevisaoEcrStore((s) => s.dono);
  const abrirRevisao = useRevisaoEcrStore((s) => s.abrir);
  const meuId = useAuthStore((s) => s.sessao?.user.id ?? '');
  const revisao = revisaoDaEcr(ecr);
  // A ECR em edição fica aberta: o rascunho não se esconde. Mas só para quem
  // revisa E abriu o rascunho: outra conta não o enxerga (perícia 27/09, achado 4).
  const editando = podeRevisar && emEdicao === ecr.id && !!meuId && dono === meuId;
  const aberta = open || editando;

  async function pdf() {
    setGerando(true);
    try {
      await baixarPdfDaEcr(ecr);
    } catch (err) {
      showToast(`Erro ao gerar o PDF: ${err instanceof Error ? err.message : 'erro desconhecido'}`, 'error');
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cabeca}>
        <button type="button" className={styles.head} aria-expanded={aberta} onClick={() => setOpen((o) => !o)}>
          <Icon name="chevron" size={16} className={aberta ? `${styles.seta} ${styles.setaAberta}` : styles.seta} />
          <span className={styles.titleRow}>
            <span className={styles.code}>{ecr.codigo}</span>
            <span className={styles.name}>{ecr.nome}</span>
            {ecr.categoria && <span className={styles.meta}>{ecr.categoria}</span>}
          </span>
          {revisao && <span className={styles.revisao}>{revisao}</span>}
        </button>
        {editando && <span className={styles.emEdicao}>Em edição</span>}
        {/* Uma ECR em edição por vez: enquanto uma está aberta, as outras não oferecem "Editar". */}
        {podeRevisar && ecr.secoes && emEdicao === null && (
          <Button
            variant="outline"
            size="sm"
            className={styles.pdf}
            onClick={() => {
              abrirRevisao(ecr, meuId);
              setOpen(true);
            }}
            aria-label={`Editar a ${ecr.codigo}`}
          >
            <Icon name="lapis" size={14} />
            Editar
          </Button>
        )}
        {ecr.secoes && (
          <Button
            variant="outline"
            size="sm"
            className={styles.pdf}
            loading={gerando}
            onClick={pdf}
            aria-label={`PDF da ${ecr.codigo}`}
          >
            {!gerando && <Icon name="download" size={14} />}
            PDF
          </Button>
        )}
      </div>

      {aberta && (
        <div className={styles.body} data-ecr-aberta="">
          {editando ? (
            <EditorDaEcr ecr={ecr} />
          ) : ecr.secoes ? (
            ecr.secoes.map((s, i) => (
              <section key={i} className={styles.secao}>
                <h4>
                  {numeroDaSecao(i)} {s.titulo}
                </h4>
                {blocosDaSecao(s.itens).map((b, j) =>
                  b.tipo === 'lista' ? (
                    <ul key={j} className={styles.lista}>
                      {b.itens.map((it, k) => (
                        <li key={k}>
                          <Linha item={it} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j} className={styles.nota}>
                      <Linha item={b.item} />
                    </p>
                  ),
                )}
              </section>
            ))
          ) : (
            <p className={styles.semTexto} data-sem-texto="">
              {SEM_TEXTO}
            </p>
          )}

          {!editando && ecr.materiais.length > 0 && (
            <section className={styles.materiais} data-materiais="">
              <h4>{MATERIAIS}</h4>
              <ul>
                {ecr.materiais.map((m) => (
                  <li key={m.id}>
                    {m.descricao} <span className={styles.tag}>{m.unidade_padrao}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!editando && <Historico ecr={ecr} />}
        </div>
      )}
    </div>
  );
}

export function CatalogoPage() {
  const data = useDataStore((s) => s.data);
  // Filtro no uiStore: persiste ao trocar de aba.
  const search = useUiStore((s) => s.catalogoFilter.search);
  const setCatalogoFilter = useUiStore((s) => s.setCatalogoFilter);
  // Só o Pedro revisa (D589 §4.3). O banco responde; na dúvida, o botão não aparece.
  // A resposta vale só para a conta que perguntou: trocou a conta, pergunta de novo.
  const meuId = useAuthStore((s) => s.sessao?.user.id ?? '');
  const [resposta, setResposta] = useState<{ conta: string; pode: boolean } | null>(null);
  const podeRevisar = !!resposta && resposta.conta === meuId && resposta.pode;
  useEffect(() => {
    let vivo = true;
    podeRevisarEcr().then(
      (ok) => vivo && setResposta({ conta: meuId, pode: ok }),
      () => vivo && setResposta({ conta: meuId, pode: false }),
    );
    return () => {
      vivo = false;
    };
  }, [meuId]);

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
          <p className="section-sub">
            Especificações de Compra e Recebimento — {data.ecrs.length} ECRs. {O_QUE_E_O_CATALOGO}
          </p>
        </div>
      </div>
      <input
        type="search"
        placeholder="Buscar ECR..."
        value={search}
        onChange={(e) => setCatalogoFilter({ search: e.target.value })}
        style={{ width: '100%', marginBottom: 14, padding: '9px 11px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 13 }}
      />
      {ecrs.map((ecr) => (
        <EcrCard key={ecr.id} ecr={ecr} podeRevisar={podeRevisar} />
      ))}
    </div>
  );
}
