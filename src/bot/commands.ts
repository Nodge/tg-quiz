import { Resource } from 'sst';

import { env } from '../shared/env';
import { User } from '../model/User';
import { UserRepository } from '../model/UserRepository';
import { QuestionsRepository } from '../model/QuestionsRepository';
import { QiuzStateRepository } from '../model/QuizStateRepository';

import { Bot } from './bot';
import { AnswerRepository } from '../model/AnswerRepository';

export function initCommands(bot: Bot) {
    bot.start(async ctx => {
        const name = ctx.from.first_name;

        const user: Omit<User, 'createdAt' | 'currentMessageId' | 'currentQuestionId'> = {
            telegramId: ctx.from.id.toString(),
            telegramLogin: ctx.from.username ?? ctx.from.first_name,
            telegramAvatarUrl: null,
        };

        const photos = await ctx.telegram.getUserProfilePhotos(ctx.from.id);
        if (photos && photos.total_count > 0) {
            const fileId = photos.photos[0][0].file_id;
            const file = await ctx.telegram.getFile(fileId);
            const url = `https://api.telegram.org/file/bot${Resource.TelegramBotToken.value}/${file.file_path}`;
            user.telegramAvatarUrl = url;
        }

        const users = new UserRepository();
        await users.createUser(user);

        const message = [
            `${name ?? 'Дружок'}, добро пожаловать в Infra Quiz 2025\\!`,
            '',
            'Для участия в квизе:',
            '– залетай на [встречу в zoom](https://ya.ru/)',
            '– слушай интересные истории и получай задания от ведущего',
            '– отвечай на вопросы через этот чат, нажимая на кнопку с правильным ответом',
            '– побеждай и получай новогоднюю авичку на staff\\!',
            '',
            `[За результатами можно сделить здесь](${env('SITE_URL')})`,
        ].join('\n');

        await ctx.reply(message, {
            parse_mode: 'MarkdownV2',
            // @ts-expect-error Опция не описана в типах библиотеки
            disable_web_page_preview: true,
        });
    });

    bot.action(/^answer_(\d+)$/, async ctx => {
        const userId = ctx.from.id.toString();
        const messageId = ctx.update.callback_query.message?.message_id.toString();
        const id = ctx.match[1];
        const answerIndex = Number(id);

        if (!messageId) {
            throw new Error('No message id in reply');
        }

        const quizState = new QiuzStateRepository();
        const questions = new QuestionsRepository();
        const users = new UserRepository();
        const answers = new AnswerRepository();

        const user = await users.getUser(userId);
        if (!user) {
            console.warn(`Unknown user: ${userId}`);
            return;
        }

        if (messageId !== user.currentMessageId) {
            console.warn(`Outdated message reply: ${messageId} !== ${user.currentMessageId}`);
            await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

            // await ctx.editMessageText(ctx.callbackQuery.message., {
            //     reply_markup: undefined,
            // });
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

        await answers.createAnswer({
            userId: user.telegramId,
            questionId: question.title,
            answer: answer.title,
            score: answer.score,
        });
        await users.setLastMessageId(user, null, null);

        const text = ['Вопрос:', question.title, '', 'Ваш ответ:', answer.title].join('\n');
        await ctx.editMessageText(text, {
            reply_markup: undefined,
        });
    });

    bot.hears(/.*/, async ctx => {
        const messages = [
            'Ответы текстом не принимаются. Жмякай на кнопки в сообщениях.',
            'не пиши мне больше, а то по ip вычислю!',
            'нууу епт, опять ты за свое??',
        ];
        const index = Math.floor(Math.random() * messages.length);

        console.log({ index });

        await ctx.reply(messages[index]);
    });
}
