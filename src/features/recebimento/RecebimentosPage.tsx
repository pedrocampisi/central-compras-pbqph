/**
 * Recebimentos — o lado do escritório do que chegou na obra (CTO-D696 §5.2).
 *
 * A fila do "chegou sem pedido" (`compras.sem_pedido_na_fila`): o que o mestre
 * registrou sem OC, e as entregas que chegaram depois de a OC ser cancelada
 * (D699 §2: a entrega nunca some, vem para cá com a OC anotada). Quem emite OC
 * resolve cada uma:
 *   - liga a uma OC da mesma obra, e ela vira a avaliação do PS.02 daquela OC
 *     (a integridade é a que o mestre disse; prazo e "confere", quem liga);
 *   - ou descarta, com o motivo.
 * Nada se apaga: o banco guarda quem ligou ou descartou, e quando.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { formatDate } from '../../domain/format';
import { linkSeguro } from '../../domain/pastaDaObra';
import {
  LIGACAO_VAZIA, naoConformesDaLigacao, ocsParaLigar, problemaDaLigacao, type RespostasDaLigacao,
} from '../../domain/recebimento';
import type { OrdemCompra } from '../../domain/types';
import { podeEmitirOc } from '../../services/supabase/auth';
import {
  descartarSemPedido, lerFilaSemPedido, lerLinksDasFotos, ligarSemPedido, type SemPedidoNaFila,
} from '../../services/supabase/recebimento';
import { recarregarDados } from '../../services/supabase/sync';
import { obraDaMascara } from '../../services/storage/umaObra';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDataStore } from '../../stores/useDataStore';
import { useUiStore } from '../../stores/useUiStore';
import { AjudaDaEcr } from '../../components/Ajuda/AjudaDaEcr';
import caixa from '../ordens-compra/RegistrarEntregaDialogo.module.css';
import styles from './RecebimentosPage.module.css';

export function RecebimentosPage() {
  const data = useDataStore((s) => s.data);
  const perfil = useAuthStore((s) => s.perfil);
  const gravaOk = podeEmitirOc(perfil?.papel);

  const [fila, setFila] = useState<SemPedidoNaFila[] | null>(null);
  const [erro, setErro] = useState('');
  const [fotos, setFotos] = useState<Map<string, string>>(new Map());
  const [ligando, setLigando] = useState<SemPedidoNaFila | null>(null);
  const [descartando, setDescartando] = useState<SemPedidoNaFila | null>(null);

  const ler = useCallback(async () => {
    try {
      // A obra da máscara vai na busca; o filtro daqui é só a segunda trava.
      const mascara = obraDaMascara();
      const todos = await lerFilaSemPedido(mascara);
      const f = mascara ? todos.filter((x) => x.intervencaoId === mascara) : todos;
      setFila(f);
      setErro('');
      setFotos(await lerLinksDasFotos(f.map((x) => x.fotoDocumentoId)));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao ler os recebimentos.');
    }
  }, []);

  // Relê quando os dados mudam: o mestre pode ter registrado, ou outra pessoa resolvido.
  useEffect(() => {
    const t = setTimeout(() => void ler(), 0);
    return () => clearTimeout(t);
  }, [ler, data]);

  const fornecedorNome = useMemo(
    () => new Map((data?.fornecedores ?? []).map((f) => [f.id, f.empresa_apelido?.trim() || f.razao_social])),
    [data],
  );

  if (!data) return null;

  async function depoisDeResolver(mensagem: string) {
    setLigando(null);
    setDescartando(null);
    useUiStore.getState().showToast(mensagem, 'success');
    await ler();
  }

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2>Recebimentos</h2>
          <p className="section-sub">
            O que chegou na obra sem pedido: ligue à OC certa, ou descarte com o motivo.
          </p>
        </div>
      </div>

      {erro && (
        <p className={caixa.erro} role="alert">
          {erro}
        </p>
      )}

      {fila && fila.length === 0 && (
        <EmptyState title="Nada esperando" description="Nenhum recebimento sem pedido esperando o escritório." />
      )}

      {fila && fila.length > 0 && (
        <ul className={styles.lista}>
          {fila.map((r) => {
            const foto = linkSeguro(fotos.get(r.fotoDocumentoId) ?? '');
            return (
              <li key={r.id} className={styles.cartao} data-sem-pedido={r.id}>
                <div className={styles.cabeca}>
                  <strong>{r.obra}</strong>
                  <span>Chegou em {formatDate(r.recebidoEm)}</span>
                  {r.chegouComEstrago && <span className={styles.estrago}>Com estrago</span>}
                </div>
                {r.ocInformadaNumero && (
                  <p className={caixa.aviso}>
                    Era a entrega da OC {r.ocInformadaNumero}, que já não recebia entrega quando o recebimento chegou.
                  </p>
                )}
                <dl className={styles.dados}>
                  <dt>O que chegou</dt>
                  <dd>{r.oQueChegou}</dd>
                  {r.fornecedorTexto && (
                    <>
                      <dt>De quem</dt>
                      <dd>{r.fornecedorTexto}</dd>
                    </>
                  )}
                  <dt>Nota</dt>
                  <dd>{r.notaFiscal || 'Só a foto'}</dd>
                  {r.observacao && (
                    <>
                      <dt>Observação</dt>
                      <dd>{r.observacao}</dd>
                    </>
                  )}
                  <dt>Registrado por</dt>
                  <dd>{r.registradoPorNome}</dd>
                </dl>
                <div className={styles.acoes}>
                  {foto && (
                    <a className={styles.link} href={foto} target="_blank" rel="noreferrer">
                      Ver a foto da nota
                    </a>
                  )}
                  {gravaOk && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setLigando(r)}>
                        Ligar a uma OC
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDescartando(r)}>
                        Descartar
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {ligando && (
        <LigarDialogo
          item={ligando}
          ocs={ocsParaLigar(data.ordens_compra, ligando.intervencaoId, ligando.ocInformadaId)}
          fornecedorNome={fornecedorNome}
          aoFechar={() => setLigando(null)}
          aoLigar={(numero) => void depoisDeResolver(`Recebimento ligado à OC ${numero}.`)}
        />
      )}
      {descartando && (
        <DescartarDialogo
          item={descartando}
          aoFechar={() => setDescartando(null)}
          aoDescartar={() => void depoisDeResolver('Recebimento descartado.')}
        />
      )}
    </div>
  );
}

const PERGUNTAS = [
  { chave: 'prazoConforme', texto: 'Prazo de entrega', sim: 'Conforme', nao: 'Não Conforme' },
  { chave: 'ocEcrConforme', texto: 'Confere com a OC e com a ECR', sim: 'Conforme', nao: 'Não Conforme' },
  { chave: 'chegouTudo', texto: 'Chegou tudo?', sim: 'Sim', nao: 'Só uma parte' },
] as const;

function LigarDialogo({
  item, ocs, fornecedorNome, aoFechar, aoLigar,
}: {
  item: SemPedidoNaFila;
  ocs: OrdemCompra[];
  fornecedorNome: Map<string, string>;
  aoFechar: () => void;
  aoLigar: (numero: string) => void;
}) {
  const [r, setR] = useState<RespostasDaLigacao>({ ...LIGACAO_VAZIA, ocId: ocs[0]?.id ?? '' });
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);
  const nc = naoConformesDaLigacao(r, item.chegouComEstrago);
  const mudar = (parte: Partial<RespostasDaLigacao>) => setR((x) => ({ ...x, ...parte }));

  async function gravar() {
    const problema = problemaDaLigacao(r, item);
    if (problema) {
      setErro(problema);
      return;
    }
    const oc = ocs.find((o) => o.id === r.ocId)!;
    setErro('');
    setGravando(true);
    try {
      await ligarSemPedido(item.id, {
        ocId: oc.id,
        versao: oc.versao,
        notaFiscal: r.notaFiscal,
        prazoConforme: r.prazoConforme!,
        ocEcrConforme: r.ocEcrConforme!,
        chegouTudo: r.chegouTudo!,
        tratativa: nc >= 2 ? r.tratativa : '',
        observacao,
      });
      await recarregarDados().catch(() => undefined);
      aoLigar(oc.numero);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao ligar o recebimento.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="ligar-titulo">
      <div className={caixa.caixa} data-dialogo-ligar="">
        <h3 id="ligar-titulo" className={caixa.titulo}>
          Ligar a uma OC
        </h3>
        <p className={caixa.quem}>
          {item.obra} · chegou em {formatDate(item.recebidoEm)} · {item.oQueChegou}
        </p>

        {ocs.length === 0 ? (
          <p className={caixa.aviso}>
            Nenhuma OC emitida desta obra para ligar. Emita a OC antes, ou descarte o recebimento.
          </p>
        ) : (
          <label className={caixa.campo}>
            <span>
              OC<span className={caixa.obrigatorio}>*</span>
            </span>
            <select value={r.ocId} onChange={(e) => mudar({ ocId: e.target.value })}>
              {ocs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.numero} — {fornecedorNome.get(o.fornecedor_id) ?? ''} · {o.status}
                </option>
              ))}
            </select>
          </label>
        )}

        {!item.notaFiscal && (
          <label className={caixa.campo}>
            <span>
              Nota fiscal (o mestre mandou só a foto)<span className={caixa.obrigatorio}>*</span>
            </span>
            <input type="text" value={r.notaFiscal} onChange={(e) => mudar({ notaFiscal: e.target.value })} />
          </label>
        )}

        <p className={caixa.quem} data-integridade-do-mestre="">
          Integridade do material: <strong>{item.chegouComEstrago ? 'Não Conforme' : 'Conforme'}</strong>, pelo que o
          mestre disse.
        </p>

        {PERGUNTAS.map((p) => (
          <fieldset key={p.chave} className={caixa.pergunta}>
            <legend>{p.texto}</legend>
            <label>
              <input type="radio" name={p.chave} checked={r[p.chave] === true} onChange={() => mudar({ [p.chave]: true })} />
              {p.sim}
            </label>
            <label>
              <input type="radio" name={p.chave} checked={r[p.chave] === false} onChange={() => mudar({ [p.chave]: false })} />
              {p.nao}
            </label>
            {/* A primeira vez que a sigla aparece nesta caixa (CTO-D728 §1). */}
            {p.chave === 'ocEcrConforme' && <AjudaDaEcr />}
          </fieldset>
        ))}

        <label className={caixa.campo}>
          <span>Observação (opcional)</span>
          <textarea rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
        </label>

        {nc >= 2 && (
          <>
            <p className={caixa.aviso}>
              {nc} respostas "Não Conforme": a tratativa é obrigatória, e a entrega fica nas tratativas abertas até
              quem revisa as ECRs dar ciência.
            </p>
            <label className={caixa.campo}>
              <span>
                Tratativa: o que foi feito com a entrega<span className={caixa.obrigatorio}>*</span>
              </span>
              <textarea rows={3} value={r.tratativa} onChange={(e) => mudar({ tratativa: e.target.value })} />
            </label>
          </>
        )}

        {erro && (
          <p className={caixa.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={caixa.acoes}>
          <Button variant="outline" onClick={aoFechar} disabled={gravando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={() => void gravar()} loading={gravando} disabled={ocs.length === 0}>
            Ligar à OC
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DescartarDialogo({
  item, aoFechar, aoDescartar,
}: {
  item: SemPedidoNaFila;
  aoFechar: () => void;
  aoDescartar: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  async function gravar() {
    if (!motivo.trim()) {
      setErro('Escreva o motivo de descartar.');
      return;
    }
    setErro('');
    setGravando(true);
    try {
      await descartarSemPedido(item.id, motivo);
      aoDescartar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao descartar.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="descartar-titulo">
      <div className={caixa.caixa} data-dialogo-descartar="">
        <h3 id="descartar-titulo" className={caixa.titulo}>
          Descartar o recebimento
        </h3>
        <p className={caixa.quem}>
          {item.obra} · chegou em {formatDate(item.recebidoEm)} · {item.oQueChegou}
        </p>
        <label className={caixa.campo}>
          <span>
            Motivo<span className={caixa.obrigatorio}>*</span>
          </span>
          <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </label>
        {erro && (
          <p className={caixa.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={caixa.acoes}>
          <Button variant="outline" onClick={aoFechar} disabled={gravando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={() => void gravar()} loading={gravando}>
            Descartar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
