import { apiHandler } from '@quiz/shared';
import { authService, authSession, getCallbackUrl, getRedirectUrl, tryAuth } from '../../lib/auth';

export const handler = apiHandler(async event => {
    const redirectUrl = getRedirectUrl(event);
    const callbackUrl = getCallbackUrl(event);

    if (!redirectUrl || !callbackUrl) {
        return {
            statusCode: 400,
        };
    }

    const auth = await tryAuth(event);
    if (auth) {
        return {
            statusCode: 307,
            headers: {
                location: redirectUrl,
            },
            cookies: auth.session ? await authSession.commitSession(auth.session) : undefined,
        };
    }

    const authUrl = await authService.getAuthUrl(callbackUrl);

    return {
        statusCode: 307,
        headers: {
            location: authUrl,
        },
    };
});
