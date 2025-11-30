import type { QuestionState } from '../entities/QuizState';
import type { QuizStateRepository } from '../repositories/quiz-state.repository';
import type { QuestionsService } from './questions.service';

export type QuizStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';

export class QuizStateService {
    private repository: QuizStateRepository;
    private questions: QuestionsService;

    public constructor(repository: QuizStateRepository, questions: QuestionsService) {
        this.repository = repository;
        this.questions = questions;
    }

    public async getQuizStatus(): Promise<QuizStatus> {
        const currentQuestion = await this.getCurrentQuestion();

        if (!currentQuestion.id) {
            return 'NOT_STARTED';
        }

        if (currentQuestion.state === 'ON_AIR') {
            return 'IN_PROGRESS';
        }

        const hasNextQuestion = await this.questions.hasNextQuestion(currentQuestion.id);
        if (hasNextQuestion) {
            return 'IN_PROGRESS';
        }

        return 'FINISHED';
    }

    public async getCurrentQuestion(): Promise<{ id: string | null; state: QuestionState }> {
        const state = await this.repository.load();

        if (state) {
            return {
                id: state.currentQuestionId,
                state: state.currentQuestionState,
            };
        }

        return {
            id: null,
            state: 'STOPPED',
        };
    }

    public async setCurrentQuestion(id: string, state: QuestionState): Promise<void> {
        await this.repository.save({
            currentQuestionId: id,
            currentQuestionState: state,
        });
    }

    public async resetState(): Promise<void> {
        await this.repository.save({
            currentQuestionId: null,
            currentQuestionState: 'STOPPED',
        });
    }
}
