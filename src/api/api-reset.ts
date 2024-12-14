import { Question } from '../model/Question';
import { QuestionState } from '../model/QuizState';
import { QiuzStateRepository } from '../model/QuizStateRepository';
import { apiHandler } from '../shared/api-handler';

export interface ResetResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
}

export const handler = apiHandler(async () => {
    const quizState = new QiuzStateRepository();
    await quizState.resetState();

    const response: ResetResponse = {
        question: null,
        state: 'STOPPED',
        hasNextQuestion: true,
    };

    return {
        statusCode: 201,
        body: JSON.stringify(response),
    };
});
