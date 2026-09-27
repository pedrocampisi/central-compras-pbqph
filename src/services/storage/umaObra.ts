/**
 * Onde a máscara "mostrar só uma obra" fica guardada (CTO-D599): no
 * `localStorage` deste navegador, como o tema. Vale só aqui — os outros
 * computadores continuam vendo tudo.
 *
 * Navegador que não guarda nada (janela anônima, armazenamento bloqueado): a
 * máscara não liga, e a tela segue normal. Nunca quebra.
 */

import { type MascaraDeObra, ligadaAgora, mascaraDoTexto, vencida } from '../../domain/umaObra';

const CHAVE = 'oc-mostrar-uma-obra';

export function apagarMascara(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* sem armazenamento: não há o que apagar */
  }
}

/** A máscara armada, ou `null`. Passado o fim, ela se desarma aqui. */
export function lerMascara(agora: Date = new Date()): MascaraDeObra | null {
  let texto: string | null;
  try {
    texto = localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
  const m = mascaraDoTexto(texto);
  if (texto !== null && (!m || vencida(m, agora))) {
    apagarMascara();
    return null;
  }
  return m;
}

/** Guarda e confere que ficou guardado. `false`: este navegador não guarda. */
export function gravarMascara(m: MascaraDeObra): boolean {
  const texto = JSON.stringify(m);
  try {
    localStorage.setItem(CHAVE, texto);
    return localStorage.getItem(CHAVE) === texto;
  } catch {
    return false;
  }
}

/**
 * A obra que as buscas pedem agora, ou `null` (todas). É o ponto único da
 * máscara: `carregarDados` e o aviso de mudanças perguntam aqui.
 */
export function obraDaMascara(agora: Date = new Date()): string | null {
  const m = lerMascara(agora);
  return ligadaAgora(m, agora) ? m!.obraId : null;
}
