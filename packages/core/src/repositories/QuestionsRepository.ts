import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { Question } from '../models/Question';

export class QuestionsRepository {
    private db: DynamoDBDocument;
    private cache: Question[] | null = null;

    public constructor() {
        const client = new DynamoDBClient();
        this.db = DynamoDBDocument.from(client);
    }

    public async getAllQuestions(): Promise<Question[]> {
        if (this.cache) {
            return this.cache;
        }

        const res = await this.db.scan({
            TableName: Resource.QuestionsTable.name,
        });

        const questions = (res.Items ?? []) as Question[];

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
        const questions = await this.getAllQuestions();
        const currentIndex = questions.findIndex(question => question.id === currentQuestionId);
        if (currentIndex < 0) {
            return false;
        }

        return questions.length > currentIndex + 1;
    }

    public async saveQuestion(question: Question): Promise<void> {
        const item = await this.db.get({
            TableName: Resource.QuestionsTable.name,
            Key: { id: question.id },
        });
        const index = (item.Item as Question | undefined)?.index;

        await this.db.put({
            TableName: Resource.QuestionsTable.name,
            Item: {
                ...question,
                index: index ?? question.index,
            },
        });

        this.cache = null;
    }

    public async deleteQuestion(question: Question): Promise<void> {
        await this.db.delete({
            TableName: Resource.QuestionsTable.name,
            Key: { id: question.id },
        });

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

        for (let i = 0; i < itemsToSave.length; i += 25) {
            const batch = itemsToSave.slice(i, i + 25);

            const res = await this.db.batchWrite({
                RequestItems: {
                    [Resource.QuestionsTable.name]: batch.map(item => ({
                        PutRequest: {
                            Item: item,
                        },
                    })),
                },
            });

            if (Object.keys(res.UnprocessedItems ?? {}).length > 0) {
                throw new Error('Failed to reorder questions');
            }
        }

        this.cache = null;
    }
}
