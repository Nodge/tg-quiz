import { apiHandler } from '@quiz/shared';
import { getAuthrizeUrl, getCallbackUrl, getRedirectUrl, setTokens, tryAuth } from '../../lib/auth';

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
            cookies: setTokens(auth.tokens),
        };
    }

    const authUrl = await getAuthrizeUrl(callbackUrl);

    return {
        statusCode: 307,
        headers: {
            location: authUrl,
        },
    };
});
