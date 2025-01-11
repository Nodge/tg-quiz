import { apiHandler } from '@quiz/shared';

import { bot } from '../bot';
import { init } from '../init';
import { initCommands } from '../commands';

init();
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
