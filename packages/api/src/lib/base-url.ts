import { env } from './env';

export function getApiBaseUrl() {
    let baseUrl = env('API_URL');

    if (env('APP_ENV') === 'development') {
        baseUrl = 'http://localhost:8080/api/';
    }

    return baseUrl;
}
