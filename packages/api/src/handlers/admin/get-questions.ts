import { type Question, QuestionsService } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { init } from '../../init';

init();

export interface QuestionsResponse {
    questions: Question[];
}

export const handler = apiHandler(async () => {
    const questions = new QuestionsService();

    const data: QuestionsResponse = {
        questions: await questions.getAllQuestions(),
    };

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
