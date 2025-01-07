type EnvVariable = 'APP_DOMAIN' | 'APP_ENV';

export function env(name: EnvVariable) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ENV variable: ${name}`);
    }
    return value;
}
