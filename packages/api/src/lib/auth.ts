import { serialize, parse } from 'cookie-es';
import { APIGatewayProxyEvent } from '@quiz/shared';
import { AuthService, AuthSession } from '@quiz/auth';

import { env } from './env';
import { getApiBaseUrl } from './base-url';

export const authService = new AuthService({
    clientId: 'web',
    authServerUrl: env('AUTH_SERVER_URL'),
});

export function setTokens(tokens: AuthSession) {
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

    if (!accessToken || !refreshToken) {
        return false;
    }

    const verified = await authService.validateSession({ access: accessToken, refresh: refreshToken });

    if (!verified.isValid) {
        return false;
    }

    // todo: return User DTO
    // todo: update cookies transparently
    return {
        userId: verified.userId,
        session: verified.updatedSession,
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

function validateOrigin(url: string): boolean {
    if (!URL.canParse(url)) {
        return false;
    }

    const apiUrl = new URL(getApiBaseUrl());
    const urlObj = new URL(url);

    return apiUrl.origin === urlObj.origin;
}
