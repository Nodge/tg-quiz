import { apiHandler } from '@quiz/shared';
import { setTokens, tryAuth } from '../../lib/auth';

export type UserInfoResponse =
    | {
          isAuthenticated: false;
      }
    | {
          isAuthenticated: true;
          userId: string;
      };

export const handler = apiHandler(async event => {
    const auth = await tryAuth(event);

    if (!auth) {
        return {
            statusCode: 200,
            body: JSON.stringify({ isAuthenticated: false } satisfies UserInfoResponse),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            isAuthenticated: true,
            userId: auth.user.userId,
        } satisfies UserInfoResponse),
        cookies: setTokens(auth.tokens),
    };
});
