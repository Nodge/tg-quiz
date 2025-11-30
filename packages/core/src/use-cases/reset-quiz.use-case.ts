import type { AnswersRepository } from '../repositories/answers.repository';
import type { CurrentUserService } from '../services/current-user.service';
import { QuizStateService } from '../services/quiz-state.service';

export class ResetQuizAnswersUseCase {
    constructor(
        private quizStateService: QuizStateService,
        private answersRepository: AnswersRepository,
        private currentUser: CurrentUserService
    ) {}

    async execute(): Promise<void> {
        this.currentUser.assertAdmin();

        await this.quizStateService.resetState();

        const answers = await this.answersRepository.findAll();
        await this.answersRepository.deleteBatch(answers.map(answer => answer.id));
    }
}
