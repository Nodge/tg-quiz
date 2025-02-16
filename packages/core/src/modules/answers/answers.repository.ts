import { Answer } from './answer.dto';

export abstract class AnswersRepository {
    public abstract findAll(): Promise<Answer[]>;
    public abstract findByUserId(userId: string): Promise<Answer[]>;
    public abstract create(data: Answer): Promise<Answer>;
    public abstract deleteBatch(answers: Answer[]): Promise<void>;
}
