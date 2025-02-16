import type { Answer, Question } from '@quiz/core';
import { inject, retry } from '@quiz/shared';

import { escapeHTML } from '../lib/escape-html';
import { sendMessageByChunks } from '../lib/send-message-by-chunks';

import { Bot } from '../bot';
import { env } from '../env';
import { answersService, questionsService, quizStateService } from '../di';

export function registerResultsCommand(bot: Bot) {
    const quisState = inject(quizStateService);
    const questions = inject(questionsService);
    const answers = inject(answersService);

    bot.command('results', async ctx => {
        const status = await quisState.getQuizStatus();
        if (status !== 'FINISHED') {
            await ctx.reply('Результаты недоступны');
            return;
        }

        const allQuestions = await questions.getAllQuestions();
        const allAnswers = await answers.getUserAnswers(ctx.from.id.toString());
        const answerMap = new Map<string, Answer>(allAnswers.map(answer => [answer.questionId, answer]));

        const message = formatMessage(allQuestions, answerMap);

        await sendMessageByChunks(message, '\n', async chunk => {
            await retry(() => ctx.reply(chunk, { parse_mode: 'HTML' }), { maxRetries: 3 });
        });
    });
}

function formatMessage(questions: Question[], answers: Map<string, Answer>) {
    const message: string[] = ['🎉 <b>Ваш результат</b> 🎉'];

    for (const question of questions) {
        message.push('');
        message.push(formatQuestion(question, answers.get(question.id)));
        message.push('');
    }

    message.push(formatFooter(Array.from(answers.values())));

    return message;
}

function formatQuestion(question: Question, answer: Answer | undefined): string {
    const message: string[] = [];

    message.push(formatNumber(question.index + 1));
    message.push(' ');
    message.push(escapeHTML(question.title));
    message.push('\n');

    const guessed = answer ? answer.score > 0 : false;
    const userAnswer = answer && question.answers.find(item => answer.answer === item.id);

    message.push(guessed ? '✅' : '❌');
    message.push(' ');
    message.push('<b>Ваш ответ:</b> ');
    message.push(escapeHTML(userAnswer?.title ?? '—'));

    if (guessed) {
        message.push(` (${formatScore(answer?.score ?? 0)})`);
    } else {
        const correctAnswer = question.answers.find(answer => answer.score > 0);
        message.push('\n');
        message.push(`✔️ <b>Правильный ответ:</b> ${escapeHTML(correctAnswer?.title ?? '')}`);
    }

    return message.join('');
}

const numbers = new Map([
    ['0', '0️⃣'],
    ['1', '1️⃣'],
    ['2', '2️⃣'],
    ['3', '3️⃣'],
    ['4', '4️⃣'],
    ['5', '5️⃣'],
    ['6', '6️⃣'],
    ['7', '7️⃣'],
    ['8', '8️⃣'],
    ['9', '9️⃣'],
]);

function formatNumber(n: number) {
    const chars = n.toString().split('');
    return chars.map(char => numbers.get(char) ?? char).join('');
}

function formatScore(n: number) {
    const rules = new Intl.PluralRules('ru');
    const rule = rules.select(n);

    const forms: Record<string, string> = {
        one: 'балл',
        few: 'балла',
        many: 'баллов',
    };

    const form = forms[rule] || forms.many;

    return `+${n} ${form}`;
}

function formatFooter(answers: Answer[]): string {
    const score = answers.reduce((sum, answer) => sum + answer.score, 0);

    const message: string[] = [
        '---',
        '',
        `🔢 <b>Сумма баллов:</b> ${score}`,
        `🏆 <b>Посмотреть общий зачет:</b> <a href="${env('SITE_URL')}">leaderboard</a>`,
        '',
        '---',
    ];

    return message.join('\n');
}
