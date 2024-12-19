import { QuestionsRepository, QuestionState, QuizStateRepository, User, UserRepository } from '@quiz/core';
import { apiHandler, RateLimitedQueue, retry } from '@quiz/shared';
import { bot } from '@quiz/tg-bot';

export interface StopQuestionResponse {
    state: QuestionState;
}

export interface StopQuestionRequest {
    siteUrl: string;
}

export const handler = apiHandler(async event => {
    const body = event.body;
    if (!body) {
        return {
            statusCode: 400,
            body: 'Empty body',
        };
    }

    const req = JSON.parse(body) as StopQuestionRequest;

    const quizState = new QuizStateRepository();
    const questions = new QuestionsRepository();

    const { id, state } = await quizState.getCurrentQuestion();
    if (!id) {
        throw new Error('No current question');
    }

    if (state !== 'ON_AIR') {
        throw new Error('Question already stopped');
    }

    const hasNextQuestion = await questions.hasNextQuestion(id);
    await stopCurrentQuestionToUsers(req, hasNextQuestion);

    await quizState.setCurrentQuestion(id, 'STOPPED');

    const response: StopQuestionResponse = {
        state: 'STOPPED',
    };

    return {
        statusCode: 201,
        body: JSON.stringify(response),
    };
});

async function stopCurrentQuestionToUsers(req: StopQuestionRequest, hasNextQuestion: boolean) {
    const users = new UserRepository();
    const allUsers = await users.getAllUsers();
    const queue = new RateLimitedQueue({ maxPerSecond: 20 });

    const promises: Promise<void>[] = [];

    for (const user of allUsers) {
        const promise = retry(() => queue.add(() => stopQuestion(req, user, hasNextQuestion)), { maxRetries: 3 });
        promises.push(
            promise.catch(err => {
                console.error(new Error(`Failed to stop question for user ${user.telegramId}`, { cause: err }));
            })
        );
    }

    await Promise.all(promises);
}

async function stopQuestion(req: StopQuestionRequest, user: User, hasNextQuestion: boolean) {
    const users = new UserRepository();
    const questions = new QuestionsRepository();

    if (user.currentMessageId) {
        await bot.telegram.editMessageReplyMarkup(user.telegramId, Number(user.currentMessageId), undefined, {
            inline_keyboard: [],
        });

        if (user.currentQuestionId) {
            const question = await questions.getQuestion(user.currentQuestionId);
            const text = ['Вопрос:', question.title, '', 'Ваш ответ:', '—'].join('\n');
            await bot.telegram.editMessageText(user.telegramId, Number(user.currentMessageId), undefined, text);
        }
    }

    await users.setLastMessageId(user, null, null);

    if (!hasNextQuestion) {
        await sendFinalMessage(req, user);
    }
}

async function sendFinalMessage(req: StopQuestionRequest, user: User) {
    const message = [
        '🎉 Infra Quiz завершен\\. Спасибо за участие\\! 🎉',
        '',
        `🔢 Ваши результаты: /results`,
        `🏆 Общий зачет: [leaderboard](${req.siteUrl})`,
    ].join('\n');

    await bot.telegram.sendMessage(user.telegramId, message, {
        parse_mode: 'MarkdownV2',
        // @ts-expect-error Опция не описана в типах библиотеки
        disable_web_page_preview: true,
    });
}
