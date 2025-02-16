import type { Player, PlayersService } from '../players';
import type { Answer, AnswersService } from '../answers';

import { Leaderboard } from './leaderboard.dto';

export class LeaderboardService {
    private players: PlayersService;
    private answers: AnswersService;

    public constructor(players: PlayersService, answers: AnswersService) {
        this.players = players;
        this.answers = answers;
    }

    public async getLeaderboard(): Promise<Leaderboard> {
        const data: Leaderboard = [];

        const players = await this.players.getAllPlayers();
        const answers = await this.answers.getAllAnswers();

        const scoreMap = this.getScoreMap(answers);
        const createdAtMap = this.getRegisterDateMap(players);

        for (const player of players) {
            if (player.blocked) {
                continue;
            }

            data.push({
                userId: player.telegramId,
                name: player.telegramLogin,
                avatarUrl: await this.players.getAvatarUrl(player),
                score: scoreMap.get(player.telegramId) ?? 0,
            });
        }

        const now = Date.now();

        data.sort((a, b) => {
            const diff = b.score - a.score;
            if (diff !== 0) {
                return diff;
            }

            return (createdAtMap.get(a.userId) ?? now) - (createdAtMap.get(b.userId) ?? now);
        });

        return data;
    }

    private getScoreMap(answers: Answer[]) {
        const map = new Map<string, number>();

        for (const item of answers) {
            const { userId, score } = item;

            let total = map.get(userId) ?? 0;
            total += score;
            map.set(userId, total);
        }

        return map;
    }

    private getRegisterDateMap(players: Player[]) {
        const map = new Map<string, number>();

        for (const item of players) {
            map.set(item.telegramId, item.createdAt);
        }

        return map;
    }
}
