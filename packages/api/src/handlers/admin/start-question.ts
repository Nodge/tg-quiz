import { type Question, type QuestionState, ActivateNextQuestionUseCase } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { createRequestContext } from '../../lib/request-context';
import { validateCSRF } from '../../lib/csrf';

export interface NextQuestionResponse {
    question: Question;
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
    const activateQuestion = new ActivateNextQuestionUseCase(
        ctx.quizStateService,
        ctx.questionsService,
        ctx.playersRepository,
        ctx.playerStateRepository,
        ctx.playersNotificationService,
        ctx.currentUser
    );

    const nextQuestion = await activateQuestion.execute();
    if (!nextQuestion) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No next question available' }),
        };
    }

    const hasNextQuestion = await ctx.questionsService.hasNextQuestion(nextQuestion.id);

    const response: NextQuestionResponse = {
        question: nextQuestion,
        state: 'ON_AIR',
        hasNextQuestion,
    };

    return {
        statusCode: 201,
        body: JSON.stringify(response),
    };
});
