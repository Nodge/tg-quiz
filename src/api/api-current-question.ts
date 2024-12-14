import { Question } from '../model/Question';
import { QuestionsRepository } from '../model/QuestionsRepository';
import { QuestionState } from '../model/QuizState';
import { QiuzStateRepository } from '../model/QuizStateRepository';
import { UserRepository } from '../model/UserRepository';
import { apiHandler } from '../shared/api-handler';

export interface CurrentQuestionResponse {
    question: Question | null;
    state: QuestionState;
    hasNextQuestion: boolean;
    usersCount: number;
    questionsCount: number;
}

export const handler = apiHandler(async () => {
    const quizState = new QiuzStateRepository();
    const questions = new QuestionsRepository();
    const users = new UserRepository();

    const state = await quizState.getCurrentQuestion();
    const question = state.id ? await questions.getQuestion(state.id) : null;
    const hasNextQuestion = state.id ? await questions.hasNextQuestion(state.id) : true;
    const allUsers = await users.getAllUsers();

    const data: CurrentQuestionResponse = {
        question,
        state: state.state,
        hasNextQuestion,
        usersCount: allUsers.length,
        questionsCount: (await questions.getAllQuestions()).length,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
});
