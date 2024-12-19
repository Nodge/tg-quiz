import { api } from './api';
import { siteUrl } from './site';

const admin = new sst.aws.StaticSite('Admin', {
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
        API_URL: api.url,
        VITE_SITE_URL: siteUrl,
    },
});

if (!$dev) {
    new sst.aws.Router('AdminRouter', {
        routes: {
            '/api/*': {
                url: api.url,
                rewrite: { regex: '^/api/(.*)$', to: '/$1' },
            },
            '/*': admin.url,
        },
    });
}
