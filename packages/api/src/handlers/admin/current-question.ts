import type { Question, QuestionState } from '@quiz/core';
import { apiHandler, inject } from '@quiz/shared';

import { init, playersService, questionsService, quizStateService } from '../../di';

init();

export interface CurrentQuestionResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
    usersCount: number;
    questionsCount: number;
}

export const handler = apiHandler(async () => {
    const quizState = inject(quizStateService);
    const questions = inject(questionsService);
    const players = inject(playersService);

    const state = await quizState.getCurrentQuestion();
    const question = state.id ? await questions.getQuestion(state.id) : null;
    const hasNextQuestion = state.id ? await questions.hasNextQuestion(state.id) : true;
    const allPlayers = await players.getAllPlayers();

    const data: CurrentQuestionResponse = {
        question,
        state: state.state,
        hasNextQuestion,
        usersCount: allPlayers.filter(user => !user.blocked).length,
        questionsCount: (await questions.getAllQuestions()).length,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
