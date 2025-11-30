import { apiHandler } from '@quiz/shared';
import { authSession } from '../../lib/auth';
import { createRequestContext } from '../../lib/request-context';

export type UserInfoResponse =
    | {
          isAuthenticated: false;
      }
    | {
          isAuthenticated: true;
          userId: string;
          role: string;
      };

export const handler = apiHandler(async event => {
    const ctx = await createRequestContext(event);
    const user = ctx.currentUser.getUser();

    if (!user) {
        return {
            statusCode: 200,
            body: JSON.stringify({ isAuthenticated: false } satisfies UserInfoResponse),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            isAuthenticated: true,
            userId: user.id,
            role: user.role,
        } satisfies UserInfoResponse),
        cookies: ctx.authSession ? await authSession.commitSession(ctx.authSession) : undefined,
    };
});
