/**
 * A tela de editar uma ECR (CTO-D589 §4.2, D596 §3). Só o Pedro chega aqui: o
 * botão "Editar" só aparece para ele, e o banco recusa os outros de qualquer
 * jeito. Salvar é aprovar: a revisão sobe um número, com a data de hoje, e a
 * anterior fica no histórico.
 *
 * A tela confere as regras da `compras.revisar_ecr` antes de mandar e aponta
 * a linha com defeito (a proposta do §6 da nossa carta, aceita na D596): a
 * pessoa não descobre o erro pela recusa do banco.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Ecr } from '../../domain/types';
import {
  hojeEmSaoPaulo,
  limparParaGravar,
  moveLinha,
  mudaLinha,
  numeroDaSecao,
  numeroNaFrase,
  poeLinha,
  problemasDaRevisao,
  resumoDaRevisao,
  tiraLinha,
} from '../../domain/ecr';
import { formatDate } from '../../domain/format';
import { temMudancaNaRevisao, useRevisaoEcrStore } from '../../stores/useRevisaoEcrStore';
import { useUiStore } from '../../stores/useUiStore';
import { confirmAsync } from '../../stores/useConfirmStore';
import { revisarEcr } from '../../services/supabase/ecrs';
import { recarregarDados } from '../../services/supabase/sync';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import styles from './EditorDaEcr.module.css';

/** O endereço do campo de texto de uma linha: é para lá que a tela leva a pessoa. */
function idDoTexto(ecrId: number, s: number, l: number): string {
  return `ecr-${ecrId}-secao-${s}-linha-${l}-texto`;
}

