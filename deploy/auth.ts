import { usersTable } from './db';
import { domainName, dns } from './domain';
import { email } from './email';

export const auth = new sst.aws.Auth('Auth', {
    forceUpgrade: 'v2',
    authorizer: {
        handler: 'packages/auth/src/authorizer.handler',
        environment: {
            NODE_ENV: $dev ? 'development' : 'production',
            APP_ENV: $dev ? 'development' : 'production',
            APP_DOMAIN: domainName,
        },
        link: [email, usersTable],
    },
    domain: {
        name: `auth.${domainName}`,
        dns,
    },
});
