import { AnswersService, type Question, type QuestionState, QuizStateService } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { init } from '../../init';

init();

export interface ResetResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
}

export const handler = apiHandler(async () => {
    const quizState = new QuizStateService();
    await quizState.resetState();

    const answers = new AnswersService();
    await answers.deleteAll();

    const response: ResetResponse = {
        question: null,
        state: 'STOPPED',
        hasNextQuestion: true,
    };

    return {
        statusCode: 201,
        body: JSON.stringify(response),
    };
});
