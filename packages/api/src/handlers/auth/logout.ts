import { apiHandler } from '@quiz/shared';
import { authSession } from '../../lib/auth';
import { validateCSRF } from '../../lib/csrf';

export const handler = apiHandler(async event => {
    if (!validateCSRF(event)) {
        return {
            statusCode: 400,
        };
    }

    return {
        statusCode: 201,
        cookies: await authSession.destroySession(),
    };
});
