import type { Question, QuestionState, Player } from '@quiz/core';
import { apiHandler, inject, RateLimitedQueue, retry } from '@quiz/shared';
import { bot, Markup } from '@quiz/tg-bot';

import { init, playersService, questionsService, quizStateService } from '../../di';

init();

export interface NextQuestionResponse {
    question: Question;
    state: QuestionState;
    hasNextQuestion: boolean;
}

export const handler = apiHandler(async () => {
    const quizState = inject(quizStateService);
    const questions = inject(questionsService);

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

    await broadcastQuestionToPlayers(nextQuestion);

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

async function broadcastQuestionToPlayers(question: Question) {
    const players = inject(playersService);
    const allPlayers = await players.getAllPlayers();
    const queue = new RateLimitedQueue({ maxPerSecond: 20 });

    const promises: Promise<void>[] = [];

    for (const player of allPlayers) {
        const promise = retry(() => queue.add(() => sendQuestion(player, question)), { maxRetries: 3 });
        promises.push(
            promise.catch(err => {
                console.error(new Error(`Failed to start question for player ${player.telegramId}`, { cause: err }));
            })
        );
    }

    await Promise.all(promises);
}

async function sendQuestion(player: Player, question: Question) {
    const players = inject(playersService);

    const text = ['Вопрос:', question.title, '', 'Варианты ответов:'].join('\n');
    const answers = question.answers.map((answer, index) => {
        return Markup.button.callback(answer.title, `answer_${index}`);
    });

    const message = await bot.telegram.sendMessage(
        player.telegramId,
        text,
        Markup.inlineKeyboard(answers, {
            columns: 1,
        })
    );

    await players.setLastMessageId(player, message.message_id.toString(), question.id);
}
