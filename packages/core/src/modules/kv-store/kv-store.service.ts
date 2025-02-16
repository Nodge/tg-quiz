import type { KeyValueStoreRepository } from './kv-store.repository';

export class KeyValueStore {
    private store: KeyValueStoreRepository;

    public constructor(store: KeyValueStoreRepository) {
        this.store = store;
    }

    public set<T>(key: string, value: T) {
        return this.store.set(key, value);
    }

    public get<T>(key: string) {
        return this.store.get(key) as Promise<T | undefined>;
    }

    public delete(key: string) {
        return this.store.delete(key);
    }
}
