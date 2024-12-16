import { AnswerRepository, Question, QuestionState, QiuzStateRepository } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

export interface ResetResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
}

export const handler = apiHandler(async () => {
    const quizState = new QiuzStateRepository();
    await quizState.resetState();

    const answers = new AnswerRepository();
    await answers.deleteAll();

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
