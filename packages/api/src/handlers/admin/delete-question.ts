import type { Question } from '@quiz/core';
import { apiHandler, inject } from '@quiz/shared';

import { init, questionsService } from '../../di';

init();

export interface DeleteQuestionRequest {
    question: Question;
}

export const handler = apiHandler(async event => {
    const body = event.body;
    if (!body) {
        return {
            statusCode: 400,
            body: 'Empty body',
        };
    }

    const req = JSON.parse(body) as DeleteQuestionRequest;
    const questions = inject(questionsService);

    await questions.delete(req.question);

    return {
        statusCode: 201,
    };
});
