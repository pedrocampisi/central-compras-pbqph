/**
 * A avaliação no recebimento (PS.02, SiAC 8.4.1.2; CTO-D604 §3.2): o
 * "Entregue" do Histórico abre esta caixa, e a OC só vai a entregue com ela.
 *
 * As perguntas são as do mestre (CTO-D1039, palavra do Pedro de 12/11: "Sim,
 * as duas"), lidas de `PERGUNTAS_DO_MESTRE`, uma fonte só para as duas telas.
 * O que se grava não muda: as três respostas são as três do PS.02, e o PDF do
 * auditor continua com as palavras dele. Ficam o que só o escritório tem: a
 * nota digitada e o dia do recebimento, que pode ser passado.
 *
 * O "Veio a quantidade toda?" usa a mesma peça do mestre: o tique em cada
 * peça, já aberto (CTO-D1036e), e o quanto veio da sem tique (D794), que vai
 * no `itens` da mesma `registrar_entrega`.
 * Com duas ou mais "Não", o "O que aconteceu?" é a tratativa, obrigatória, e a
 * entrega fica nas tratativas abertas até quem revisa ECR dar ciência.
 *
 * Quando a OC já tem entrega, o alto da caixa diz qual, para ninguém registrar
 * a mesma duas vezes (CTO-D1039 §2.4).
 *
 * A avaliação e o "entregue" são uma escrita só no banco
 * (`registrar_entrega`): não há OC entregue sem avaliação, nem avaliação
 * gravada com a OC parada. OC já entregue aceita outra entrega (a parcial).
 */

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { hojeEmSaoPaulo } from '../../domain/ecr';
import {
  PERGUNTAS_DO_MESTRE, SEM_RESPOSTA, avaliacaoDoEscritorio, cartaoDoEscritorio, contaPorItem, contagemDoSoUmaParte, itensDoEnvio, naosDoMestre,
  oQueAconteceuObrigatorio, problemaDaContagem, problemaDaEntregaDoEscritorio, respostaDosTiques, tiquesDaResposta,
  type ContagemDoMestre, type RespostasDoMestre,
} from '../../domain/recebimento';
import { formatDate } from '../../domain/format';
import { registrarEntrega, type AvaliacaoGravada } from '../../services/supabase/qualificacao';
import { recarregarDados } from '../../services/supabase/sync';
import { useUiStore } from '../../stores/useUiStore';
import type { OrdemCompra } from '../../domain/types';
import { AjudaDaEcr } from '../../components/Ajuda/AjudaDaEcr';
import { ConferirItemPorItem } from '../recebimento/MaterialAChegar';
import styles from './RegistrarEntregaDialogo.module.css';
import { useFocoPreso } from '../../hooks/useFocoPreso';

interface Props {
  oc: Pick<OrdemCompra, 'id' | 'numero' | 'versao' | 'status' | 'obra_id' | 'entrega_prevista' | 'itens'>;
  fornecedor: string;
  obra: string;
  /** As entregas que a OC já tem, na ordem em que vieram; vazio quando é a primeira. */
  anteriores?: readonly AvaliacaoGravada[];
  aoFechar: () => void;
}

