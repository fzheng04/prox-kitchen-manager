import AsyncStorage from '@react-native-async-storage/async-storage';

/** The only persistence surface the app uses, so tests can swap in a fake. */
export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const asyncStorageStore: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

/** In-memory store for tests. `fail` makes reads or writes reject to simulate storage errors. */
export function memoryStore(initial: Record<string, string> = {}, fail: { read?: boolean; write?: boolean } = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore & { data: Map<string, string>; fail: typeof fail } = {
    data,
    fail,
    async getItem(key) {
      if (store.fail.read) throw new Error('Simulated read failure');
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      if (store.fail.write) throw new Error('Simulated write failure');
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
  };
  return store;
}
