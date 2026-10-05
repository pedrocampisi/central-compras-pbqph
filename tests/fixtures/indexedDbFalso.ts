/**
 * Um IndexedDB FALSO, só o que a guarda do celular usa (perícia de 05/10,
 * achado 6). O "disco" é um mapa de fora da guarda: recriar a guarda é como
 * fechar e abrir o app, e o que estava no disco continua lá.
 *
 * Como o de verdade, a transação de escrita só vale no fim: cada pedido
 * responde "deu certo" antes, e o disco só muda quando a transação fecha. Com
 * `abortarAProximaGravacao`, o pedido responde "deu certo" e a transação é
 * desfeita depois — o caso que o perito descreveu.
 */

type Funcao = (() => void) | null;

interface Pedido<T> {
  result: T | undefined;
  error: unknown;
  onsuccess: Funcao;
  onerror: Funcao;
  onupgradeneeded: Funcao;
}

const pedido = <T,>(): Pedido<T> => ({ result: undefined, error: null, onsuccess: null, onerror: null, onupgradeneeded: null });
const depois = (f: () => void) => setTimeout(f, 0);

export function indexedDbFalso() {
  const disco = new Map<string, Map<string, unknown>>();
  const controle = { falharAoAbrir: false, abortarAProximaGravacao: false };

  const banco = {
    createObjectStore(nome: string) {
      if (!disco.has(nome)) disco.set(nome, new Map());
    },
    transaction(nome: string, modo: 'readonly' | 'readwrite') {
      const area = disco.get(nome)!;
      const rascunho = new Map(area);
      const abortar = modo === 'readwrite' && controle.abortarAProximaGravacao;
      if (abortar) controle.abortarAProximaGravacao = false;
      const t = { oncomplete: null as Funcao, onabort: null as Funcao, onerror: null as Funcao, error: null as unknown, objectStore: () => loja };
      let abertos = 0;
      const fechar = () =>
        depois(() => {
          if (abortar) {
            t.error = new DOMException('A transação foi desfeita.', 'AbortError');
            t.onabort?.();
            return;
          }
          if (modo === 'readwrite') {
            area.clear();
            for (const [k, v] of rascunho) area.set(k, v);
          }
          t.oncomplete?.();
        });
      const pedir = <T,>(f: () => T) => {
        const r = pedido<T>();
        abertos++;
        depois(() => {
          r.result = f();
          r.onsuccess?.();
          if (--abertos === 0) fechar();
        });
        return r;
      };
      const loja = {
        transaction: t,
        get: (k: string) => pedir(() => rascunho.get(k)),
        put: (v: unknown, k: string) => pedir(() => (rascunho.set(k, v), k)),
        delete: (k: string) => pedir(() => void rascunho.delete(k)),
        getAllKeys: () => pedir(() => [...rascunho.keys()]),
      };
      return t;
    },
  };

  const fabrica = {
    open() {
      const r = pedido<typeof banco>();
      depois(() => {
        if (controle.falharAoAbrir) {
          r.error = new DOMException('O navegador não deixou abrir.', 'UnknownError');
          r.onerror?.();
          return;
        }
        r.result = banco;
        if (disco.size === 0) r.onupgradeneeded?.();
        r.onsuccess?.();
      });
      return r;
    },
  };

  return { fabrica: fabrica as unknown as IDBFactory, disco, controle };
}
