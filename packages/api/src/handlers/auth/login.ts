import { apiHandler } from '@quiz/shared';

import { authSession, getCallbackUrl, getRedirectUrl } from '../../lib/auth';
import { createRequestContext } from '../../lib/request-context';

export const handler = apiHandler(async event => {
    const redirectUrl = getRedirectUrl(event);
    const callbackUrl = getCallbackUrl(event);

    if (!redirectUrl || !callbackUrl) {
        return {
            statusCode: 400,
        };
    }

    const ctx = await createRequestContext(event);
    const auth = ctx.currentUser.isAuthenticated();
    if (auth) {
        return {
            statusCode: 307,
            headers: {
                location: redirectUrl,
            },
            cookies: ctx.authSession ? await authSession.commitSession(ctx.authSession) : undefined,
        };
    }

    const authUrl = await ctx.authService.getAuthUrl(callbackUrl);

    return {
        statusCode: 307,
        headers: {
            location: authUrl,
        },
    };
});
