import type { Player } from '../entities/Player';
import type { FileStorageRepository } from '../repositories/file-storage.repository';
import type { PlayersRepository } from '../repositories/players.repository';

export interface NewPlayerData {
    externalId: string;
    name: string;
    avatar: Blob | null;
}

interface PlayersNotificationService {
    sendWelcomeMessage(player: Player): Promise<void>;
}

export class RegisterPlayerUseCase {
    constructor(
        private playersRepository: PlayersRepository,
        private fileStorage: FileStorageRepository,
        private playersNotificationService: PlayersNotificationService
    ) {}

    public async execute(newPlayer: NewPlayerData): Promise<void> {
        let player = await this.playersRepository.findById(newPlayer.externalId);
        if (player) {
            await this.updatePlayer(player, newPlayer);
            await this.playersNotificationService.sendWelcomeMessage(player);
            return;
        }

        const avatarId = newPlayer.avatar ? await this.uploadAvatar(newPlayer.avatar) : null;

        player = await this.playersRepository.create({
            id: newPlayer.externalId,
            name: newPlayer.name,
            avatarId,
            createdAt: Date.now(),
            blocked: false,
        });

        await this.playersNotificationService.sendWelcomeMessage(player);
    }

    private async updatePlayer(player: Player, newData: NewPlayerData) {
        const avatarId = newData.avatar ? await this.uploadAvatar(newData.avatar) : null;

        await this.playersRepository.update({
            ...player,
            name: newData.name,
            avatarId,
        });
    }

    private async uploadAvatar(file: Blob): Promise<string | null> {
        try {
            const uploadedFile = await this.fileStorage.upload(file);
            return uploadedFile.id;
        } catch (err) {
            console.error('Failed to save user avatar', err);
            return null;
        }
    }
}
