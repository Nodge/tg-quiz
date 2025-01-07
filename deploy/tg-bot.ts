import { usersTable, answersTable, quizStateTable, questionsTable } from './db';
import { domainName } from './domain';
import { avatarsBucket, avatarsCdnUrl } from './s3';
import { botToken, zoomLink } from './secrets';

const region = aws.getRegionOutput().name;

export const botApi = new sst.aws.ApiGatewayV2('BotApiRouter', {
    transform: {
        route: {
            handler: {
                link: [botToken, zoomLink, usersTable, questionsTable, answersTable, quizStateTable, avatarsBucket],
                environment: {
                    NODE_ENV: $dev ? 'development' : 'production',
                    S3_REGION_NAME: region,
                    TELEGRAM_BOT_TOKEN: botToken.value,
                    APP_STAGE: $app.stage,
                    SITE_URL: `https://${domainName}/`,
                    AVATARS_CDN_URL: avatarsCdnUrl,
                    AVATARS_BUCKET_NAME: avatarsBucket.name,
                },
            },
        },
    },
    accessLog: {
        retention: '1 week',
    },
    cors: false,
});

const initFn = botApi.route('POST /init', 'packages/tg-bot/src/handlers/init.handler');
botApi.route('POST /webhook', 'packages/tg-bot/src/handlers/webhook.handler');
botApi.route('GET /health', 'packages/tg-bot/src/handlers/health.handler');

$resolve({ url: botApi.url, init: initFn.nodes.function.arn }).apply(async ({ url }) => {
    const res = await fetch(`${url}/init`, {
        method: 'POST',
    });

    if (res.ok) {
        $util.log.info(`tg-bot successfully inited`);
    } else {
        const body = await res.text().catch(() => '');

        $util.log.error(`Failed to init tg-bot: ${res.status} ${body}`);
    }
});