export function EditorDaEcr({ ecr }: { ecr: Ecr }) {
  const vigente = useRevisaoEcrStore((s) => s.vigente);
  const rascunho = useRevisaoEcrStore((s) => s.rascunho);
  const mudar = useRevisaoEcrStore((s) => s.mudar);
  const fechar = useRevisaoEcrStore((s) => s.fechar);
  // Os problemas só aparecem depois do primeiro "Salvar": antes disso, a
  // pessoa ainda está escrevendo. Depois, somem assim que ela conserta.
  const [tentou, setTentou] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  if (!vigente || !rascunho) return null;

  const problemas = tentou ? problemasDaRevisao(vigente, rascunho, ecr.revisao) : [];
  const daLinha = (s: number, l: number) => problemas.filter((p) => p.secao === s && p.linha === l);

  async function cancelar() {
    if (temMudancaNaRevisao(useRevisaoEcrStore.getState())) {
      const sair = await confirmAsync({
        title: 'Sair sem salvar?',
        message: `As mudanças que você fez se perdem. A ${ecr.codigo} continua como está, na Rev. ${ecr.revisao ?? '—'}.`,
        confirmLabel: 'Sair sem salvar',
        cancelLabel: 'Continuar editando',
        tone: 'danger',
      });
      if (!sair) return;
    }
    fechar();
  }

  function salvar() {
    setTentou(true);
    const achados = problemasDaRevisao(vigente!, rascunho!, ecr.revisao);
    if (achados.length === 0) {
      setConfirmando(true);
      return;
    }
    const primeiro = achados.find((p) => p.secao !== null && p.linha !== null);
    if (primeiro) document.getElementById(idDoTexto(ecr.id, primeiro.secao!, primeiro.linha!))?.focus();
  }

  return (
    <div className={styles.editor} data-editor="">
      <p className={styles.aviso}>
        Você está revisando a {ecr.codigo}, hoje na Rev. {ecr.revisao ?? '—'}. Salvar é aprovar: a revisão nova passa a
        valer, e a de agora fica no histórico.
      </p>

      {rascunho.map((secao, s) => (
        <fieldset key={s} className={styles.secao}>
          <legend>
            {numeroDaSecao(s)} {secao.titulo}
          </legend>

          {secao.itens.map((item, l) => {
            const seus = daLinha(s, l);
            const n = l + 1;
            const onde = `da linha ${n} da seção ${numeroNaFrase(s)}`;
            return (
              <div
                key={l}
                className={styles.linha}
                data-linha=""
                data-nota={item.numerado ? undefined : ''}
                data-com-problema={seus.length ? '' : undefined}
              >
                <span className={styles.numero} aria-hidden>
                  {n}
                </span>
                <input
                  className={styles.rotulo}
                  aria-label={`Rótulo ${onde}`}
                  placeholder="Rótulo (opcional)"
                  value={item.rotulo ?? ''}
                  onChange={(e) => mudar((x) => mudaLinha(x, s, l, { rotulo: e.target.value }))}
                />
                <textarea
                  id={idDoTexto(ecr.id, s, l)}
                  className={styles.texto}
                  aria-label={`Texto ${onde}`}
                  aria-invalid={seus.length ? true : undefined}
                  rows={2}
                  value={item.texto}
                  onChange={(e) => mudar((x) => mudaLinha(x, s, l, { texto: e.target.value }))}
                />
                <div className={styles.controles}>
                  <label className={styles.nota}>
                    <input
                      type="checkbox"
                      checked={!item.numerado}
                      onChange={(e) => mudar((x) => mudaLinha(x, s, l, { numerado: !e.target.checked }))}
                    />
                    Nota (fora da lista)
                  </label>
                  <button
                    type="button"
                    className={styles.icone}
                    aria-label={`Subir a linha ${n} da seção ${numeroNaFrase(s)}`}
                    disabled={l === 0}
                    onClick={() => mudar((x) => moveLinha(x, s, l, -1))}
                  >
                    <Icon name="chevron" size={16} className={styles.paraCima} />
                  </button>
                  <button
                    type="button"
                    className={styles.icone}
                    aria-label={`Descer a linha ${n} da seção ${numeroNaFrase(s)}`}
                    disabled={l === secao.itens.length - 1}
                    onClick={() => mudar((x) => moveLinha(x, s, l, 1))}
                  >
                    <Icon name="chevron" size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.icone}
                    aria-label={`Tirar a linha ${n} da seção ${numeroNaFrase(s)}`}
                    // A seção precisa de pelo menos uma linha (regra do banco).
                    disabled={secao.itens.length === 1}
                    onClick={() => mudar((x) => tiraLinha(x, s, l))}
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
                {seus.map((p, k) => (
                  <p key={k} className={styles.problema}>
                    <Icon name="alerta" size={14} />
                    {p.frase}
                  </p>
                ))}
              </div>
            );
          })}

          <Button variant="outline" size="sm" onClick={() => mudar((x) => poeLinha(x, s))}>
            <Icon name="plus" size={14} />
            Pôr linha na seção {numeroNaFrase(s)}
          </Button>
        </fieldset>
      ))}

      {problemas.length > 0 && (
        <div className={styles.problemas} role="alert" data-problemas="">
          <strong>A revisão ainda não pode ir:</strong>
          <ul>
            {problemas.map((p, k) => (
              <li key={k}>{p.frase}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.acoes}>
        <Button variant="outline" onClick={cancelar}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={salvar}>
          <Icon name="save" size={16} />
          Salvar revisão
        </Button>
      </div>

      {confirmando && <DialogoDaRevisao ecr={ecr} aoVoltar={() => setConfirmando(false)} />}
    </div>
  );
}

/** A confirmação: o que a revisão vai ser, e o que mudou (vai para o histórico). */
function DialogoDaRevisao({ ecr, aoVoltar }: { ecr: Ecr; aoVoltar: () => void }) {
  const rascunho = useRevisaoEcrStore((s) => s.rascunho);
  const fechar = useRevisaoEcrStore((s) => s.fechar);
  const showToast = useUiStore((s) => s.showToast);
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  async function gravar() {
    if (!rascunho) return;
    if (!descricao.trim()) {
      setErro('Escreva o que mudou: é a descrição desta revisão no histórico.');
      return;
    }
    setErro(null);
    setGravando(true);
    try {
      const r = await revisarEcr(ecr.id, limparParaGravar(rascunho), descricao.trim());
      try {
        await recarregarDados();
      } catch {
        showToast('A revisão foi gravada, mas a tela não recarregou. Recarregue a página.', 'warning');
      }
      fechar();
      showToast(`${ecr.codigo} revisada: Rev. ${r.revisao}, emitida em ${formatDate(r.emitida_em)}.`, 'success');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao gravar a revisão.');
      setGravando(false);
    }
  }

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="revisao-titulo">
      <div className={styles.caixa} data-dialogo-revisao="">
        <h3 id="revisao-titulo" className={styles.tituloDoDialogo}>
          Gravar a revisão da {ecr.codigo}
        </h3>
        <p className={styles.resumo} data-resumo="">
          {resumoDaRevisao(ecr.revisao, hojeEmSaoPaulo())}
        </p>
        <label className={styles.rotuloDoCampo} htmlFor="revisao-descricao">
          O que mudou<span className={styles.obrigatorio}>*</span>
        </label>
        <textarea
          id="revisao-descricao"
          className={styles.descricao}
          rows={3}
          autoFocus
          value={descricao}
          aria-invalid={erro && !descricao.trim() ? true : undefined}
          placeholder="Ex.: a tolerância da dimensão passou a ±3 mm."
          onChange={(e) => setDescricao(e.target.value)}
        />
        <span className={styles.dica}>Vai para a coluna "Descrição" do histórico de revisões.</span>
        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}
        <div className={styles.acoesDoDialogo}>
          <Button variant="outline" onClick={aoVoltar} disabled={gravando}>
            Voltar
          </Button>
          <Button variant="primary" onClick={gravar} loading={gravando}>
            Gravar revisão
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
