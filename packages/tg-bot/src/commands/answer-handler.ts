import {
    Player,
    PlayerRepository,
    QuestionsRepository,
    QuizStateRepository,
    AnswerRepository,
    Question,
    QuestionAnswer,
} from '@quiz/core';

import { Bot } from '../bot';

export function registerAnswerHandler(bot: Bot) {
    bot.action(/^answer_(\d+)$/, async ctx => {
        const quizState = new QuizStateRepository();
        const questions = new QuestionsRepository();
        const players = new PlayerRepository();

        const userId = ctx.from.id.toString();
        const messageId = ctx.update.callback_query.message?.message_id.toString();
        const id = ctx.match[1];
        const answerIndex = Number(id);

        if (!messageId) {
            throw new Error('No message id in reply');
        }

        const player = await players.getUser(userId);
        if (!player) {
            console.warn(`Unknown user: ${userId}`);
            return;
        }

        if (messageId !== player.currentMessageId) {
            console.warn(`Outdated message reply: ${messageId} !== ${player.currentMessageId}`);
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            return;
        }

        const state = await quizState.getCurrentQuestion();
        if (!state.id) {
            console.warn(`Outdated message reply. Current question stopped.`);
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            return;
        }

        if (state.id !== player.currentQuestionId) {
            console.warn(`Outdated question reply: ${state.id} !== ${player.currentQuestionId}`);
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            return;
        }

        const question = await questions.getQuestion(state.id);
        const answer = question.answers[answerIndex];
        if (!answer) {
            throw new Error(`Invalid answer index: ${answerIndex}`);
        }

        await acceptAnswer(player, question, answer);
        await ctx.answerCbQuery('Ответ принят');

        const text = ['Вопрос:', question.title, '', 'Ваш ответ:', answer.title].join('\n');
        await ctx.editMessageText(text, {
            reply_markup: undefined,
        });
    });

    async function acceptAnswer(player: Player, question: Question, answer: QuestionAnswer) {
        const answers = new AnswerRepository();
        const users = new PlayerRepository();

        await answers.createAnswer({
            userId: player.telegramId,
            questionId: question.id,
            answer: answer.id,
            score: answer.score,
        });

        await users.setLastMessageId(player, null, null);
    }
}
