interface LeaderBoardItem {
    userId: string;
    name: string;
    avatarUrl: string | null;
    score: number;
}

export type Leaderboard = LeaderBoardItem[];
