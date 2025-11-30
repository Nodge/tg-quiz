import { Resource } from 'sst';
import { Context, Markup } from 'telegraf';
import type { Player, PlayerState, Question, QuestionAnswer } from '@quiz/core';
import { RateLimitedQueue, retry } from '@quiz/shared';

import { env } from '../lib/env';
import { escapeHTML } from '../lib/escape-html';
import { bot, type TelegramBot } from '../bot';

interface SendParams {
    userId: string;
    html: string;
    markup?: Parameters<TelegramBot['telegram']['sendMessage']>[2];
}

type Message = Awaited<ReturnType<TelegramBot['telegram']['sendMessage']>>;

export class PlayersNotificationService {
    private queue: RateLimitedQueue;

    constructor(private replyContext: Context | null) {
        this.queue = new RateLimitedQueue({ maxPerSecond: 20 });
    }

    public async sendWelcomeMessage(player: Player) {
        if (!this.replyContext) {
            throw new Error('Can not reply without replyContext');
        }

        const zoomLink = Resource.ZoomLink.value;

        const message = [
            `${escapeHTML(player.name) ?? 'Дружок'}, добро пожаловать в Infra Quiz!`,
            '',
            'Для участия в квизе:',
            `– залетай на <a href="${escapeHTML(zoomLink)}">встречу в zoom</a>`,
            '– слушай интересные истории и получай задания от ведущего',
            '– отвечай на вопросы через этот чат, нажимая на кнопку с правильным ответом',
            '– побеждай и получай новогоднюю ачивку на staff!',
            '',
            `<a href="${escapeHTML(env('SITE_URL'))}">За результатами можно следить здесь</a>`,
        ].join('\n');

        await this.replyContext.reply(message, {
            parse_mode: 'HTML',
            // @ts-expect-error Опция не описана в типах библиотеки
            disable_web_page_preview: true,
        });
    }

    public async sendNewQuestionMessage(player: Player, question: Question): Promise<{ id: string }> {
        const text = ['Вопрос:', question.title, '', 'Варианты ответов:'].join('\n');
        const answers = question.answers.map((answer, index) => {
            return Markup.button.callback(answer.title, `answer_${index}`);
        });

        const message = await this.send({
            userId: player.id,
            html: text,
            markup: Markup.inlineKeyboard(answers, { columns: 1 }),
        });

        return {
            id: message.message_id.toString(),
        };
    }

    public async sendFinishQuestionMessage(player: Player, state: PlayerState, question: Question): Promise<void> {
        const text = ['Вопрос:', question.title, '', 'Ваш ответ:', '—'].join('\n');
        await bot.telegram.editMessageText(player.id, Number(state.currentMessageId), undefined, text, {
            reply_markup: {
                inline_keyboard: [],
            },
        });
    }

    public async sendFinalMessage(player: Player): Promise<void> {
        const message = [
            '🎉 Infra Quiz завершен. Спасибо за участие! 🎉',
            '',
            `🔢 Ваши результаты: /results`,
            `🏆 Общий зачет: <a href="${escapeHTML(env('SITE_URL'))})">${escapeHTML(env('SITE_URL'))}</a>`,
        ].join('\n');

        await this.send({
            userId: player.id,
            html: message,
            markup: {
                parse_mode: 'HTML',
                // @ts-expect-error Опция не описана в типах библиотеки
                disable_web_page_preview: true,
            },
        });
    }

    public async sendAnswerConfirmation(question: Question, answer: QuestionAnswer) {
        if (!this.replyContext) {
            throw new Error('Can not reply without replyContext');
        }

        await this.replyContext.answerCbQuery('Ответ принят');

        const text = ['Вопрос:', question.title, '', 'Ваш ответ:', answer.title].join('\n');
        await this.replyContext.editMessageText(text, {
            parse_mode: undefined,
            reply_markup: undefined,
        });
    }

    public async sendAnswerRejection() {
        if (!this.replyContext) {
            throw new Error('Can not reply without replyContext');
        }

        try {
            await this.replyContext.editMessageReplyMarkup({ inline_keyboard: [] });
        } catch {
            // the keyboard might already be hidden
        }
    }

    private send(params: SendParams) {
        return new Promise<Message>((resolve, reject) => {
            this.queue
                .add(async () => {
                    await retry(
                        async () => {
                            const msg = await bot.telegram.sendMessage(params.userId, params.html, params.markup);
                            resolve(msg);
                        },
                        { maxRetries: 3 }
                    );
                })
                .catch(reject);
        });
    }
}
