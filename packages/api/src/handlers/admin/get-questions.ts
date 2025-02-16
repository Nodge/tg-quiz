import type { Question } from '@quiz/core';
import { apiHandler, inject } from '@quiz/shared';

import { init, questionsService } from '../../di';

init();

export interface QuestionsResponse {
    questions: Question[];
}

export const handler = apiHandler(async () => {
    const questions = inject(questionsService);

    const data: QuestionsResponse = {
        questions: await questions.getAllQuestions(),
    };

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
