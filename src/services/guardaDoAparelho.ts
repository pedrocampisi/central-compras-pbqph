/**
 * O que fica guardado no celular do mestre de obra (CTO-D696 §5.1): o que ele
 * preencheu e ainda não foi, e o que está esperando sinal para ir. Fechar o
 * app, ficar sem bateria ou perder o sinal não pode apagar nada.
 *
 * É o IndexedDB do navegador, que guarda a foto da nota como ela é (o
 * `localStorage` só guarda texto, e uma foto em texto passa do limite dele).
 * Onde o IndexedDB não abre (janela anônima, aparelho sem espaço), cai na
 * memória: a tela continua funcionando, só não sobrevive ao fechar — e diz
 * isso (`duravel`), para a tela não prometer "guardado" (perícia 05/10, achado 6).
 *
 * Gravar só termina quando a transação FECHA: o pedido dar certo não basta, a
 * transação ainda pode ser desfeita depois dele.
 */

export interface GuardaDoAparelho {
  ler<T>(chave: string): Promise<T | undefined>;
  gravar(chave: string, valor: unknown): Promise<void>;
  apagar(chave: string): Promise<void>;
  /** As chaves que começam com `prefixo`, em ordem. */
  chaves(prefixo: string): Promise<string[]>;
  /** Se o que se grava sobrevive a fechar o app. Na memória, não. */
  duravel(): Promise<boolean>;
}

/**
 * Na memória: para quando o IndexedDB não abre, e para os testes. Não é
 * durável; o teste que finge o aparelho passa `duravel = true`.
 */
export function guardaNaMemoria(duravel = false): GuardaDoAparelho {
  const m = new Map<string, unknown>();
  return {
    ler: async <T,>(k: string) => m.get(k) as T | undefined,
    gravar: async (k, v) => void m.set(k, v),
    apagar: async (k) => void m.delete(k),
    chaves: async (p) => [...m.keys()].filter((k) => k.startsWith(p)).sort(),
    duravel: async () => duravel,
  };
}

/**
 * A gaveta de uma conta só (perícia 05/10, achado 3): o celular é um, as
 * contas que entram nele podem ser várias. Cada conta lê, lista e apaga só o
 * que ela mesma guardou — a lista, os rascunhos, as fotos e a fila. O que a
 * conta A deixou esperando sinal continua lá para quando a A voltar, e nunca
 * vai com a sessão da B.
 */
export function guardaDoDono(g: GuardaDoAparelho, dono: string): GuardaDoAparelho {
  if (!dono) throw new Error('A guarda do celular precisa de dono.');
  const p = `dono:${dono}:`;
  return {
    ler: <T,>(k: string) => g.ler<T>(p + k),
    gravar: (k, v) => g.gravar(p + k, v),
    apagar: (k) => g.apagar(p + k),
    chaves: async (prefixo) => (await g.chaves(p + prefixo)).map((k) => k.slice(p.length)),
    duravel: () => g.duravel(),
  };
}

const BANCO = 'campisi-oc-mestre';
const GAVETA = 'guardado';

function pedido<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((ok, falhou) => {
    r.onsuccess = () => ok(r.result);
    r.onerror = () => falhou(r.error);
  });
}

/** A transação fechou gravada; desfeita ou com erro, falha. */
function fechada(t: IDBTransaction): Promise<void> {
  return new Promise((ok, falhou) => {
    t.oncomplete = () => ok();
    t.onabort = () => falhou(t.error ?? new Error('A gravação no celular foi desfeita.'));
    t.onerror = () => falhou(t.error ?? new Error('A gravação no celular falhou.'));
  });
}

function abrir(): Promise<IDBDatabase> {
  const r = indexedDB.open(BANCO, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(GAVETA);
  return pedido(r);
}

/** No IndexedDB do aparelho; na memória se ele não abrir. */
export function guardaDoAparelho(): GuardaDoAparelho {
  let aberto: Promise<IDBDatabase | null> | null = null;
  const reserva = guardaNaMemoria();
  const db = () => (aberto ??= typeof indexedDB === 'undefined' ? Promise.resolve(null) : abrir().catch(() => null));
  const gaveta = async (modo: IDBTransactionMode) => {
    const d = await db();
    return d ? d.transaction(GAVETA, modo).objectStore(GAVETA) : null;
  };
  /** Escreve e espera a transação fechar: só então está no celular. */
  const escrever = async (f: (g: IDBObjectStore) => IDBRequest, naMemoria: () => Promise<void>) => {
    const g = await gaveta('readwrite');
    if (!g) return naMemoria();
    const fim = fechada(g.transaction);
    f(g);
    await fim;
  };
  return {
    async ler<T>(k: string) {
      const g = await gaveta('readonly');
      return g ? ((await pedido(g.get(k))) as T | undefined) : reserva.ler<T>(k);
    },
    gravar: (k, v) => escrever((g) => g.put(v, k), () => reserva.gravar(k, v)),
    apagar: (k) => escrever((g) => g.delete(k), () => reserva.apagar(k)),
    async chaves(p) {
      const g = await gaveta('readonly');
      if (!g) return reserva.chaves(p);
      const todas = (await pedido(g.getAllKeys())) as IDBValidKey[];
      return todas.map(String).filter((k) => k.startsWith(p)).sort();
    },
    duravel: async () => (await db()) !== null,
  };
}
