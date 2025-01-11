import { Question, QuestionsService } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { init } from '../../init';

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
    const questions = new QuestionsService();

    await questions.delete(req.question);

    return {
        statusCode: 201,
    };
});
