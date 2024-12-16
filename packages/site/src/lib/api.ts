import type { LeaderBoardResponse } from '@quiz/api';

const API_URL = import.meta.env.VITE_APP_API_URL;

export async function getLeaderboard(): Promise<LeaderBoardResponse> {
    const res = await fetch(`${API_URL}/leaderboard`, { method: 'GET' });
    if (!res.ok) {
        throw new Error('Failed to get leaderboard');
    }
    const data = await res.json();
    return data;
}
