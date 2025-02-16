import type { Question } from './question.dto';
import type { QuestionsRepository } from './questions.repository';

export class QuestionsService {
    private cache: Question[] | null;
    private repository: QuestionsRepository;

    public constructor(repository: QuestionsRepository) {
        this.cache = null;
        this.repository = repository;
    }

    public async getAllQuestions(): Promise<Question[]> {
        if (this.cache) {
            return this.cache;
        }

        const questions = await this.repository.findAll();

        questions.sort((a, b) => {
            return a.index - b.index;
        });

        this.cache = questions;
        return this.cache;
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
        return Boolean(await this.getNextQuestion(currentQuestionId));
    }

    public async create(question: Question): Promise<Question> {
        const item = await this.repository.create(question);
        this.cache = null;
        return item;
    }

    public async update(question: Question): Promise<void> {
        await this.repository.update(question);
        this.cache = null;
    }

    public async delete(question: Question): Promise<void> {
        await this.repository.delete(question.id);
        this.cache = null;
    }

    public async saveQuestionsOrder(questions: Question[]): Promise<void> {
        const savedQuestions = await this.getAllQuestions();
        const savedQuestionsMap = new Map<string, Question>(savedQuestions.map(item => [item.id, item]));
        const itemsToSave: Question[] = [];

        for (const item of questions) {
            const savedItem = savedQuestionsMap.get(item.id);
            if (savedItem && savedItem.index !== item.index) {
                itemsToSave.push({
                    ...savedItem,
                    index: item.index,
                });
            }
        }

        if (itemsToSave.length === 0) {
            return;
        }

        await this.repository.updateBatch(itemsToSave);

        this.cache = null;
    }
}
