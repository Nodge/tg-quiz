import { Answer, AnswerRepository, AvatarsRepository, User, UserRepository } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

export interface LeaderBoardItem {
    userId: string;
    name: string;
    avatarUrl: string | null;
    score: number;
}

export type LeaderBoardResponse = LeaderBoardItem[];

export const handler = apiHandler(async () => {
    const users = new UserRepository();
    const answers = new AnswerRepository();
    const avatars = new AvatarsRepository();

    const data: LeaderBoardResponse = [];

    const usersData = await users.getAllUsers();
    const answersData = await answers.getAllAnswers();
    const scoreMap = getScoreMap(answersData);
    const createdAtMap = getRegisterDateMap(usersData);

    for (const user of usersData) {
        if (user.blocked) {
            continue;
        }

        data.push({
            userId: user.telegramId,
            name: user.telegramLogin,
            avatarUrl: user.avatarId ? await avatars.getUrl(user.avatarId) : null,
            score: scoreMap.get(user.telegramId) ?? 0,
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

function getRegisterDateMap(users: User[]) {
    const map = new Map<string, number>();

    for (const item of users) {
        map.set(item.telegramId, item.createdAt);
    }

    return map;
}
