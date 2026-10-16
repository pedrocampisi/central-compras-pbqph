/**
 * "Entregas sem papel do fornecedor", em Recebimentos (CTO-D840 §2.5, D845 §2):
 * a entrega que a ECR manda vir com papel, e que chegou sem ele. Uma linha por
 * entrega e ECR, da mais antiga para a mais nova, com as palavras da ECR e o
 * porquê do banco. Duas ações por linha:
 *
 * - **Anexar papel:** a janela do "Anexar papel", pela entrega
 *   (`avaliacao_id`). Na ECR com a marca "a cada entrega", ela vem em "deste
 *   lote", sem escolha.
 * - **Não se aplica a esta entrega:** com o motivo, que é obrigatório. A janela
 *   diz, antes de gravar, que a marca não se desfaz.
 *
 * Depois de cada ação, a lista lê de novo. Só quem emite OC a vê: é a régua da
 * lista no banco.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { Loader } from '../../components/Loader/Loader';
import { blocosDaSecao, linhaDoDocumento } from '../../domain/ecr';
import {
  NAO_SE_DESFAZ, chaveDaLinha, problemaDoNaoSeAplica, quemEhAEntrega, rotuloDaLinha, type EntregaSemPapel,
} from '../../domain/entregasSemPapel';
import { formatDate } from '../../domain/format';
import { marcarNaoSeAplica } from '../../services/supabase/entregasSemPapel';
import { useDataStore } from '../../stores/useDataStore';
import { useEntregasSemPapelStore } from '../../stores/useEntregasSemPapelStore';
import { useRegistrosStore } from '../../stores/useRegistrosStore';
import { useUiStore } from '../../stores/useUiStore';
import { AnexarPapelDialogo } from '../qualificacao/DialogosDoRegistro';
import caixa from '../ordens-compra/RegistrarEntregaDialogo.module.css';
import styles from './RecebimentosPage.module.css';

export function EntregasSemPapel() {
  const linhas = useEntregasSemPapelStore((s) => s.linhas);
  const erro = useEntregasSemPapelStore((s) => s.erro);
  const carregar = useEntregasSemPapelStore((s) => s.carregar);
  const ocs = useDataStore((s) => s.data?.ordens_compra);
  const [anexando, setAnexando] = useState<EntregaSemPapel | null>(null);
  const [marcando, setMarcando] = useState<EntregaSemPapel | null>(null);

  // Lê ao abrir a tela: o número do menu pode ser de antes.
  useEffect(() => {
    void carregar();
  }, [carregar]);

  /** O papel novo tira da lista as linhas que ele alcança: quem diz é o banco, lendo de novo. */
  function depoisDaAcao(mensagem: string) {
    useUiStore.getState().showToast(mensagem, 'success');
    void carregar();
  }

  const fornecedorDa = (l: EntregaSemPapel) => l.fornecedorId || ocs?.find((o) => o.id === l.ocId)?.fornecedor_id || '';

  return (
    <section className={styles.semPapel} aria-labelledby="sem-papel-titulo" data-entregas-sem-papel="">
      <h3 id="sem-papel-titulo" className={styles.tituloDaSecao}>
        Entregas sem papel do fornecedor
      </h3>
      <p className={styles.subDaSecao}>
        O papel que a ECR pede e que ainda não chegou. Anexe quando ele chegar, ou marque que não se aplica a esta entrega.
      </p>

      {erro && (
        <div className={caixa.erro} role="alert">
          Não consegui ler as entregas sem papel: {erro}{' '}
          <Button variant="outline" size="sm" onClick={() => void carregar()}>
            Tentar de novo
          </Button>
        </div>
      )}
      {!erro && linhas === null && <Loader texto="Lendo as entregas…" />}
      {!erro && linhas?.length === 0 && <p className={styles.nada}>Nenhuma entrega sem papel.</p>}

      {!erro && linhas && linhas.length > 0 && (
        <ul className={styles.lista}>
          {linhas.map((l) => (
            <li key={chaveDaLinha(l)} className={styles.cartao} data-sem-papel={chaveDaLinha(l)}>
              <div className={styles.cabeca}>
                <strong>{rotuloDaLinha(l)}</strong>
                <span>OC {l.numero || '(sem número)'}</span>
                <span>{l.obra}</span>
                <span>Chegou em {formatDate(l.recebidoEm)}</span>
              </div>
              <dl className={styles.dados}>
                <dt>Fornecedor</dt>
                <dd>{l.fornecedor}</dd>
                <dt>Nota</dt>
                <dd>{l.notaFiscal || 'Sem número'}</dd>
                <dt>Recebido por</dt>
                <dd>{l.avaliadoPorNome || 'Sem nome'}</dd>
                <dt>Por que pede</dt>
                <dd>{l.porque}</dd>
                {l.observacao && (
                  <>
                    <dt>Observação</dt>
                    <dd>{l.observacao}</dd>
                  </>
                )}
              </dl>
              {l.linhas.length > 0 && (
                <div className={styles.oQuePede} data-palavras-da-ecr="">
                  <span className={styles.rotuloDoQuePede}>O que a ECR pede:</span>
                  {blocosDaSecao(l.linhas).map((b, i) =>
                    b.tipo === 'lista' ? (
                      <ul key={i}>
                        {b.itens.map((it, j) => (
                          <li key={j}>{linhaDoDocumento(it)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p key={i}>{linhaDoDocumento(b.item)}</p>
                    ),
                  )}
                </div>
              )}
              <div className={styles.acoes}>
                {fornecedorDa(l) && (
                  <Button variant="outline" size="sm" onClick={() => setAnexando(l)}>
                    Anexar papel
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setMarcando(l)}>
                  Não se aplica a esta entrega
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {anexando && (
        <AnexarPapelDialogo
          quem={quemEhAEntrega(anexando)}
          porOnde="entrega"
          ecrs={[{ id: anexando.ecrId, rotulo: rotuloDaLinha(anexando), aCadaEntrega: anexando.aCadaEntrega }]}
          // A OC da entrega é o envelope; a entrega é a que o papel cobre (D840 §5, pedidos 3 e 4).
          onde={() => ({
            ocId: anexando.ocId,
            fornecedorId: fornecedorDa(anexando),
            avaliacaoId: anexando.avaliacaoId,
            ...(anexando.posicoes.length ? { posicoes: anexando.posicoes } : {}),
          })}
          aoFechar={() => setAnexando(null)}
          aoGuardar={() => {
            void useRegistrosStore.getState().carregar(true);
            void carregar();
          }}
        />
      )}
      {marcando && (
        <NaoSeAplicaDialogo
          linha={marcando}
          aoFechar={() => setMarcando(null)}
          aoMarcar={() => {
            setMarcando(null);
            depoisDaAcao('Marcado: não se aplica a esta entrega.');
          }}
        />
      )}
    </section>
  );
}

function NaoSeAplicaDialogo({
  linha, aoFechar, aoMarcar,
}: {
  linha: EntregaSemPapel;
  aoFechar: () => void;
  aoMarcar: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  async function gravar() {
    const problema = problemaDoNaoSeAplica(motivo);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro('');
    setGravando(true);
    try {
      await marcarNaoSeAplica(linha.avaliacaoId, linha.ecrId, motivo);
      aoMarcar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'A marca não foi gravada.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="nao-se-aplica-titulo">
      <div className={caixa.caixa} data-dialogo-nao-se-aplica="">
        <h3 id="nao-se-aplica-titulo" className={caixa.titulo}>
          Não se aplica a esta entrega
        </h3>
        <p className={caixa.quem}>{quemEhAEntrega(linha)}</p>
        <p className={caixa.quem}>{rotuloDaLinha(linha)}</p>
        <label className={caixa.campo}>
          <span>
            Motivo<span className={caixa.obrigatorio}>*</span>
          </span>
          <textarea
            rows={3}
            value={motivo}
            placeholder="Ex.: é compensado, e a ECR pede o papel só da madeira serrada."
            onChange={(e) => setMotivo(e.target.value)}
          />
        </label>
        <p className={caixa.aviso} data-nao-se-desfaz="">
          {NAO_SE_DESFAZ}
        </p>
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
            Marcar que não se aplica
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
