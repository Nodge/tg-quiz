import { Question, QuestionsRepository } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

export interface QuestionsResponse {
    questions: Question[];
}

export const handler = apiHandler(async () => {
    const questions = new QuestionsRepository();

    const data: QuestionsResponse = {
        questions: await questions.getAllQuestions(),
    };

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
