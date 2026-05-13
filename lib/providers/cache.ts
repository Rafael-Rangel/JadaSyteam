type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

export function getCachedValue<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number): void {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export async function withInFlightDedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const current = inFlight.get(key);
  if (current) {
    return current as Promise<T>;
  }
  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
