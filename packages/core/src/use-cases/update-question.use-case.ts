import type { Question } from '../entities/Question';
import type { QuestionsRepository } from '../repositories/questions.repository';
import type { CurrentUserService } from '../services/current-user.service';

export class UpdateQuestionUseCase {
    constructor(
        private repository: QuestionsRepository,
        private currentUser: CurrentUserService
    ) {}

    async execute(question: Question): Promise<void> {
        this.currentUser.assertAdmin();

        await this.repository.update(question);
    }
}
