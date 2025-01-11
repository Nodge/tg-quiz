import { type Question, QuestionsService } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { init } from '../../init';

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

    const questions = new QuestionsService();
    await questions.saveQuestionsOrder(req.questions);

    return {
        statusCode: 201,
    };
});
