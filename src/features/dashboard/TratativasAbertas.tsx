/**
 * As tratativas abertas no Painel (CTO-D604 §3.2, D613 §3): as entregas com
 * duas ou mais "Não Conforme", até quem revisa as ECRs dar ciência.
 *
 * O bloco só aparece para quem pode revisar ECR — o banco responde, e na
 * dúvida ele não aparece. Quem barra de fato é o banco: a
 * `dar_ciencia_tratativa` recusa com 42501, e a recusa vira frase de gente.
 *
 * Com a máscara da D599 ligada, as tratativas vêm só da obra dela (a carga
 * já filtra).
 */

import { useEffect, useState } from 'react';
import { Button } from '../../components/Button/Button';
import { dataBr } from '../../domain/qualificacao';
import { darCienciaTratativa, type Tratativa } from '../../services/supabase/qualificacao';
import { podeRevisarEcr } from '../../services/supabase/ecrs';
import { recarregarDados } from '../../services/supabase/sync';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDataStore } from '../../stores/useDataStore';
import { useQualificacaoStore } from '../../stores/useQualificacaoStore';
import { useUiStore } from '../../stores/useUiStore';
import { AjudaDaEcr } from '../../components/Ajuda/AjudaDaEcr';
import styles from './TratativasAbertas.module.css';

/** As perguntas que deram "Não Conforme", na ordem da avaliação. */
function oQueNaoConformou(t: Tratativa): string {
  return [
    t.prazoConforme ? '' : 'prazo',
    t.integridadeConforme ? '' : 'integridade',
    t.ocEcrConforme ? '' : 'OC e ECR',
  ]
    .filter(Boolean)
    .join(', ');
}

export function TratativasAbertas() {
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

  const dados = useQualificacaoStore((s) => s.dados);
  const data = useDataStore((s) => s.data);

  if (!podeRevisar) return null;

  const tratativas = dados?.tratativas ?? [];
  const fornecedor = (id: string) => data?.fornecedores.find((f) => f.id === id)?.razao_social ?? '—';
  const obra = (id: string) => data?.obras.find((o) => o.id === id)?.nome ?? '—';

  return (
    <section className={styles.bloco} data-tratativas-abertas="">
      <div className={styles.cabeca}>
        <h3>Tratativas abertas{dados ? ` (${tratativas.length})` : ''}</h3>
        {/* A sigla aparece nas linhas de "OC e ECR" (CTO-D728 §1). */}
        {tratativas.some((t) => !t.ocEcrConforme) && <AjudaDaEcr />}
      </div>
      {!dados ? (
        <p className={styles.vazio} role="alert">
          As tratativas não carregaram. Recarregue a página.
        </p>
      ) : tratativas.length === 0 ? (
        <p className={styles.vazio}>Nenhuma entrega esperando ciência.</p>
      ) : (
        <ul className={styles.lista}>
          {tratativas.map((t) => (
            <Linha key={t.avaliacaoId} t={t} fornecedor={fornecedor(t.fornecedorId)} obra={obra(t.intervencaoId)} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Linha({ t, fornecedor, obra }: { t: Tratativa; fornecedor: string; obra: string }) {
  const showToast = useUiStore((s) => s.showToast);
  const [aberta, setAberta] = useState(false);
  const [nota, setNota] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [gravando, setGravando] = useState(false);

  async function darCiencia() {
    if (!nota.trim()) {
      setErro('Escreva a nota da ciência.');
      return;
    }
    setErro(null);
    setGravando(true);
    try {
      await darCienciaTratativa(t.avaliacaoId, nota);
      try {
        await recarregarDados();
      } catch {
        showToast('A ciência foi gravada, mas a tela não recarregou. Recarregue a página.', 'warning');
        return;
      }
      showToast(`Ciência registrada na OC ${t.numero}.`, 'success');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao gravar a ciência.');
      setGravando(false);
    }
  }

  return (
    <li className={styles.item} data-tratativa={t.avaliacaoId}>
      <div className={styles.cabeca}>
        <strong>
          OC {t.numero} — {fornecedor}
        </strong>
        <span className={styles.meta}>
          {obra} · NF {t.notaFiscal} · recebida em {dataBr(t.recebidoEm)}
          {t.avaliadoPorNome && <> · avaliada por {t.avaliadoPorNome}</>}
        </span>
      </div>
      <p className={styles.nc}>
        {t.naoConformes} "Não Conforme": {oQueNaoConformou(t)}.
      </p>
      <p className={styles.texto}>
        <span>Tratativa:</span> {t.tratativa}
      </p>
      {t.observacao && (
        <p className={styles.texto}>
          <span>Observação:</span> {t.observacao}
        </p>
      )}
      {!aberta ? (
        <div className={styles.acoes}>
          <Button variant="outline" size="sm" onClick={() => setAberta(true)}>
            Dar ciência
          </Button>
        </div>
      ) : (
        <div className={styles.ciencia}>
          <textarea
            aria-label={`Nota da ciência da OC ${t.numero}`}
            rows={2}
            placeholder="O que foi visto e decidido."
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
          {erro && (
            <p className={styles.erro} role="alert">
              {erro}
            </p>
          )}
          <div className={styles.acoes}>
            <Button variant="outline" size="sm" onClick={() => setAberta(false)} disabled={gravando}>
              Voltar
            </Button>
            <Button variant="outline" size="sm" onClick={() => void darCiencia()} loading={gravando}>
              Gravar ciência
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
