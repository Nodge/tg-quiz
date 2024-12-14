export interface User {
    telegramId: string;
    telegramLogin: string;
    telegramAvatarUrl: string | null;
    createdAt: number;
    currentMessageId: string | null;
    currentQuestionId: string | null;
}