export function RegistrarEntregaDialogo({ oc, fornecedor, obra, anteriores = [], aoFechar }: Props) {
  const preso = useFocoPreso<HTMLDivElement>();
  const hoje = hojeEmSaoPaulo();
  const showToast = useUiStore((s) => s.showToast);
  const [notaFiscal, setNotaFiscal] = useState('');
  const [recebidoEm, setRecebidoEm] = useState(hoje);
  const [r, setR] = useState<RespostasDoMestre>(SEM_RESPOSTA);
  const [texto, setTexto] = useState('');
  const [contagem, setContagem] = useState<ContagemDoMestre>({});
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  const cartao = useMemo(() => cartaoDoEscritorio(oc, obra, fornecedor), [oc, obra, fornecedor]);
  const comItens = contaPorItem(cartao);
  const tiques = useMemo(() => tiquesDaResposta(cartao, r.tudo, contagem), [cartao, r.tudo, contagem]);
  function ticar(posicao: number, veio: boolean) {
    const resposta = respostaDosTiques(cartao, { ...tiques, [posicao]: veio }, contagem, r.tudo);
    setR((x) => ({ ...x, tudo: resposta.tudo }));
    setContagem(resposta.contagem);
  }

  const outra = oc.status === 'entregue';
  const naos = naosDoMestre(r);
  const comTratativa = oQueAconteceuObrigatorio(r);

  function responder(chave: keyof RespostasDoMestre, valor: boolean) {
    // Na quantidade, o botão mexe nos tiques: o "Sim" tica todas; o "Só uma parte" abre o quanto veio da sem tique.
    if (chave === 'tudo' && comItens) setContagem(valor ? {} : contagemDoSoUmaParte(cartao, r.tudo, contagem));
    setR((x) => ({ ...x, [chave]: valor }));
  }

  async function gravar() {
    const problema = problemaDaEntregaDoEscritorio(r, notaFiscal, recebidoEm, hoje, texto, problemaDaContagem(cartao, contagem));
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    setGravando(true);
    try {
      const resultado = await registrarEntrega(
        oc.id,
        oc.versao,
        avaliacaoDoEscritorio(r, notaFiscal, texto, recebidoEm),
        r.tudo !== false,
        itensDoEnvio(cartao, r.tudo, contagem),
      );
      try {
        await recarregarDados();
      } catch {
        showToast('A entrega foi registrada, mas a tela não recarregou. Recarregue a página.', 'warning');
        aoFechar();
        return;
      }
      aoFechar();
      showToast(
        `OC ${oc.numero}: entrega registrada.` +
          (resultado.tratativaAberta ? ' A tratativa ficou aberta para quem revisa as ECRs.' : ''),
        resultado.tratativaAberta ? 'warning' : 'success',
      );
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao gravar a avaliação.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal ref={preso} aria-labelledby="entrega-titulo">
      <div className={styles.caixa} data-dialogo-entrega="">
        <h3 id="entrega-titulo" className={styles.titulo}>
          {outra ? 'Registrar outra entrega' : 'Registrar a entrega'} — OC {oc.numero}
        </h3>
        <p className={styles.quem}>
          {fornecedor} · {obra}
        </p>

        {anteriores.length > 0 && (
          <div className={styles.aviso} data-aviso-entrega-anterior="" role="note">
            <strong>{anteriores.length === 1 ? 'Esta OC já tem uma entrega registrada:' : `Esta OC já tem ${anteriores.length} entregas registradas:`}</strong>
            <ul className={styles.anteriores}>
              {anteriores.map((e) => (
                <li key={e.id}>
                  {formatDate(e.recebidoEm)} · nota {e.notaFiscal || '(sem número)'} · {e.pelaObra ? 'pelo encarregado' : 'pelo escritório'}
                  {e.avaliadoPorNome ? ` (${e.avaliadoPorNome})` : ''}
                  {e.chegouTudo ? '' : ' · só uma parte'}
                </li>
              ))}
            </ul>
            Só registre de novo se chegou outra parte.
          </div>
        )}

        <div className={styles.linhaDeCampos}>
          <label className={styles.campo}>
            <span>
              Nota fiscal<span className={styles.obrigatorio}>*</span>
            </span>
            <input type="text" value={notaFiscal} onChange={(e) => setNotaFiscal(e.target.value)} />
          </label>
          <label className={styles.campo}>
            <span>
              Recebido em<span className={styles.obrigatorio}>*</span>
            </span>
            <input type="date" max={hoje} value={recebidoEm} onChange={(e) => setRecebidoEm(e.target.value)} />
          </label>
        </div>

        {PERGUNTAS_DO_MESTRE.map((p, i) => (
          <fieldset key={p.chave} className={styles.pergunta} data-pergunta={i + 1}>
            <legend>
              {p.texto}
              {/* A primeira vez que a sigla aparece nesta caixa (CTO-D728 §1). */}
              {p.chave === 'oQueFoiPedido' && <AjudaDaEcr />}
            </legend>
            {p.dica && <p className={styles.dica}>{p.dica}</p>}
            <label>
              <input type="radio" name={p.chave} checked={r[p.chave] === true} onChange={() => responder(p.chave, true)} />
              {p.sim}
            </label>
            <label>
              <input type="radio" name={p.chave} checked={r[p.chave] === false} onChange={() => responder(p.chave, false)} />
              {p.nao}
            </label>
            {p.chave === 'tudo' && comItens && (
              <div className={styles.inteira}>
                <ConferirItemPorItem
                  cartao={cartao}
                  tiques={tiques}
                  soUmaParte={r.tudo === false}
                  contagem={contagem}
                  aoTicar={ticar}
                  aoEscrever={(posicao, escrito) => setContagem((c) => ({ ...c, [posicao]: escrito }))}
                />
              </div>
            )}
          </fieldset>
        ))}

        {comTratativa && (
          <p className={styles.aviso} data-aviso-tratativa="">
            {naos} respostas "Não": conte o que aconteceu. A entrega fica nas tratativas abertas até quem revisa as
            ECRs dar ciência.
          </p>
        )}
        <label className={styles.campo}>
          <span>
            O que aconteceu?
            {comTratativa ? <span className={styles.obrigatorio}>*</span> : ' (se quiser)'}
          </span>
          <textarea rows={comTratativa ? 3 : 2} value={texto} onChange={(e) => setTexto(e.target.value)} />
        </label>

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={styles.acoes}>
          <Button variant="outline" onClick={aoFechar} disabled={gravando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={gravar} loading={gravando}>
            Registrar entrega
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
