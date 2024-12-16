type EnvVariable = 'VITE_APP_API_URL' | 'VITE_APP_SITE_URL';

export function env(name: EnvVariable) {
    const value = import.meta.env[name];
    if (!value) {
        throw new Error(`Missing ENV variable: ${name}`);
    }
    return value;
}
