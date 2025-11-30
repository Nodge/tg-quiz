import type { Question } from '../entities/Question';

export interface QuestionsRepository {
    findAll(): Promise<Question[]>;
    findById(id: string): Promise<Question | null>;
    create(data: Question): Promise<Question>;
    update(data: Question): Promise<void>;
    updateBatch(data: Question[]): Promise<void>;
    delete(id: string): Promise<void>;
}
