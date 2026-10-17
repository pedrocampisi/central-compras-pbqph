/**
 * O que a leitura do orçamento pôs no alto da OC (CTO-D805 §2), na tela:
 *
 * - o "Confira" embaixo de cada campo que a IA preencheu, com o "Está certo"
 *   para confirmar. Mexer no campo também tira o aviso;
 * - o resumo no alto: por que o fornecedor ficou vazio, o que a IA não pisou
 *   porque a pessoa já tinha preenchido, e a dúvida da leitura;
 * - o total do orçamento ao lado do total da OC, com a diferença.
 *
 * É aviso da TELA, como o "confira" dos itens: não vai ao banco nem ao PDF, e
 * some ao salvar.
 */

import { Icon } from '../../components/Icon/Icon';
import { formatBrl } from '../../domain/format';
import { NOME_DO_CAMPO, conferenciaDoTotal, type CampoDoAlto } from '../../domain/cabecalhoLido';
import styles from './NovaOcPage.module.css';

export function ConfiraDoCampo({ campo, texto, onConfirmar, comNome = false }: {
  campo: CampoDoAlto;
  texto: string | undefined;
  onConfirmar: (c: CampoDoAlto) => void;
  /** Fora do campo (os totais), o aviso diz de qual campo é. */
  comNome?: boolean;
}) {
  if (!texto) return null;
  return (
    <span className={styles.confiraDoAlto} data-confira-do-alto={campo}>
      <Icon name="alerta" size={12} /> <span>{comNome && <strong>{NOME_DO_CAMPO[campo]}: </strong>}{texto}</span>
      <button type="button" className={styles.estaCerto} onClick={() => onConfirmar(campo)}>
        Está certo
      </button>
    </span>
  );
}

export interface ResumoDoAltoProps {
  semFornecedor: string;
  naoPisou: Partial<Record<CampoDoAlto, string>>;
  duvida: string;
}

export function ResumoDoAlto({ semFornecedor, naoPisou, duvida }: ResumoDoAltoProps) {
  const ficou = Object.entries(naoPisou) as [CampoDoAlto, string][];
  if (!semFornecedor && ficou.length === 0 && !duvida) return null;
  return (
    <div className={styles.resumoDoAlto} role="status" data-resumo-do-alto="">
      {semFornecedor && (
        <p data-sem-fornecedor="">
          <strong>Fornecedor:</strong> ficou vazio, porque {semFornecedor}. Escolha na lista.
        </p>
      )}
      {ficou.map(([c, papel]) => (
        <p key={c} data-nao-pisou={c}>
          <strong>{NOME_DO_CAMPO[c]}:</strong> ficou o que você já tinha posto. O orçamento diz {papel}.
        </p>
      ))}
      {duvida && (
        <p data-duvida-do-alto="">
          <strong>A leitura pede:</strong> {duvida}
        </p>
      )}
    </div>
  );
}

/** O total do orçamento ao lado do total da OC (a conferência que o Pedro pediu). */
export function ConferenciaDoTotal({ totalDoOrcamento, totalDaOc }: { totalDoOrcamento: number | null; totalDaOc: number }) {
  const c = conferenciaDoTotal(totalDoOrcamento, totalDaOc);
  if (!c) return null;
  return (
    <div className={styles.conferenciaDoTotal} data-conferencia-do-total={c.bate ? 'bate' : 'difere'}>
      <span>Total do orçamento: <strong>{formatBrl(c.orcamento)}</strong></span>
      <span>Total da OC: <strong>{formatBrl(c.oc)}</strong></span>
      <span data-diferenca="">
        {c.bate ? 'Os dois batem.' : <>Diferença: <strong>{formatBrl(Math.abs(c.diferenca))}</strong> (a OC {c.diferenca > 0 ? 'passa' : 'fica abaixo'} do orçamento)</>}
      </span>
    </div>
  );
}
