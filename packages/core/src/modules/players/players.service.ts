import { inject } from '@quiz/shared';

import { type FileStorageRepository, fileStorageRepositoryToken, UploadedFile } from '../file-storage';

import type { Player } from './player.dto';
import { playersRepositoryToken, type NewPlayerData, type PlayersRepository } from './players.repository';

export class PlayersService {
    private players: PlayersRepository;
    private fileStorage: FileStorageRepository;

    constructor() {
        this.players = inject(playersRepositoryToken);
        this.fileStorage = inject(fileStorageRepositoryToken);
    }

    public async createOrUpdate(newPlayer: NewPlayerData): Promise<Player> {
        const player = await this.players.findById(newPlayer.telegramId);
        if (player) {
            return player;
        }

        return this.players.create(newPlayer);
    }

    public getById(id: string) {
        return this.players.findById(id);
    }

    public getAllPlayers() {
        return this.players.findAll();
    }

    public async setLastMessageId(player: Player, messageId: string | null, questionId: string | null) {
        await this.players.update({
            ...player,
            currentMessageId: messageId,
            currentQuestionId: questionId,
        });
    }

    public uploadAvatar(file: Blob): Promise<UploadedFile> {
        return this.fileStorage.upload(file);
    }

    public async getAvatarUrl(player: Player): Promise<string | null> {
        if (!player.avatarId) {
            return null;
        }

        const file = await this.fileStorage.findById(player.avatarId);
        if (!file) {
            throw new Error('Avatar file not found');
        }

        return file.url;
    }
}
