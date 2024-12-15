import { Question } from '../model/Question';
import { QuestionsRepository } from '../model/QuestionsRepository';
import { apiHandler } from '../shared/api-handler';

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
