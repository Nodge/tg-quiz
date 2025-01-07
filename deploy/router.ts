import { domainName, dns } from './domain';
import { api } from './api';
import { admin } from './admin';
import { site } from './site';

export const router = new sst.aws.Router('MainRouter', {
    domain: {
        name: domainName,
        dns,
    },
    routes: {
        '/api/*': {
            url: api.url,
            rewrite: { regex: '^/api/(.*)$', to: '/$1' },
        },
        ...($dev
            ? {
                  // Cannot proxy to local frontend applications in development mode since they do not have publicly available URLs.
              }
            : {
                  '/admin/*': {
                      url: admin.url,
                      rewrite: { regex: '^/admin/(.*)$', to: '/$1' },
                  },
                  '/*': {
                      url: site.url,
                  },
              }),
    },
});
