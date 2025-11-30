/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: 'infra-quiz',
            removal: 'remove',
            home: 'aws',
            providers: {
                aws: {
                    region: 'eu-north-1',
                },
                cloudflare: true,
            },
        };
    },
    async run() {
        $transform(sst.aws.Function, args => {
            args.architecture = 'arm64';
            args.runtime = 'nodejs22.x';
        });

        const { domainName } = await import('./deploy/domain');
        await import('./deploy/db');
        await import('./deploy/s3');
        await import('./deploy/api');
        await import('./deploy/auth');
        await import('./deploy/site');
        await import('./deploy/admin');
        await import('./deploy/tg-bot');
        await import('./deploy/router');
        await import('./deploy/email');

        return {
            Region: aws.getRegionOutput().name,
            Domain: domainName,
        };
    },
});
