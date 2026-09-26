/**
 * O vigia da versão: ao abrir e a cada volta do foco, a tela lê /versao.txt
 * (fora do cache do service worker) e compara com a versão que ela mesma é.
 * A regra de quando recarregar mora em `domain/versao.ts`; aqui só o navegador.
 *
 * Por que recarregar não basta sozinho: o service worker entrega a página que
 * guardou. Antes de recarregar, pedimos a ele que procure o pacote novo
 * (`registration.update()`) e esperamos ele assumir — o worker desta casa
 * assume sozinho (`skipWaiting` + `clientsClaim`, do `registerType:
 * 'autoUpdate'`). Se ele não assumir a tempo, recarregamos assim mesmo; a
 * trava de "já tentada" impede o laço.
 */
import { decidirRecarga, versaoValida } from '../domain/versao';
import { useOcEditingStore } from '../stores/useOcEditingStore';
import { useUiStore } from '../stores/useUiStore';

export const VERSAO_DA_TELA = __VERSAO_DO_PACOTE__;

const CHAVE_TENTADA = 'versao-tentada';
const INTERVALO_MINIMO_MS = 30_000;
const ESPERA_DO_WORKER_MS = 4_000;

let ultimaConferencia = 0;
let avisada: string | null = null;
let pendente: string | null = null;

function lerTentada(): string | null {
  try { return sessionStorage.getItem(CHAVE_TENTADA); } catch { return null; }
}
function gravarTentada(v: string) {
  try { sessionStorage.setItem(CHAVE_TENTADA, v); } catch { /* sem sessionStorage: segue sem a trava */ }
}

async function lerVersaoServida(): Promise<string | null> {
  try {
    const r = await fetch(`/versao.txt?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const texto = (await r.text()).trim();
    return versaoValida(texto) ? texto : null;
  } catch {
    return null; // sem rede: fica como está
  }
}

async function trocarDePacote(servida: string) {
  gravarTentada(servida);
  const reg = await navigator.serviceWorker?.getRegistration?.().catch(() => undefined);
  if (reg) {
    await new Promise<void>((pronto) => {
      const fim = setTimeout(pronto, ESPERA_DO_WORKER_MS);
      navigator.serviceWorker.addEventListener('controllerchange', () => { clearTimeout(fim); pronto(); }, { once: true });
      reg.update().catch(() => { clearTimeout(fim); pronto(); });
    });
  }
  window.location.reload();
}

export async function conferirVersao(forcar = false): Promise<void> {
  const agora = Date.now();
  if (!forcar && agora - ultimaConferencia < INTERVALO_MINIMO_MS) return;
  ultimaConferencia = agora;

  const servida = await lerVersaoServida();
  const decisao = decidirRecarga({
    daTela: VERSAO_DA_TELA,
    servida,
    jaTentada: lerTentada(),
    editando: useOcEditingStore.getState().ocEditing !== null,
  });

  if (decisao === 'recarregar' && servida) {
    await trocarDePacote(servida);
  } else if (decisao === 'avisar' && servida) {
    pendente = servida;
    if (avisada !== servida) {
      avisada = servida;
      useUiStore.getState().showToast(
        'Saiu uma versão nova do programa. Salve ou feche esta OC: a tela se atualiza sozinha em seguida.',
        'info',
      );
    }
  }
}

/** Liga o vigia. Chamado uma vez, ao montar o aplicativo. Em dev não roda. */
export function iniciarVigiaDaVersao(): void {
  if (import.meta.env.DEV) return;
  void conferirVersao(true);
  window.addEventListener('focus', () => void conferirVersao());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void conferirVersao();
  });
  // A OC que segurava a troca terminou (salva ou fechada): agora troca.
  useOcEditingStore.subscribe((s, antes) => {
    if (antes.ocEditing !== null && s.ocEditing === null && pendente) void conferirVersao(true);
  });
}
