import { apiHandler } from '../shared/api-handler';
import { bot } from '../bot/bot';
import { initCommands } from '../bot/commands';

initCommands(bot);

export const handler = apiHandler(async event => {
    const body = event.body;
    if (!body) {
        return {
            statusCode: 400,
            body: 'Empty body',
        };
    }

    const update = JSON.parse(body);
    try {
        await bot.handleUpdate(update);
    } catch (err) {
        console.error(err);

        return {
            statusCode: 500,
            body: 'Internal server error',
        };
    }

    return {
        statusCode: 200,
    };
});
