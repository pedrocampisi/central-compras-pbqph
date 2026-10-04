/**
 * O que fica guardado no celular do mestre de obra (CTO-D696 §5.1): o que ele
 * preencheu e ainda não foi, e o que está esperando sinal para ir. Fechar o
 * app, ficar sem bateria ou perder o sinal não pode apagar nada.
 *
 * É o IndexedDB do navegador, que guarda a foto da nota como ela é (o
 * `localStorage` só guarda texto, e uma foto em texto passa do limite dele).
 * Onde o IndexedDB não abre (janela anônima, aparelho sem espaço), cai na
 * memória: a tela continua funcionando, só não sobrevive ao fechar.
 */

export interface GuardaDoAparelho {
  ler<T>(chave: string): Promise<T | undefined>;
  gravar(chave: string, valor: unknown): Promise<void>;
  apagar(chave: string): Promise<void>;
  /** As chaves que começam com `prefixo`, em ordem. */
  chaves(prefixo: string): Promise<string[]>;
}

/** Na memória: para os testes, e para quando o IndexedDB não abre. */
export function guardaNaMemoria(): GuardaDoAparelho {
  const m = new Map<string, unknown>();
  return {
    ler: async <T,>(k: string) => m.get(k) as T | undefined,
    gravar: async (k, v) => void m.set(k, v),
    apagar: async (k) => void m.delete(k),
    chaves: async (p) => [...m.keys()].filter((k) => k.startsWith(p)).sort(),
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
  return {
    async ler<T>(k: string) {
      const g = await gaveta('readonly');
      return g ? ((await pedido(g.get(k))) as T | undefined) : reserva.ler<T>(k);
    },
    async gravar(k, v) {
      const g = await gaveta('readwrite');
      if (g) await pedido(g.put(v, k));
      else await reserva.gravar(k, v);
    },
    async apagar(k) {
      const g = await gaveta('readwrite');
      if (g) await pedido(g.delete(k));
      else await reserva.apagar(k);
    },
    async chaves(p) {
      const g = await gaveta('readonly');
      if (!g) return reserva.chaves(p);
      const todas = (await pedido(g.getAllKeys())) as IDBValidKey[];
      return todas.map(String).filter((k) => k.startsWith(p)).sort();
    },
  };
}
