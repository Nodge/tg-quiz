import { usersTable, answersTable, quizStateTable } from './db';
import { botToken } from './secrets';
import { site } from './site';

export const botApi = new sst.aws.ApiGatewayV2('BotApiRouter', {
    transform: {
        route: {
            handler: {
                link: [botToken, usersTable, answersTable, quizStateTable],
                environment: {
                    TELEGRAM_BOT_TOKEN: botToken.value,
                    APP_STAGE: $app.stage,
                    SITE_URL: site.url,
                },
            },
        },
    },
    accessLog: {
        retention: '1 week',
    },
    cors: false,
});

const initFn = botApi.route('POST /init', 'src/api/bot-init.handler');
botApi.route('POST /webhook', 'src/api/bot-webhook.handler');
botApi.route('GET /health', 'src/api/bot-health.handler');

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
