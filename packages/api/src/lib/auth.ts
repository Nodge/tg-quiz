import { serialize, parse } from 'cookie-es';
import { APIGatewayProxyEvent } from '@quiz/shared';
import { createAuthClient, authSubjects } from '@quiz/auth';

import { env } from './env';

const client = createAuthClient({
    clientID: 'web',
    issuer: env('AUTH_SERVER_URL'),
});

export async function getAuthrizeUrl(redirectUrl: string) {
    const { url } = await client.authorize(redirectUrl, 'code');
    return url;
}

export async function exchangeCode(code: string, redirectUrl: string) {
    const exchanged = await client.exchange(code, redirectUrl);
    if (exchanged.err) {
        return false;
    }

    return exchanged.tokens;
}

interface Tokens {
    access: string;
    refresh: string;
}

export function setTokens(tokens: Tokens | undefined) {
    const cookie: string[] = [];

    if (!tokens) {
        return cookie;
    }

    cookie.push(
        serialize('access_token', tokens.access, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            maxAge: 34560000,
        })
    );

    cookie.push(
        serialize('refresh_token', tokens.refresh, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            maxAge: 34560000,
        })
    );

    return cookie;
}

export function deleteTokens() {
    const cookie: string[] = [];
    cookie.push(
        serialize('access_token', '', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            expires: new Date(0),
        })
    );

    cookie.push(
        serialize('refresh_token', '', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            expires: new Date(0),
        })
    );

    return cookie;
}

export async function tryAuth(event: APIGatewayProxyEvent) {
    const cookies = parse(event.cookies?.join(';') ?? '');
    const accessToken = cookies['access_token'];
    const refreshToken = cookies['refresh_token'];

    if (!accessToken) {
        return false;
    }

    const verified = await client.verify(authSubjects, accessToken, {
        refresh: refreshToken,
    });

    if (verified.err) {
        return false;
    }

    return {
        user: verified.subject.properties,
        tokens: verified.tokens,
    };
}

export function getRedirectUrl(event: APIGatewayProxyEvent) {
    const redirectUrl = event.queryStringParameters?.['redirect_uri'];
    if (!redirectUrl) {
        return false;
    }

    if (!validateOrigin(redirectUrl)) {
        return false;
    }

    return redirectUrl;
}

export function getCallbackUrl(event: APIGatewayProxyEvent) {
    const redirectUrl = getRedirectUrl(event);
    if (!redirectUrl) {
        return false;
    }

    const baseUrl = getApiBaseUrl();
    const callbackUrl = new URL('auth/callback', baseUrl);
    callbackUrl.searchParams.set('redirect_uri', redirectUrl);

    return callbackUrl.toString();
}

function getApiBaseUrl() {
    let baseUrl = env('API_URL');

    if (env('APP_ENV') === 'development') {
        baseUrl = 'http://localhost:8080/api/';
    }

    return baseUrl;
}

export function validateOrigin(url: string): boolean {
    if (!URL.canParse(url)) {
        return false;
    }

    const apiUrl = new URL(getApiBaseUrl());
    const urlObj = new URL(url);

    return apiUrl.origin === urlObj.origin;
}
