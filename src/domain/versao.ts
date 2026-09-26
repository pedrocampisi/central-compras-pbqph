/**
 * A tela confere se é a versão que está no ar (CTO-D541, 26/09/2026).
 *
 * POR QUE EXISTE. Em 26/09 a lista de Fornecedor veio vazia na tela do Pedro:
 * o navegador dele rodava o pacote de 15/09, guardado pelo service worker, e
 * esse pacote lia uma coluna que o banco tinha acabado de esvaziar. Medido no
 * mesmo dia, com o pacote de então: a aba aberta fica no velho para sempre; a
 * primeira visita depois de publicar ainda roda o velho (o worker novo baixa
 * por trás e a página não recarrega); só a segunda visita roda o novo. Toda
 * publicação que anda junto com uma mudança do banco tem essa janela.
 *
 * Lógica pura: não conhece o navegador.
 */

/** "20260926134501-1a2b3c4" — o carimbo que o build grava no pacote e em /versao.txt. */
const FORMATO = /^\d{14}-[0-9a-z]+$/;

export function versaoValida(v: string | null | undefined): v is string {
  return typeof v === 'string' && FORMATO.test(v.trim());
}

export type Decisao = 'ficar' | 'recarregar' | 'avisar';

/**
 * O que fazer depois de ler a versão servida.
 *
 *   servida inválida ........ ficar. É o caso de /versao.txt não existir: o
 *                             Cloudflare devolve a página inicial no lugar
 *                             (modo "aplicativo de uma página"), e ler isso
 *                             como versão nova recarregaria em laço
 *   igual à da tela ......... ficar
 *   já tentada .............. ficar. Recarreguei por esta versão e ela não
 *                             chegou: não recarrego de novo (sem laço). A
 *                             próxima visita traz
 *   diferente, editando ..... avisar. A OC em edição mora só na memória, e
 *                             recarregar agora apagaria o que a pessoa digitou
 *   diferente ............... recarregar
 */
export function decidirRecarga(p: {
  daTela: string;
  servida: string | null | undefined;
  jaTentada: string | null | undefined;
  editando: boolean;
}): Decisao {
  if (!versaoValida(p.servida)) return 'ficar';
  const servida = p.servida.trim();
  if (servida === p.daTela) return 'ficar';
  if (servida === p.jaTentada) return 'ficar';
  return p.editando ? 'avisar' : 'recarregar';
}
