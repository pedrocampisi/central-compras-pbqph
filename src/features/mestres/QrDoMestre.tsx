/**
 * O QR de entrada do mestre, grande, com o tempo que falta (CTO-D696 §4).
 *
 * O engenheiro mostra a tela do celular dele; o mestre aponta a câmera. O QR
 * leva à OC com o código depois do `#` (ver `domain/acessoPorQr`): no Android
 * entra na hora; no iPhone, a OC ensina a pôr o ícone, e o ícone lê este mesmo
 * QR. Vencido, o QR some da tela — não fica um desenho que não abre nada.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { acessoDoLink, enderecoDoQr, tempoQueFalta } from '../../domain/acessoPorQr';
import caixa from '../ordens-compra/RegistrarEntregaDialogo.module.css';
import { desenhoDoQr } from './desenhoDoQr';
import styles from './MestresPage.module.css';

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

interface Props {
  nome: string;
  link: string;
  venceEm: string;
  aoFechar: () => void;
  aoGerarOutro: () => void;
}

export function QrDoMestre({ nome, link, venceEm, aoFechar, aoGerarOutro }: Props) {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const desenho = useMemo(() => {
    const acesso = acessoDoLink(link);
    return desenhoDoQr(acesso ? enderecoDoQr(window.location.origin, acesso) : link);
  }, [link]);
  const falta = tempoQueFalta(venceEm, agora);

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal aria-labelledby="qr-titulo">
      <div className={`${caixa.caixa} ${styles.caixaDoQr}`} data-dialogo-qr="">
        <h3 id="qr-titulo" className={caixa.titulo}>
          QR de entrada — {nome}
        </h3>
        {falta ? (
          <>
            <p className={styles.instrucao}>Aponte a câmera do celular do mestre para o QR.</p>
            <svg
              className={styles.qr}
              viewBox={`0 0 ${desenho.lado} ${desenho.lado}`}
              role="img"
              aria-label={`QR de entrada de ${nome}`}
              shapeRendering="crispEdges"
              data-qr=""
            >
              <rect width={desenho.lado} height={desenho.lado} className={styles.qrFundo} />
              <path d={desenho.caminho} className={styles.qrModulos} />
            </svg>
            <p className={styles.relogio} data-falta={falta}>
              Vence em <strong>{falta}</strong> (às {hora(venceEm)})
            </p>
            <ul className={styles.notas}>
              <li>Vale uma vez só. Quem ler este QR entra como {nome}: não mande por foto.</li>
              <li>
                No iPhone: o celular abre a OC e mostra como pôr o ícone na tela. Depois, ele abre o ícone, toca em
                “Ler o QR” e aponta para este mesmo QR.
              </li>
            </ul>
          </>
        ) : (
          <p className={caixa.aviso} role="alert">
            Este QR venceu. Gere outro com o mestre do seu lado.
          </p>
        )}
        <div className={caixa.acoes}>
          <Button variant={falta ? 'primary' : 'outline'} onClick={aoFechar}>
            Fechar
          </Button>
          {!falta && (
            <Button variant="primary" onClick={aoGerarOutro}>
              Gerar outro
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
