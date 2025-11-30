import type { Question } from '@quiz/core';
import { apiHandler } from '@quiz/shared';
import { createRequestContext } from '../../lib/request-context';

export interface QuestionsResponse {
    questions: Question[];
}

export const handler = apiHandler(async event => {
    const ctx = await createRequestContext(event);

    const data: QuestionsResponse = {
        questions: await ctx.questionsService.getAllQuestions(),
    };

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
