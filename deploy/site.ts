import { api } from './api';

export const site = new sst.aws.StaticSite('Site', {
    build: {
        command: 'pnpm run site:build',
        output: 'build',
    },
    dev: {
        command: 'pnpm run site:dev',
        url: 'http://localhost:5173/',
    },
    environment: {
        VITE_APP_API_URL: api.url,
    },
});
