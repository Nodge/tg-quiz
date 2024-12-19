import { api } from './api';

const site = new sst.aws.StaticSite('Site', {
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
        API_URL: api.url,
    },
});

let siteUrl = site.url;

if (!$dev) {
    const router = new sst.aws.Router('SiteRouter', {
        routes: {
            '/api/*': {
                url: api.url,
                rewrite: { regex: '^/api/(.*)$', to: '/$1' },
            },
            '/*': site.url,
        },
    });

    siteUrl = router.url;
}

export { siteUrl };
