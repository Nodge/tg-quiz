import { Question, QuestionsRepository, QuestionState, QuizStateRepository, PlayerRepository } from '@quiz/core';
import { apiHandler } from '@quiz/shared';

export interface CurrentQuestionResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
    usersCount: number;
    questionsCount: number;
}

export const handler = apiHandler(async () => {
    const quizState = new QuizStateRepository();
    const questions = new QuestionsRepository();
    const players = new PlayerRepository();

    const state = await quizState.getCurrentQuestion();
    const question = state.id ? await questions.getQuestion(state.id) : null;
    const hasNextQuestion = state.id ? await questions.hasNextQuestion(state.id) : true;
    const allPlayers = await players.getAllUsers();

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
