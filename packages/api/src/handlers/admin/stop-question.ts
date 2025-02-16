import type { QuestionState, Player } from '@quiz/core';
import { apiHandler, inject, RateLimitedQueue, retry } from '@quiz/shared';
import { bot } from '@quiz/tg-bot';

import { init, playersService, questionsService, quizStateService } from '../../di';

init();

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

    const quizState = inject(quizStateService);
    const questions = inject(questionsService);

    const { id, state } = await quizState.getCurrentQuestion();
    if (!id) {
        throw new Error('No current question');
    }

    if (state !== 'ON_AIR') {
        throw new Error('Question already stopped');
    }

    const hasNextQuestion = await questions.hasNextQuestion(id);
    await stopCurrentQuestionToPlayers(req, hasNextQuestion);

    await quizState.setCurrentQuestion(id, 'STOPPED');

    const response: StopQuestionResponse = {
        state: 'STOPPED',
    };

    return {
        statusCode: 201,
        body: JSON.stringify(response),
    };
});

async function stopCurrentQuestionToPlayers(req: StopQuestionRequest, hasNextQuestion: boolean) {
    const players = inject(playersService);
    const allPlayers = await players.getAllPlayers();
    const queue = new RateLimitedQueue({ maxPerSecond: 20 });

    const promises: Promise<void>[] = [];

    for (const player of allPlayers) {
        const promise = retry(() => queue.add(() => stopQuestion(req, player, hasNextQuestion)), { maxRetries: 3 });
        promises.push(
            promise.catch(err => {
                console.error(new Error(`Failed to stop question for player ${player.telegramId}`, { cause: err }));
            })
        );
    }

    await Promise.all(promises);
}

async function stopQuestion(req: StopQuestionRequest, player: Player, hasNextQuestion: boolean) {
    const players = inject(playersService);
    const questions = inject(questionsService);

    if (player.currentMessageId) {
        await bot.telegram.editMessageReplyMarkup(player.telegramId, Number(player.currentMessageId), undefined, {
            inline_keyboard: [],
        });

        if (player.currentQuestionId) {
            const question = await questions.getQuestion(player.currentQuestionId);
            const text = ['Вопрос:', question.title, '', 'Ваш ответ:', '—'].join('\n');
            await bot.telegram.editMessageText(player.telegramId, Number(player.currentMessageId), undefined, text);
        }
    }

    await players.setLastMessageId(player, null, null);

    if (!hasNextQuestion) {
        await sendFinalMessage(req, player);
    }
}

async function sendFinalMessage(req: StopQuestionRequest, player: Player) {
    const message = [
        '🎉 Infra Quiz завершен\\. Спасибо за участие\\! 🎉',
        '',
        `🔢 Ваши результаты: /results`,
        `🏆 Общий зачет: [leaderboard](${req.siteUrl})`,
    ].join('\n');

    await bot.telegram.sendMessage(player.telegramId, message, {
        parse_mode: 'MarkdownV2',
        // @ts-expect-error Опция не описана в типах библиотеки
        disable_web_page_preview: true,
    });
}
