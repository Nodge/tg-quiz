import { apiHandler } from '../shared/api-handler';
import { bot } from '../bot/bot';

export const handler = apiHandler(async () => {
    const botInfo = await bot.telegram.getMe();
    if (!botInfo) {
        throw new Error('Could not fetch Bot info!');
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ botInfo }),
    };
});
