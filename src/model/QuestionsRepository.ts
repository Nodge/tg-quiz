import { Question } from './Question';

const questions: Question[] = [
    {
        title: 'Чо каво?',
        answers: [
            { title: 'A (correct)', score: 1 },
            { title: 'B', score: 0 },
            { title: 'C', score: 0 },
            { title: 'D', score: 0 },
        ],
    },
    {
        title: 'Чо каво 2?',
        answers: [
            { title: 'A', score: 0 },
            { title: 'B (correct)', score: 1 },
            { title: 'C', score: 0 },
            { title: 'D', score: 0 },
        ],
    },
    {
        title: 'Чо каво 3?',
        answers: [
            { title: 'A', score: 0 },
            { title: 'B', score: 0 },
            { title: 'C (correct)', score: 1 },
            { title: 'D', score: 0 },
        ],
    },
];

export class QuestionsRepository {
    public async getAllQuestions(): Promise<Question[]> {
        return questions;
    }

    public async getQuestion(id: string): Promise<Question> {
        const question = questions.find(question => question.title === id);
        if (!question) {
            throw new Error(`Question not found: ${id}`);
        }
        return question;
    }

    public async getNextQuestion(currentQuestionId: string | null): Promise<Question | null> {
        if (!currentQuestionId) {
            return questions[0];
        }

        const currentIndex = questions.findIndex(question => question.title === currentQuestionId);
        if (currentIndex < 0) {
            return null;
        }

        return questions[currentIndex + 1] ?? null;
    }

    public async hasNextQuestion(currentQuestionId: string): Promise<boolean> {
        const currentIndex = questions.findIndex(question => question.title === currentQuestionId);
        if (currentIndex < 0) {
            return false;
        }

        return questions.length > currentIndex + 1;
    }
}
