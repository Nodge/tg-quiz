import { Bot } from '../bot';

export function registerMessageHandler(bot: Bot) {
    bot.hears(/.*/, async ctx => {
        await ctx.reply('Ответы текстом не принимаются. Жмякай на кнопки в сообщениях.');
    });
}
