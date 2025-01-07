import { domainName } from './domain';

export const site = new sst.aws.StaticSite('Site', {
    path: 'packages/site',
    build: {
        command: 'pnpm build',
        output: 'build',
    },
    dev: {
        command: 'pnpm dev',
        url: 'http://localhost:5173/',
    },
    environment: {
        NODE_ENV: $dev ? 'development' : 'production',
        API_URL: `https://${domainName}/api/`,
    },
});
