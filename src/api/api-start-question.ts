import { Markup } from 'telegraf';

import { bot } from '../bot/bot';
import { Question } from '../model/Question';
import { QuestionsRepository } from '../model/QuestionsRepository';
import { QuestionState } from '../model/QuizState';
import { QiuzStateRepository } from '../model/QuizStateRepository';
import { UserRepository } from '../model/UserRepository';
import { User } from '../model/User';
import { apiHandler } from '../shared/api-handler';
import { RateLimitedQueue } from '../shared/rate-limiter';
import { retry } from '../shared/retry';

export interface NextQuestionResponse {
    question: Question;
    state: QuestionState;
    hasNextQuestion: boolean;
}

export const handler = apiHandler(async () => {
    const quizState = new QiuzStateRepository();
    const questions = new QuestionsRepository();

    const { id, state } = await quizState.getCurrentQuestion();
    const nextQuestion = await questions.getNextQuestion(id);

    if (state === 'ON_AIR') {
        throw new Error('Previous question has not been stopped');
    }

    if (!nextQuestion) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No next question available' }),
        };
    }

    const hasNextQuestion = await questions.hasNextQuestion(nextQuestion.id);

    await broadcastQuestionToUsers(nextQuestion);

    await quizState.setCurrentQuestion(nextQuestion.id, 'ON_AIR');

    const response: NextQuestionResponse = {
        question: nextQuestion,
        state: 'ON_AIR',
        hasNextQuestion,
    };

    return {
        statusCode: 201,
        body: JSON.stringify(response),
    };
});

async function broadcastQuestionToUsers(question: Question) {
    const users = new UserRepository();
    const allUsers = await users.getAllUsers();
    const queue = new RateLimitedQueue({ maxPerSecond: 20 });

    const promises: Promise<void>[] = [];

    for (const user of allUsers) {
        const promise = retry(() => queue.add(() => sendQuestion(user, question)), { maxRetries: 3 });
        promises.push(promise);
    }

    await Promise.all(promises);
}

async function sendQuestion(user: User, question: Question) {
    const users = new UserRepository();

    const text = ['Вопрос:', question.title, '', 'Варианты ответов:'].join('\n');
    const answers = question.answers.map((answer, index) => {
        return Markup.button.callback(answer.title, `answer_${index}`);
    });

    const message = await bot.telegram.sendMessage(
        user.telegramId,
        text,
        Markup.inlineKeyboard(answers, {
            columns: 1,
        })
    );

    await users.setLastMessageId(user, message.message_id.toString(), question.id);
}
