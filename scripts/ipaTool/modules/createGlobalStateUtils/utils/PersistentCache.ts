/**
 * 持久化缓存类，继承自 Map
 */
class PersistentCache<K, V> extends Map<K, V> {
  constructor(private storageKey?: string, key?: K) {
    super(
      storageKey && key && Storage.contains(storageKey)
        ? [[key, Storage.get(storageKey) as V]]
        : []
    );
  }

  set(...args: Parameters<Map<K, V>["set"]>): this {
    super.set(...args);

    if (this.storageKey && !(args[1] instanceof Error))
      args[1] instanceof Promise || Storage.set(this.storageKey, args[1]);
    return this;
  }

  hasStorageKey(): boolean {
    return !!this.storageKey && Storage.contains(this.storageKey);
  }
}

/**
 * 初始化持久化缓存
 * @param storageKey 存储键
 * @param key 缓存键
 * @param initialState 初始状态
 * @returns 初始化后的缓存实例
 */
export function initializeCache<State>(
  storageKey: string | undefined,
  key: symbol,
  initialState: State
): PersistentCache<symbol, State> {
  const cache = new PersistentCache<symbol, State>(storageKey, key);
  cache.hasStorageKey() || cache.set(key, initialState);
  return cache;
}
