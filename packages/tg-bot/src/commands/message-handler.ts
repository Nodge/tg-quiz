import type { TelegramBot } from '../bot';

export function registerMessageHandler(bot: TelegramBot) {
    bot.hears(/.*/, async ctx => {
        await ctx.reply('Ответы текстом не принимаются. Жмякай на кнопки в сообщениях.');
    });
}
