import { UserRepository } from '../model/UserRepository';
import { apiHandler } from '../shared/api-handler';

export interface LeaderBoardItem {
    name: string;
    avatarUrl: string | null;
    score: number;
}

export const handler = apiHandler(async () => {
    const data: LeaderBoardItem[] = [];

    const users = new UserRepository();
    const usersData = await users.getAllUsers();

    for (const user of usersData) {
        data.push({
            name: user.telegramLogin,
            avatarUrl: user.telegramAvatarUrl,
            score: 0,
        });
    }

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
