import { Question } from './Question';

const questions: Omit<Question, 'id' | 'index'>[] = [
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

const data: Question[] = questions.map((question, index) => {
    return {
        ...question,
        id: question.title,
        index,
    };
});

export class QuestionsRepository {
    public async getAllQuestions(): Promise<Question[]> {
        return data;
    }

    public async getQuestion(id: string): Promise<Question> {
        const question = data.find(question => question.id === id);
        if (!question) {
            throw new Error(`Question not found: ${id}`);
        }
        return question;
    }

    public async getNextQuestion(currentQuestionId: string | null): Promise<Question | null> {
        if (!currentQuestionId) {
            return data[0];
        }

        const currentIndex = data.findIndex(question => question.id === currentQuestionId);
        if (currentIndex < 0) {
            return null;
        }

        return data[currentIndex + 1] ?? null;
    }

    public async hasNextQuestion(currentQuestionId: string): Promise<boolean> {
        const currentIndex = data.findIndex(question => question.id === currentQuestionId);
        if (currentIndex < 0) {
            return false;
        }

        return data.length > currentIndex + 1;
    }
}
