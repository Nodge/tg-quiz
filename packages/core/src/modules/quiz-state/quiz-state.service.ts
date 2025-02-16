import type { KeyValueStore } from '../kv-store';
import type { QuestionsService } from '../questions';

import type { QuizState, QuestionState } from './quiz-state.dto';

export type QuizStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';

export class QuizStateService {
    private store: KeyValueStore;
    private questions: QuestionsService;
    private stateKey = '2025';

    public constructor(kvStore: KeyValueStore, questions: QuestionsService) {
        this.store = kvStore;
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
        const state = await this.store.get<QuizState>(this.stateKey);

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
        await this.store.set(this.stateKey, {
            currentQuestionId: id,
            currentQuestionState: state,
        });
    }

    public async resetState(): Promise<void> {
        await this.store.delete(this.stateKey);
    }
}
