import { AcceptPlayerAnswerUseCase } from '@quiz/core';

import type { TelegramBot } from '../bot';

export function registerAnswerHandler(bot: TelegramBot) {
    bot.action(/^answer_(\d+)$/, async ctx => {
        const playerId = ctx.from.id.toString();
        const messageId = ctx.update.callback_query.message?.message_id.toString();
        const id = ctx.match[1];

        if (!messageId) {
            throw new Error('No message id in reply');
        }

        const acceptAnswer = new AcceptPlayerAnswerUseCase(
            ctx.playersRepository,
            ctx.playerStateRepository,
            ctx.playersNotificationService,
            ctx.questionsService,
            ctx.answersRepository,
            ctx.quizStateService
        );

        await acceptAnswer.execute({
            playerId,
            messageId,
            index: Number(id),
        });
    });
}
