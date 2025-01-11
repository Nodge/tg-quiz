import { type Leaderboard, LeaderboardService } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { init } from '../init';

init();

export type LeaderBoardResponse = Leaderboard;

export const handler = apiHandler(async () => {
    const leaderboard = new LeaderboardService();
    const data = await leaderboard.getLeaderboard();

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
