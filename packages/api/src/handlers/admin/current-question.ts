import type { Question, QuestionState } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { createRequestContext } from '../../lib/request-context';

export interface CurrentQuestionResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
    usersCount: number;
    questionsCount: number;
}

export const handler = apiHandler(async event => {
    const ctx = await createRequestContext(event);

    const state = await ctx.quizStateService.getCurrentQuestion();
    const question = state.id ? await ctx.questionsService.getQuestion(state.id) : null;
    const hasNextQuestion = state.id ? await ctx.questionsService.hasNextQuestion(state.id) : true;
    const allPlayers = await ctx.playersRepository.findAll();

    const data: CurrentQuestionResponse = {
        question,
        state: state.state,
        hasNextQuestion,
        usersCount: allPlayers.filter(user => !user.blocked).length,
        questionsCount: await ctx.questionsService.getQuestionsCount(),
    };

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
