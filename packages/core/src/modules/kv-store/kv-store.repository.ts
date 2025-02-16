export abstract class KeyValueStoreRepository {
    public abstract get(key: string): Promise<unknown>;
    public abstract set(key: string, data: unknown): Promise<void>;
    public abstract delete(key: string): Promise<void>;
}
