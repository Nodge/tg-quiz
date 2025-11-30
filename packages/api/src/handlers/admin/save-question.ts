import { UpdateQuestionUseCase, type Question } from '@quiz/core';
import { apiHandler } from '@quiz/shared';
import { createRequestContext } from '../../lib/request-context';
import { validateCSRF } from '../../lib/csrf';

export interface SaveQuestionRequest {
    question: Question;
}

export const handler = apiHandler(async event => {
    if (!validateCSRF(event)) {
        return {
            statusCode: 400,
        };
    }

    const body = event.body;
    if (!body) {
        return {
            statusCode: 400,
            body: 'Empty body',
        };
    }

    const ctx = await createRequestContext(event);
    const req = JSON.parse(body) as SaveQuestionRequest;

    const updateQuestion = new UpdateQuestionUseCase(ctx.questionsRepository, ctx.currentUser);

    await updateQuestion.execute(req.question);

    return {
        statusCode: 201,
    };
});
