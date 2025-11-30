import { APIGatewayProxyEvent } from '@quiz/shared';
import type { AuthService, AuthSession } from '@quiz/auth';
import type { UsersRepository } from '@quiz/core';

import { getApiBaseUrl } from './base-url';
import { createSessionCookie } from './session';

export const authSession = createSessionCookie<AuthSession>({
    name: 'auth',
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    maxAge: 34560000,
});

export async function tryAuth(event: APIGatewayProxyEvent, authService: AuthService, usersRepository: UsersRepository) {
    const session = await authSession.getSession(event.cookies?.join(';') ?? '');
    if (!session) {
        return null;
    }

    const verified = await authService.validateSession(session);
    if (!verified.isValid) {
        return null;
    }

    const user = await usersRepository.findById(verified.userId);
    if (!user) {
        return null;
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
