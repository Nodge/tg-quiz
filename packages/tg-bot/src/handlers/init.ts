import { apiHandler } from '@quiz/shared';

import { bot } from '../bot';

export const handler = apiHandler(async event => {
    const hostname = event.requestContext.domainName;
    if (!hostname) {
        throw new Error('Missing hostname in requestContext');
    }

    await updateBotData();
    await updateWebhook(hostname);

    return {
        statusCode: 200,
    };
});

async function updateBotData() {
    const targetName = 'Infra Quiz';

    const { name } = await bot.telegram.getMyName();
    if (name !== targetName) {
        await bot.telegram.setMyName(targetName);
    }

    await bot.telegram.setMyCommands([]);
}

async function updateWebhook(hostname: string) {
    const webhookUrl = `https://${hostname}/webhook`;
    await bot.telegram.setWebhook(webhookUrl);
}
