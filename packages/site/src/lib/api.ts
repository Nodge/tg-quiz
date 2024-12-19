import type { LeaderBoardResponse } from '@quiz/api';

export async function getLeaderboard(): Promise<LeaderBoardResponse> {
    const res = await fetch('/api/leaderboard', { method: 'GET' });
    if (!res.ok) {
        throw new Error('Failed to get leaderboard');
    }
    const data = await res.json();
    return data;
}
