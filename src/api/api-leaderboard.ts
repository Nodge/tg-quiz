import { Answer } from '../model/Answer';
import { AnswerRepository } from '../model/AnswerRepository';
import { UserRepository } from '../model/UserRepository';
import { apiHandler } from '../shared/api-handler';

export interface LeaderBoardItem {
    name: string;
    avatarUrl: string | null;
    score: number;
}

export const handler = apiHandler(async () => {
    const users = new UserRepository();
    const answers = new AnswerRepository();

    const data: LeaderBoardItem[] = [];

    const usersData = await users.getAllUsers();
    const answersData = await answers.getAllAnswers();
    const scoreMap = getScoreMap(answersData);

    for (const user of usersData) {
        data.push({
            name: user.telegramLogin,
            avatarUrl: user.telegramAvatarUrl,
            score: scoreMap.get(user.telegramId) ?? 0,
        });
    }

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
