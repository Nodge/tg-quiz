import {
    User,
    UserRepository,
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
        const users = new UserRepository();

        const userId = ctx.from.id.toString();
        const messageId = ctx.update.callback_query.message?.message_id.toString();
        const id = ctx.match[1];
        const answerIndex = Number(id);

        if (!messageId) {
            throw new Error('No message id in reply');
        }

        const user = await users.getUser(userId);
        if (!user) {
            console.warn(`Unknown user: ${userId}`);
            return;
        }

        if (messageId !== user.currentMessageId) {
            console.warn(`Outdated message reply: ${messageId} !== ${user.currentMessageId}`);
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            return;
        }

        const state = await quizState.getCurrentQuestion();
        if (!state.id) {
            console.warn(`Outdated message reply. Current question stopped.`);
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            return;
        }

        if (state.id !== user.currentQuestionId) {
            console.warn(`Outdated question reply: ${state.id} !== ${user.currentQuestionId}`);
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
            return;
        }

        const question = await questions.getQuestion(state.id);
        const answer = question.answers[answerIndex];
        if (!answer) {
            throw new Error(`Invalid answer index: ${answerIndex}`);
        }

        await acceptAnswer(user, question, answer);
        await ctx.answerCbQuery('Ответ принят');

        const text = ['Вопрос:', question.title, '', 'Ваш ответ:', answer.title].join('\n');
        await ctx.editMessageText(text, {
            reply_markup: undefined,
        });
    });

    async function acceptAnswer(user: User, question: Question, answer: QuestionAnswer) {
        const answers = new AnswerRepository();
        const users = new UserRepository();

        await answers.createAnswer({
            userId: user.telegramId,
            questionId: question.id,
            answer: answer.id,
            score: answer.score,
        });

        await users.setLastMessageId(user, null, null);
    }
}
