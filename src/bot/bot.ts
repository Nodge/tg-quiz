import { Telegraf } from 'telegraf';
import { env } from '../shared/env';

export type Bot = Telegraf;

export const bot = new Telegraf(env('TELEGRAM_BOT_TOKEN'));
