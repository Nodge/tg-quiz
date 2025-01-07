import { APIGatewayProxyEvent, inject } from '@quiz/shared';
import { usersRepositoryToken } from '@quiz/core';
import { AuthService, AuthSession } from '@quiz/auth';

import { env } from './env';
import { getApiBaseUrl } from './base-url';
import { createSessionCookie } from './session';

export const authService = new AuthService({
    clientId: 'web',
    authServerUrl: env('AUTH_SERVER_URL'),
});

export const authSession = createSessionCookie<AuthSession>({
    name: 'auth',
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    maxAge: 34560000,
});

export async function tryAuth(event: APIGatewayProxyEvent) {
    const session = await authSession.getSession(event.cookies?.join(';') ?? '');
    if (!session) {
        return false;
    }

    const verified = await authService.validateSession(session);
    if (!verified.isValid) {
        return false;
    }

    const usersRepository = inject(usersRepositoryToken);
    const user = await usersRepository.findById(verified.userId);
    if (!user) {
        return false;
    }

    return {
        user,
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
