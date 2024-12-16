import { api } from './api';

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
        VITE_APP_API_URL: api.url,
    },
});
