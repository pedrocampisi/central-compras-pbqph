/**
 * A avaliação no recebimento (PS.02, SiAC 8.4.1.2; CTO-D604 §3.2): o
 * "Entregue" do Histórico abre esta caixa, e a OC só vai a entregue com ela.
 *
 * Número da nota, dia do recebimento e três respostas Conforme / Não
 * Conforme, mais a observação. Com duas ou mais "Não Conforme", a tratativa é
 * obrigatória, e a entrega fica nas tratativas abertas até quem revisa ECR
 * dar ciência.
 *
 * A avaliação e o "entregue" são uma escrita só no banco
 * (`registrar_entrega`): não há OC entregue sem avaliação, nem avaliação
 * gravada com a OC parada. OC já entregue aceita outra entrega (a parcial).
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { hojeEmSaoPaulo } from '../../domain/ecr';
import { avaliacaoParaGravar, naoConformes, pedeTratativa, problemaDaAvaliacao, type Avaliacao } from '../../domain/qualificacao';
import { registrarEntrega } from '../../services/supabase/qualificacao';
import { recarregarDados } from '../../services/supabase/sync';
import { useUiStore } from '../../stores/useUiStore';
import type { OrdemCompra } from '../../domain/types';
import styles from './RegistrarEntregaDialogo.module.css';

const PERGUNTAS = [
  { chave: 'prazoConforme', texto: 'Prazo de entrega' },
  { chave: 'integridadeConforme', texto: 'Integridade do material (sem avarias)' },
  { chave: 'ocEcrConforme', texto: 'Confere com a OC e com a ECR' },
] as const;

interface Props {
  oc: Pick<OrdemCompra, 'id' | 'numero' | 'versao' | 'status'>;
  fornecedor: string;
  obra: string;
  aoFechar: () => void;
}

export function RegistrarEntregaDialogo({ oc, fornecedor, obra, aoFechar }: Props) {
  const hoje = hojeEmSaoPaulo();
  const showToast = useUiStore((s) => s.showToast);
  const [a, setA] = useState<Avaliacao>({
    notaFiscal: '',
    recebidoEm: hoje,
    prazoConforme: null,
    integridadeConforme: null,
    ocEcrConforme: null,
    observacao: '',
    tratativa: '',
  });
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  const outra = oc.status === 'entregue';
  const nc = naoConformes(a);
  const comTratativa = pedeTratativa(a);

  function mudar(parte: Partial<Avaliacao>) {
    setA((x) => ({ ...x, ...parte }));
  }

  async function gravar() {
    const problema = problemaDaAvaliacao(a, hoje);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    setGravando(true);
    try {
      const r = await registrarEntrega(oc.id, oc.versao, avaliacaoParaGravar(a));
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
          (r.tratativaAberta ? ' A tratativa ficou aberta para quem revisa as ECRs.' : ''),
        r.tratativaAberta ? 'warning' : 'success',
      );
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao gravar a avaliação.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="entrega-titulo">
      <div className={styles.caixa} data-dialogo-entrega="">
        <h3 id="entrega-titulo" className={styles.titulo}>
          {outra ? 'Registrar outra entrega' : 'Registrar a entrega'} — OC {oc.numero}
        </h3>
        <p className={styles.quem}>
          {fornecedor} · {obra}
        </p>

        <div className={styles.linhaDeCampos}>
          <label className={styles.campo}>
            <span>
              Nota fiscal<span className={styles.obrigatorio}>*</span>
            </span>
            <input type="text" value={a.notaFiscal} onChange={(e) => mudar({ notaFiscal: e.target.value })} />
          </label>
          <label className={styles.campo}>
            <span>
              Recebido em<span className={styles.obrigatorio}>*</span>
            </span>
            <input type="date" max={hoje} value={a.recebidoEm} onChange={(e) => mudar({ recebidoEm: e.target.value })} />
          </label>
        </div>

        {PERGUNTAS.map((p, i) => (
          <fieldset key={p.chave} className={styles.pergunta} data-pergunta={i + 1}>
            <legend>{p.texto}</legend>
            <label>
              <input type="radio" name={p.chave} checked={a[p.chave] === true} onChange={() => mudar({ [p.chave]: true })} />
              Conforme
            </label>
            <label>
              <input type="radio" name={p.chave} checked={a[p.chave] === false} onChange={() => mudar({ [p.chave]: false })} />
              Não Conforme
            </label>
          </fieldset>
        ))}

        <label className={styles.campo}>
          <span>Observação (opcional)</span>
          <textarea rows={2} value={a.observacao} onChange={(e) => mudar({ observacao: e.target.value })} />
        </label>

        {comTratativa && (
          <>
            <p className={styles.aviso} data-aviso-tratativa="">
              {nc} respostas "Não Conforme": a tratativa é obrigatória, e a entrega fica nas tratativas abertas até
              quem revisa as ECRs dar ciência.
            </p>
            <label className={styles.campo}>
              <span>
                Tratativa: o que foi feito com a entrega<span className={styles.obrigatorio}>*</span>
              </span>
              <textarea rows={3} value={a.tratativa} onChange={(e) => mudar({ tratativa: e.target.value })} />
            </label>
          </>
        )}

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
