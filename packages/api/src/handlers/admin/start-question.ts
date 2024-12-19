import { Question, QuestionsRepository, QuestionState, QuizStateRepository, User, UserRepository } from '@quiz/core';
import { apiHandler, RateLimitedQueue, retry } from '@quiz/shared';
import { bot, Markup } from '@quiz/tg-bot';

export interface NextQuestionResponse {
    question: Question;
    state: QuestionState;
    hasNextQuestion: boolean;
}

export const handler = apiHandler(async () => {
    const quizState = new QuizStateRepository();
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
        promises.push(
            promise.catch(err => {
                console.error(new Error(`Failed to start question for user ${user.telegramId}`, { cause: err }));
            })
        );
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
