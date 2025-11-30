import type { Player } from '../entities/Player';
import type { PlayerAnswer } from '../entities/PlayerAnswer';
import type { Leaderboard } from '../entities/Leaderboard';
import type { PlayersRepository } from '../repositories/players.repository';
import type { AnswersRepository } from '../repositories/answers.repository';
import type { FileStorageRepository } from '../repositories/file-storage.repository';

export class LeaderboardService {
    private players: PlayersRepository;
    private answers: AnswersRepository;
    private fileStorage: FileStorageRepository;

    public constructor(
        playersRepository: PlayersRepository,
        answersRepository: AnswersRepository,
        fileStorage: FileStorageRepository
    ) {
        this.players = playersRepository;
        this.answers = answersRepository;
        this.fileStorage = fileStorage;
    }

    public async getLeaderboard(): Promise<Leaderboard> {
        const data: Leaderboard = [];

        const players = await this.players.findAll();
        const answers = await this.answers.findAll();

        const scoreMap = this.getScoreMap(answers);
        const createdAtMap = this.getRegistrationDateMap(players);

        for (const player of players) {
            if (player.blocked) {
                continue;
            }

            data.push({
                playerId: player.id,
                name: player.name,
                avatarUrl: await this.getAvatarUrl(player),
                score: scoreMap.get(player.id) ?? 0,
            });
        }

        const now = Date.now();

        data.sort((a, b) => {
            const diff = b.score - a.score;
            if (diff !== 0) {
                return diff;
            }

            return (createdAtMap.get(a.playerId) ?? now) - (createdAtMap.get(b.playerId) ?? now);
        });

        return data;
    }

    private async getAvatarUrl(player: Player): Promise<string | null> {
        if (!player.avatarId) {
            return null;
        }

        const file = await this.fileStorage.findById(player.avatarId);
        if (!file) {
            throw new Error('Avatar file not found');
        }

        return file.url;
    }

    private getScoreMap(answers: PlayerAnswer[]) {
        const map = new Map<string, number>();

        for (const item of answers) {
            const { playerId, score } = item;

            let total = map.get(playerId) ?? 0;
            total += score;
            map.set(playerId, total);
        }

        return map;
    }

    private getRegistrationDateMap(players: Player[]) {
        const map = new Map<string, number>();

        for (const player of players) {
            map.set(player.id, player.createdAt);
        }

        return map;
    }
}
