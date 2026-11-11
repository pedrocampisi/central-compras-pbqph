/**
 * O QR de entrada do mestre, grande, com o tempo que falta (CTO-D696 §4).
 *
 * O engenheiro mostra a tela do celular dele; o mestre aponta a câmera. O QR
 * leva à OC com o código depois do `#` (ver `domain/acessoPorQr`): no Android
 * entra na hora; no iPhone, a OC ensina a pôr o ícone, e o ícone lê este mesmo
 * QR. Vencido, o QR some da tela — não fica um desenho que não abre nada.
 *
 * CTO-D1036 §2.1: o QR passa a valer 24 horas (a validade é do Banco, e a tela
 * mostra a que ele devolve), e pode ser mandado ao engenheiro, que o mostra ao
 * encarregado na obra. Continua valendo uma vez só.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/Button/Button';
import dialogo from '../../components/ConfirmDialog/ConfirmDialog.module.css';
import { acessoDoLink, enderecoDoQr, quandoVence, tempoQueFalta } from '../../domain/acessoPorQr';
import caixa from '../ordens-compra/RegistrarEntregaDialogo.module.css';
import { desenhoDoQr } from './desenhoDoQr';
import { imagemDoQr, nomeDaImagemDoQr } from './imagemDoQr';
import { compartilhaArquivoDoTipo, desistiuDeCompartilhar, podeCompartilharArquivo } from '../../services/compartilhar';
import { downloadBlob } from '../../services/storage/download';
import styles from './MestresPage.module.css';
import { useFocoPreso } from '../../hooks/useFocoPreso';

/** O aparelho abre a folha de compartilhar com uma imagem? Medido uma vez, com um arquivo de amostra. */
const compartilhaImagem = () => compartilhaArquivoDoTipo('image/png', 'qr.png');

interface Props {
  nome: string;
  link: string;
  venceEm: string;
  aoFechar: () => void;
  aoGerarOutro: () => void;
}

export function QrDoMestre({ nome, link, venceEm, aoFechar, aoGerarOutro }: Props) {
  const preso = useFocoPreso<HTMLDivElement>();
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const endereco = useMemo(() => {
    const acesso = acessoDoLink(link);
    return acesso ? enderecoDoQr(window.location.origin, acesso) : link;
  }, [link]);
  const desenho = useMemo(() => desenhoDoQr(endereco), [endereco]);
  const falta = tempoQueFalta(venceEm, agora);
  const ate = quandoVence(venceEm, agora);
  const [compartilha] = useState(compartilhaImagem);
  const [erro, setErro] = useState('');

  const mandar = async () => {
    setErro('');
    const nomeDoArquivo = nomeDaImagemDoQr(nome);
    try {
      const png = await imagemDoQr(endereco, [`Entrada de ${nome}`, `Vale uma vez só, até ${quandoVence(venceEm, new Date())}`]);
      const arquivo = new File([png], nomeDoArquivo, { type: 'image/png' });
      if (compartilha && podeCompartilharArquivo(arquivo)) {
        await navigator.share({ files: [arquivo], title: `QR de entrada de ${nome}` });
      } else {
        downloadBlob(arquivo, nomeDoArquivo);
      }
    } catch (e) {
      // Fechar a folha de compartilhar sem escolher não é erro.
      if (desistiuDeCompartilhar(e)) return;
      setErro('Não deu para preparar a imagem do QR. Mostre o QR desta tela ao encarregado.');
    }
  };

  return createPortal(
    <div className={dialogo.overlay} role="dialog" aria-modal ref={preso} aria-labelledby="qr-titulo">
      <div className={`${caixa.caixa} ${styles.caixaDoQr}`} data-dialogo-qr="">
        <h3 id="qr-titulo" className={caixa.titulo}>
          QR de entrada — {nome}
        </h3>
        {falta ? (
          <>
            <p className={styles.instrucao}>Aponte a câmera do celular do encarregado para o QR.</p>
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
              Vale até <strong>{ate}</strong> (falta {falta})
            </p>
            <ul className={styles.notas}>
              <li>
                Vale uma vez só. Pode mandar ao engenheiro da obra, para ele mostrar ao encarregado lá. Quem ler este QR
                entra como {nome}: mande só ao engenheiro, e a mais ninguém.
              </li>
              <li>
                No iPhone: o celular abre a OC e mostra como pôr o ícone na tela. Depois, ele abre o ícone, toca em
                “Ler o QR” e aponta para este mesmo QR.
              </li>
            </ul>
          </>
        ) : (
          <p className={caixa.aviso} role="alert">
            Este QR venceu. Gere outro com o encarregado do seu lado.
          </p>
        )}
        {erro && (
          <p className={caixa.aviso} role="alert">
            {erro}
          </p>
        )}
        <div className={caixa.acoes}>
          {falta && (
            <Button variant="outline" onClick={() => void mandar()} data-mandar-qr={compartilha ? 'compartilhar' : 'baixar'}>
              {compartilha ? 'Mandar ao engenheiro' : 'Baixar o QR'}
            </Button>
          )}
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
