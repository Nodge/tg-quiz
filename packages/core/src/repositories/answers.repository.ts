import type { PlayerAnswer } from '../entities/PlayerAnswer';

export interface AnswersRepository {
    findAll(): Promise<PlayerAnswer[]>;
    findAllByUserId(userId: string): Promise<PlayerAnswer[]>;
    create(data: PlayerAnswer): Promise<PlayerAnswer>;
    deleteBatch(ids: string[]): Promise<void>;
}
