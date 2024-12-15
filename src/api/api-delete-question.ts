import { Question } from '../model/Question';
import { QuestionsRepository } from '../model/QuestionsRepository';
import { apiHandler } from '../shared/api-handler';

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
    const questions = new QuestionsRepository();

    await questions.deleteQuestion(req.question);

    return {
        statusCode: 201,
    };
});
