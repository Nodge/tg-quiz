import { Telegraf, Context } from 'telegraf';
import { env } from './lib/env';
import { createMessageContext, MessageContext } from './lib/message-context';

interface CustomContext extends Context, MessageContext {}

export type TelegramBot = Telegraf<CustomContext>;

export const bot: TelegramBot = new Telegraf<CustomContext>(env('TELEGRAM_BOT_TOKEN'));

bot.use(async (ctx, next) => {
    const services = await createMessageContext(ctx);
    Object.assign(ctx, services);
    return next();
});
