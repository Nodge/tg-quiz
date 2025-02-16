import { apiHandler } from '@quiz/shared';

import { authService, authSession, getCallbackUrl, getRedirectUrl } from '../../lib/auth';
import { init } from '../../di';

init();

export const handler = apiHandler(async event => {
    const code = event.queryStringParameters?.['code'];
    const error = event.queryStringParameters?.['error'];
    const redirectUrl = getRedirectUrl(event);
    const callbackUrl = getCallbackUrl(event);

    if (!redirectUrl || !callbackUrl) {
        return {
            statusCode: 400,
        };
    }

    const redirect = {
        statusCode: 307,
        headers: {
            location: redirectUrl,
        },
    };

    if (error) {
        console.warn(`Authentication failed: ${error}`);
        return redirect;
    }

    if (!code) {
        console.warn('No authorization code in query string');
        return redirect;
    }

    const session = await authService.createSession(code, callbackUrl);
    if (!session) {
        console.warn('Failed to exchange code to access token');
        return redirect;
    }

    return {
        ...redirect,
        cookies: await authSession.commitSession(session),
    };
});
