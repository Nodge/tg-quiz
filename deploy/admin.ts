import { domainName } from './domain';

export const admin = new sst.aws.StaticSite('Admin', {
    path: 'packages/admin',
    build: {
        command: 'pnpm build',
        output: 'build',
    },
    dev: {
        command: 'pnpm dev',
        url: 'http://localhost:8080/',
    },
    environment: {
        NODE_ENV: $dev ? 'development' : 'production',
        API_URL: `https://${domainName}/api/`,
        VITE_SITE_URL: $dev ? 'http://localhost:5173/' : `https://${domainName}/`,
    },
});
