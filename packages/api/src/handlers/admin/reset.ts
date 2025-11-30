import { ResetQuizAnswersUseCase, type Question, type QuestionState } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { createRequestContext } from '../../lib/request-context';
import { validateCSRF } from '../../lib/csrf';

export interface ResetResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
}

export const handler = apiHandler(async event => {
    if (!validateCSRF(event)) {
        return {
            statusCode: 400,
        };
    }

    const ctx = await createRequestContext(event);

    const resetUseCase = new ResetQuizAnswersUseCase(ctx.quizStateService, ctx.answersRepository, ctx.currentUser);
    await resetUseCase.execute();

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
