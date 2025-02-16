import type { Question } from '@quiz/core';
import { apiHandler, inject } from '@quiz/shared';

import { init, questionsService } from '../../di';

init();

export interface SaveQuestionsOrderRequest {
    questions: Question[];
}

export const handler = apiHandler(async event => {
    const body = event.body;
    if (!body) {
        return {
            statusCode: 400,
            body: 'Empty body',
        };
    }

    const req = JSON.parse(body) as SaveQuestionsOrderRequest;

    const questions = inject(questionsService);
    await questions.saveQuestionsOrder(req.questions);

    return {
        statusCode: 201,
    };
});
