import { Resource } from 'sst';
import { RegisterPlayerUseCase } from '@quiz/core';

import type { TelegramBot } from '../bot';

export function registerStartCommand(bot: TelegramBot) {
    bot.start(async ctx => {
        const userId = ctx.from.id;

        let avatar: Blob | null = null;
        try {
            avatar = await loadAvatarFile(userId);
        } catch (err) {
            console.warn('Failed to load user avatar', err);
        }

        const registerPlayer = new RegisterPlayerUseCase(
            ctx.playersRepository,
            ctx.fileStorageRepository,
            ctx.playersNotificationService
        );

        await registerPlayer.execute({
            externalId: userId.toString(),
            name: ctx.from.username ?? ctx.from.first_name,
            avatar,
        });
    });

    async function loadAvatarFile(userId: number): Promise<Blob | null> {
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
        return blob;
    }
}
