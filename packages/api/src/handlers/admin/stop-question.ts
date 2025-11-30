import { type QuestionState, FinishQuestionUseCase } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { createRequestContext } from '../../lib/request-context';
import { validateCSRF } from '../../lib/csrf';

export interface StopQuestionResponse {
    state: QuestionState;
}

export const handler = apiHandler(async event => {
    if (!validateCSRF(event)) {
        return {
            statusCode: 400,
        };
    }

    const ctx = await createRequestContext(event);

    const finishQuestion = new FinishQuestionUseCase(
        ctx.quizStateService,
        ctx.questionsService,
        ctx.playersRepository,
        ctx.playerStateRepository,
        ctx.playersNotificationService,
        ctx.currentUser
    );
    await finishQuestion.execute();

    const response: StopQuestionResponse = {
        state: 'STOPPED',
    };

    return {
        statusCode: 201,
        body: JSON.stringify(response),
    };
});
