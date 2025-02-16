import type { Question, QuestionState } from '@quiz/core';
import { apiHandler, inject } from '@quiz/shared';

import { answersService, init, quizStateService } from '../../di';

init();

export interface ResetResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
}

export const handler = apiHandler(async () => {
    const quizState = inject(quizStateService);
    await quizState.resetState();

    const answers = inject(answersService);
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
