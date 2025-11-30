import type { Leaderboard } from '@quiz/core';
import { apiHandler } from '@quiz/shared';
import { createRequestContext } from '../lib/request-context';

export type LeaderBoardResponse = Leaderboard;

export const handler = apiHandler(async event => {
    const ctx = await createRequestContext(event);
    const data = await ctx.leaderboardService.getLeaderboard();

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
