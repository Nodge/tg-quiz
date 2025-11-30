import type { Question } from '../entities/Question';
import type { QuestionsRepository } from '../repositories/questions.repository';
import type { CurrentUserService } from '../services/current-user.service';

export class CreateQuestionUseCase {
    constructor(
        private repository: QuestionsRepository,
        private currentUser: CurrentUserService
    ) {}

    async execute(question: Omit<Question, 'id'>): Promise<Question> {
        this.currentUser.assertAdmin();

        const item = await this.repository.create({
            id: crypto.randomUUID(),
            title: question.title,
            answers: question.answers,
            index: question.index,
        });

        return item;
    }
}
