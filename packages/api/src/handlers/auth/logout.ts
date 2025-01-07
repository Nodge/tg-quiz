import { apiHandler } from '@quiz/shared';
import { deleteTokens, validateOrigin } from '../../lib/auth';

export const handler = apiHandler(async event => {
    const origin = event.headers.origin;

    // Validate the origin to protect against CSRF attacks.
    if (!origin || !validateOrigin(origin)) {
        return {
            statusCode: 400,
        };
    }

    return {
        statusCode: 201,
        cookies: deleteTokens(),
    };
});
