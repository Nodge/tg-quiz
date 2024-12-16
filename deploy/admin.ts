import { api } from './api';
import { site } from './site';

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
        VITE_APP_API_URL: api.url,
        VITE_APP_SITE_URL: site.url,
    },
});
