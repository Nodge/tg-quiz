import type { Question } from '@quiz/core';
import { apiHandler, inject } from '@quiz/shared';

import { init, questionsService } from '../../di';

init();

export interface SaveQuestionRequest {
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

    const req = JSON.parse(body) as SaveQuestionRequest;
    const questions = inject(questionsService);

    await questions.update(req.question);

    return {
        statusCode: 201,
    };
});
