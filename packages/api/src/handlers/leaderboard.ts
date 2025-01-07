import { Answer, AnswerRepository, AvatarsRepository, Player, PlayerRepository } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

export interface LeaderBoardItem {
    userId: string;
    name: string;
    avatarUrl: string | null;
    score: number;
}

export type LeaderBoardResponse = LeaderBoardItem[];

export const handler = apiHandler(async () => {
    const players = new PlayerRepository();
    const answers = new AnswerRepository();
    const avatars = new AvatarsRepository();

    const data: LeaderBoardResponse = [];

    const allPlayers = await players.getAllUsers();
    const answersData = await answers.getAllAnswers();
    const scoreMap = getScoreMap(answersData);
    const createdAtMap = getRegisterDateMap(allPlayers);

    for (const player of allPlayers) {
        if (player.blocked) {
            continue;
        }

        data.push({
            userId: player.telegramId,
            name: player.telegramLogin,
            avatarUrl: player.avatarId ? await avatars.getUrl(player.avatarId) : null,
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

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});

function getScoreMap(answers: Answer[]) {
    const map = new Map<string, number>();

    for (const item of answers) {
        const { userId, score } = item;

        let total = map.get(userId) ?? 0;
        total += score;
        map.set(userId, total);
    }

    return map;
}

function getRegisterDateMap(players: Player[]) {
    const map = new Map<string, number>();

    for (const item of players) {
        map.set(item.telegramId, item.createdAt);
    }

    return map;
}
