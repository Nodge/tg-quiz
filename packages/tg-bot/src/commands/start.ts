import { Resource } from 'sst';

import { UserRepository, AvatarsRepository } from '@quiz/core';

import { env } from '../env';
import { Bot } from '../bot';

export function registerStartCommand(bot: Bot) {
    bot.start(async ctx => {
        const users = new UserRepository();

        let avatarId: string | null = null;
        try {
            avatarId = await uploadAvatar(ctx.from.id);
        } catch (err) {
            console.warn('Failed to save user avatar', err);
        }

        await users.createUser({
            telegramId: ctx.from.id.toString(),
            telegramLogin: ctx.from.username ?? ctx.from.first_name,
            avatarId,
            blocked: false,
        });

        const zoomLink = Resource.ZoomLink.value;

        const name = ctx.from.first_name;
        const message = [
            `${name ?? 'Дружок'}, добро пожаловать в Infra Quiz\\!`,
            '',
            'Для участия в квизе:',
            `– залетай на [встречу в zoom](${zoomLink})`,
            '– слушай интересные истории и получай задания от ведущего',
            '– отвечай на вопросы через этот чат, нажимая на кнопку с правильным ответом',
            '– побеждай и получай новогоднюю ачивку на staff\\!',
            '',
            `[За результатами можно следить здесь](${env('SITE_URL')})`,
        ].join('\n');

        await ctx.reply(message, {
            parse_mode: 'MarkdownV2',
            // @ts-expect-error Опция не описана в типах библиотеки
            disable_web_page_preview: true,
        });
    });

    async function uploadAvatar(userId: number): Promise<string | null> {
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

        const avatars = new AvatarsRepository();
        const avatarId = await avatars.upload(blob);

        return avatarId;
    }
}
