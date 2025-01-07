const store = new Map<symbol, unknown>();

type Token<T> = {
    /** Unique identifier for this token. */
    id: symbol;
    /** Human readable token name. */
    name: string;
    /** Type of the dependency to be injected. */
    type: T;
};

export function createToken<T>(name: string): Token<T> {
    return {
        id: Symbol(name),
        name,
        type: undefined as unknown as T,
    };
}

export function register<T>(token: Token<T>, value: NoInfer<T>) {
    if (store.has(token.id)) {
        throw new Error(`Token ${token.name} already registered.`);
    }

    store.set(token.id, value);
}

export function inject<T>(token: Token<T>): T {
    if (!store.has(token.id)) {
        throw new Error(`Token ${token.name} has not been registered.`);
    }

    return store.get(token.id) as T;
}
