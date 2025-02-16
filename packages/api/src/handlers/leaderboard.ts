import type { Leaderboard } from '@quiz/core';
import { apiHandler, inject } from '@quiz/shared';

import { init, leaderboardService } from '../di';

init();

export type LeaderBoardResponse = Leaderboard;

export const handler = apiHandler(async () => {
    const leaderboard = inject(leaderboardService);
    const data = await leaderboard.getLeaderboard();

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
