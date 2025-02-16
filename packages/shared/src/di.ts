const factories = new Map<symbol, () => unknown>();
const instances = new Map<symbol, unknown>();

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

export function register<T>(token: Token<T>, factory: () => NoInfer<T>) {
    if (factories.has(token.id)) {
        throw new Error(`Token ${token.name} already registered.`);
    }

    factories.set(token.id, factory);
}

export function inject<T>(token: Token<T>): T {
    const factory = factories.get(token.id);
    if (!factory) {
        throw new Error(`Token ${token.name} has not been registered.`);
    }

    let instance = instances.get(token.id);
    if (instance === undefined) {
        instance = factory();
        instances.set(token.id, instance);
    }

    return instance as T;
}
