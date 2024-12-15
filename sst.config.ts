/// <reference path="./.sst/platform/config.d.ts" />

import dotenv from 'dotenv';
dotenv.config();

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
            },
        };
    },
    async run() {
        $transform(sst.aws.Function, args => {
            args.architecture = 'arm64';
            args.runtime = 'nodejs20.x';
            // args.memory = '512 MB';
        });

        await import('./deploy/db');
        await import('./deploy/s3');
        const { api } = await import('./deploy/api');
        const { site } = await import('./deploy/site');
        const { botApi } = await import('./deploy/tg-bot');

        return {
            Region: aws.getRegionOutput().name,
            Api: api.url,
            Site: site.url,
            BotApi: botApi.url,
        };
    },
});
