import { Telegraf } from 'telegraf';
import { env } from './env';

export type Bot = Telegraf;

export const bot: Bot = new Telegraf(env('TELEGRAM_BOT_TOKEN'));
