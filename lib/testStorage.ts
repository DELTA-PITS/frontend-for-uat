/**
 * In-memory Storage for component tests: on recent Node versions jsdom's `window.localStorage` can be shadowed
 * by Node's own (flag-gated) webstorage and come back undefined, which would break LocaleProvider.
 */
export function installMemoryStorage(): void {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    const data = new Map<string, string>();
    const storage: Storage = {
      get length() {
        return data.size;
      },
      clear: () => data.clear(),
      getItem: (key) => (data.has(key) ? (data.get(key) as string) : null),
      key: (index) => Array.from(data.keys())[index] ?? null,
      removeItem: (key) => void data.delete(key),
      setItem: (key, value) => void data.set(key, String(value)),
    };
    Object.defineProperty(window, name, { value: storage, configurable: true });
  }
}
