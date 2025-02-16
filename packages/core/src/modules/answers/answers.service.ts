import { type AnswersRepository } from './answers.repository';
import type { Answer } from './answer.dto';

export class AnswersService {
    private answers: AnswersRepository;

    public constructor(answers: AnswersRepository) {
        this.answers = answers;
    }

    public getAllAnswers(): Promise<Answer[]> {
        return this.answers.findAll();
    }

    public getUserAnswers(userId: string): Promise<Answer[]> {
        return this.answers.findByUserId(userId);
    }

    public create(answer: Omit<Answer, 'createdAt'>): Promise<Answer> {
        const obj: Answer = { ...answer, createdAt: Date.now() };
        return this.answers.create(obj);
    }

    public async deleteAll(): Promise<void> {
        const answers = await this.answers.findAll();
        await this.answers.deleteBatch(answers);
    }
}
