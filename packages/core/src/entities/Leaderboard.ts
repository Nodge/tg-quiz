interface LeaderBoardItem {
    playerId: string;
    name: string;
    avatarUrl: string | null;
    score: number;
}

export type Leaderboard = LeaderBoardItem[];
