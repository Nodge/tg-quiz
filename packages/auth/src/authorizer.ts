import { handle } from 'hono/aws-lambda';
import { authorizer } from '@openauthjs/openauth';
import { PasswordAdapter } from '@openauthjs/openauth/adapter/password';
import { CodeAdapter } from '@openauthjs/openauth/adapter/code';
import { PasswordUI } from '@openauthjs/openauth/ui/password';
import { CodeUI } from '@openauthjs/openauth/ui/code';

import { subjects } from './subjects';
import { env } from './env';
import { sendCodeEmail } from './email-sender';
import { usersService } from './users.service';
import { Adapter } from '@openauthjs/openauth/adapter/adapter';

interface AuthClient {
    allowedOrigins: string[];
}

const clients: Record<string, AuthClient> = {
    web: {
        allowedOrigins: [
            `https://${env('APP_DOMAIN')}`,
            env('APP_ENV') === 'development' ? 'http://localhost:8080' : '',
        ].filter(Boolean),
    },
};

const app = authorizer({
    subjects,
    theme: {
        title: 'Infra Quiz Auth',
        primary: '#f3663f',
    },
    providers: {
        password: PasswordAdapter(
            PasswordUI({
                sendCode: async (email, code) => {
                    await sendCodeEmail(email, code);
                },
            })
        ),
        code: CodeAdapter<{ email: string }>(
            CodeUI({
                sendCode: async (claims, code) => {
                    const email = claims.email;
                    if (!email) {
                        throw new Error('No email found in claims');
                    }
                    await sendCodeEmail(email, code);
                },
            })
        ),
        ...(env('APP_ENV') === 'development'
            ? {
                  local: {
                      type: 'local',
                      init(routes, ctx) {
                          routes.get('/authorize', async c => {
                              return ctx.forward(c, await ctx.success(c, {}));
                          });
                      },
                  } satisfies Adapter,
              }
            : {}),
    },
    async allow(req) {
        const client = clients[req.clientID];
        if (!client) {
            return false;
        }

        if (!URL.canParse(req.redirectURI)) {
            return false;
        }

        const origin = new URL(req.redirectURI).origin;

        return client.allowedOrigins.includes(origin);
    },
    async success(ctx, value) {
        let userId: string;

        switch (value?.provider) {
            case 'password':
                userId = await usersService.createByEmail(value.email);
                break;

            case 'code':
                const email = value.claims.email;
                if (!email) {
                    throw new Error('No email found in claims');
                }
                userId = await usersService.createByEmail(email);
                break;

            case 'local':
                userId = await usersService.createByEmail('dev@localhost');
                break;

            default:
                throw new Error('Unknown provider');
        }

        return ctx.subject('user', { userId });
    },
});

export const handler = handle(app);
