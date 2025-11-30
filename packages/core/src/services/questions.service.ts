import type { Question } from '../entities/Question';
import type { QuestionsRepository } from '../repositories/questions.repository';

export class QuestionsService {
    private repository: QuestionsRepository;
    private cache: Question[] | null;

    public constructor(repository: QuestionsRepository) {
        this.repository = repository;
        this.cache = null;
    }

    public async getAllQuestions(): Promise<Question[]> {
        if (this.cache) {
            return this.cache;
        }

        const questions = await this.repository.findAll();

        this.cache = questions.toSorted((a, b) => {
            return a.index - b.index;
        });

        return this.cache;
    }

    public async getQuestionsCount(): Promise<number> {
        const questions = await this.getAllQuestions();
        return questions.length;
    }

    public async getQuestion(id: string): Promise<Question> {
        const questions = await this.getAllQuestions();
        const question = questions.find(question => question.id === id);

        if (!question) {
            throw new Error(`Question not found: ${id}`);
        }

        return question;
    }

    public async getNextQuestion(currentQuestionId: string | null): Promise<Question | null> {
        const questions = await this.getAllQuestions();

        if (!currentQuestionId) {
            return questions[0] ?? null;
        }

        const currentIndex = questions.findIndex(question => question.id === currentQuestionId);
        if (currentIndex < 0) {
            return null;
        }

        return questions[currentIndex + 1] ?? null;
    }

    public async hasNextQuestion(currentQuestionId: string): Promise<boolean> {
        const nextQuestion = await this.getNextQuestion(currentQuestionId);
        return nextQuestion !== null;
    }
}
