import { type Question, QuestionsService, type QuestionState, QuizStateService, PlayersService } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

import { init } from '../../init';

init();

export interface CurrentQuestionResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
    usersCount: number;
    questionsCount: number;
}

export const handler = apiHandler(async () => {
    const quizState = new QuizStateService();
    const questions = new QuestionsService();
    const players = new PlayersService();

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
