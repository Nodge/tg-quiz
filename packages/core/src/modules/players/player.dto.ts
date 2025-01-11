export interface Player {
    telegramId: string;
    telegramLogin: string;
    avatarId: string | null;
    createdAt: number;
    currentMessageId: string | null;
    currentQuestionId: string | null;
    blocked: boolean;
}
