import { inject } from '@quiz/shared';
import { keyValueStoreRepositoryToken, KeyValueStoreRepository } from './kv-store.repository';

export class KeyValueStore<T> {
    private key: string;
    private store: KeyValueStoreRepository;

    public constructor(key: string) {
        this.key = key;
        this.store = inject(keyValueStoreRepositoryToken);
    }

    public set(value: T) {
        return this.store.set(this.key, value);
    }

    public get() {
        return this.store.get(this.key) as Promise<T | undefined>;
    }

    public delete() {
        return this.store.delete(this.key);
    }
}
