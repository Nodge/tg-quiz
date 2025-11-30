export interface Player {
    id: string;
    name: string;
    avatarId: string | null;
    createdAt: number;
    /** Exclude the player from leaderboard */
    blocked: boolean;
}
