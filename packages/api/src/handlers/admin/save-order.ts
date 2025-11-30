import { ReorderQuestionsUseCase, type Question } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { createRequestContext } from '../../lib/request-context';
import { validateCSRF } from '../../lib/csrf';

export interface SaveQuestionsOrderRequest {
    questions: Question[];
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
    const req = JSON.parse(body) as SaveQuestionsOrderRequest;

    const reorderQuestions = new ReorderQuestionsUseCase(
        ctx.questionsRepository,
        ctx.questionsService,
        ctx.currentUser
    );
    await reorderQuestions.execute(req.questions);

    return {
        statusCode: 201,
    };
});
