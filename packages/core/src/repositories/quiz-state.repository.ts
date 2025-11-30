import { QuizState } from '../entities/QuizState';

export interface QuizStateRepository {
    load(): Promise<QuizState | null>;
    save(state: QuizState): Promise<void>;
}
