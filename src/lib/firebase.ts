import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore/lite";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Garante que o Next.js Data Cache (.next/cache/fetch-cache) nunca armazene em disco
// respostas HTTP brutas do Firestore (como erros 429 transitórios), delegando o
// controle de cache exclusivamente para o cachedQuery em memória.
if (typeof window === "undefined" && typeof globalThis.fetch === "function") {
  const originalFetch = globalThis.fetch;
  if (!(originalFetch as any).__fla10Patched) {
    const patchedFetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input?.url || "";
      if (url.includes("firestore.googleapis.com")) {
        const nextInit: RequestInit & { next?: { revalidate?: number | false } } = {
          ...init,
          cache: "no-store",
        };
        if (nextInit.next) {
          delete nextInit.next;
        }
        return originalFetch(input, nextInit);
      }
      return originalFetch(input, init);
    };
    (patchedFetch as any).__fla10Patched = true;
    globalThis.fetch = patchedFetch as typeof fetch;
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
// Evita que o Firebase seja inicializado várias vezes
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);

// Usa firebase/firestore/lite (HTTP REST stateless via fetch) em vez de gRPC streams,
// evitando travamentos e conexões presas (ECONNRESET/DEADLINE_EXCEEDED) no Cloud Run SSR.
const db: Firestore = getFirestore(app);

const storage: FirebaseStorage = getStorage(app);

export function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Firestore operation timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

type CacheEntry<T = any> = {
  value?: T;
  hasValue: boolean;
  expiresAt: number;
  promise?: Promise<T>;
};

const globalForCache = globalThis as unknown as {
  __fla10FirestoreCache?: Map<string, CacheEntry>;
};

function getCacheStore(): Map<string, CacheEntry> {
  if (!globalForCache.__fla10FirestoreCache) {
    globalForCache.__fla10FirestoreCache = new Map<string, CacheEntry>();
  }
  return globalForCache.__fla10FirestoreCache;
}

export function invalidateFirestoreCache(prefix?: string): void {
  const store = getCacheStore();
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

/**
 * Executa uma consulta ao Firestore com:
 * 1. Deduplicação de chamadas concorrentes (single-flight)
 * 2. Cache em memória no servidor (TTL padrão de 120s) para proteger a cota diária do Firestore
 * 3. Preservação do último resultado válido (Last-Known-Good) caso o Firestore retorne erro/timeout/429
 * 4. Limpeza garantida de promises rejeitadas para nunca travar futuras requisições
 */
export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttlMs?: number;
    isEmpty?: (val: T) => boolean;
    bypassCache?: boolean;
  }
): Promise<T> {
  if (typeof window !== "undefined" || options?.bypassCache) {
    return fetcher();
  }

  const ttlMs = options?.ttlMs ?? 120_000;
  const isEmpty = options?.isEmpty ?? ((val: any) => Array.isArray(val) && val.length === 0);
  const store = getCacheStore();
  const now = Date.now();
  const existing = store.get(key);

  if (existing && existing.hasValue && now < existing.expiresAt) {
    return existing.value as T;
  }

  if (existing?.promise) {
    return existing.promise;
  }

  let promise: Promise<T> | undefined;
  promise = (async () => {
    try {
      let result: T;
      try {
        result = await fetcher();
      } catch (firstErr) {
        if (!existing?.hasValue) {
          // Retenta 1 vez imediatamente se for cold start sem cache anterior
          result = await fetcher();
        } else {
          throw firstErr;
        }
      }

      const empty = isEmpty(result);

      if (empty && existing?.hasValue) {
        // Mantém o último resultado válido se a nova leitura veio vazia (ex: erro 429 ou timeout capturado)
        store.set(key, {
          value: existing.value,
          hasValue: true,
          expiresAt: Date.now() + 30_000,
        });
        return existing.value as T;
      }

      store.set(key, {
        value: result,
        hasValue: !empty,
        expiresAt: Date.now() + (empty ? 15_000 : ttlMs),
      });
      return result;
    } catch (err) {
      if (existing?.hasValue) {
        store.set(key, {
          value: existing.value,
          hasValue: true,
          expiresAt: Date.now() + 30_000,
        });
        return existing.value as T;
      }
      // Remove a entrada com promise rejeitada para que a próxima requisição tente novamente do zero
      store.delete(key);
      throw err;
    } finally {
      const current = store.get(key);
      if (current && current.promise === promise) {
        delete current.promise;
      }
    }
  })();

  store.set(key, {
    value: existing?.value,
    hasValue: existing?.hasValue ?? false,
    expiresAt: existing?.expiresAt ?? 0,
    promise,
  });

  return promise;
}

export { app, auth, db, storage };
