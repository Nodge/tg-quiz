import { createToken } from '@quiz/shared';

import type { Question } from './question.dto';

export abstract class QuestionsRepository {
    public abstract findAll(): Promise<Question[]>;
    public abstract findById(id: string): Promise<Question | null>;
    public abstract create(data: Omit<Question, 'id'>): Promise<Question>;
    public abstract update(data: Question): Promise<void>;
    public abstract updateBatch(data: Question[]): Promise<void>;
    public abstract delete(id: string): Promise<void>;
}

export const questionsRepositoryToken = createToken<QuestionsRepository>('QuestionsRepository');
