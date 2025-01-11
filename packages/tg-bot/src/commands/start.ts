import { Resource } from 'sst';

import { PlayersService } from '@quiz/core';

import { escapeHTML } from '../lib/escape-html';

import { env } from '../env';
import { Bot } from '../bot';

export function registerStartCommand(bot: Bot) {
    const players = new PlayersService();

    bot.start(async ctx => {
        let avatarId: string | null = null;
        try {
            avatarId = await uploadAvatar(players, ctx.from.id);
        } catch (err) {
            console.warn('Failed to save user avatar', err);
        }

        await players.createOrUpdate({
            telegramId: ctx.from.id.toString(),
            telegramLogin: ctx.from.username ?? ctx.from.first_name,
            avatarId,
            blocked: false,
        });

        const zoomLink = Resource.ZoomLink.value;

        const name = ctx.from.first_name;
        const message = [
            `${escapeHTML(name) ?? 'Дружок'}, добро пожаловать в Infra Quiz!`,
            '',
            'Для участия в квизе:',
            `– залетай на <a href="${zoomLink}">встречу в zoom</a>`,
            '– слушай интересные истории и получай задания от ведущего',
            '– отвечай на вопросы через этот чат, нажимая на кнопку с правильным ответом',
            '– побеждай и получай новогоднюю ачивку на staff!',
            '',
            `<a href="${env('SITE_URL')}">За результатами можно следить здесь</a>`,
        ].join('\n');

        await ctx.reply(message, {
            parse_mode: 'HTML',
            // @ts-expect-error Опция не описана в типах библиотеки
            disable_web_page_preview: true,
        });
    });

    async function uploadAvatar(players: PlayersService, userId: number): Promise<string | null> {
        const photos = await bot.telegram.getUserProfilePhotos(userId);
        if (!photos || photos.total_count === 0) {
            return null;
        }

        const fileId = photos.photos?.[0]?.[0]?.file_id;
        if (!fileId) {
            return null;
        }

        const file = await bot.telegram.getFile(fileId);
        const url = `https://api.telegram.org/file/bot${Resource.TelegramBotToken.value}/${file.file_path}`;

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('failed to fetch image');
        }

        const blob = await res.blob();
        const avatar = await players.uploadAvatar(blob);

        return avatar.id;
    }
}
