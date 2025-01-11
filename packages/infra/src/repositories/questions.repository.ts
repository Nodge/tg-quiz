import { Resource } from 'sst';
import { QuestionsRepository, type Question } from '@quiz/core';

import { paginate } from '../lib/paginate';
import { db } from '../db';

export class DynamoDBQuestionsRepository extends QuestionsRepository {
    private tableName = Resource.QuestionsTable.name;

    public async findAll(): Promise<Question[]> {
        const questions = await paginate(key =>
            db.scan({
                TableName: this.tableName,
                ExclusiveStartKey: key,
            })
        );

        return questions as Question[];
    }

    public async findById(id: string): Promise<Question | null> {
        const res = await db.get({
            TableName: this.tableName,
            Key: { id },
        });

        if (!res.Item) {
            return null;
        }

        return res.Item as Question;
    }

    public async create(data: Omit<Question, 'id'>): Promise<Question> {
        const question: Question = {
            ...data,
            id: crypto.randomUUID(),
        };

        await db.put({
            TableName: this.tableName,
            Item: question,
        });

        return question;
    }

    public async update(data: Question): Promise<void> {
        await db.put({
            TableName: this.tableName,
            Item: data,
        });
    }

    public async updateBatch(data: Question[]): Promise<void> {
        const chunkSize = 25;

        for (let i = 0; i < data.length; i += chunkSize) {
            const batch = data.slice(i, i + chunkSize);
            const res = await db.batchWrite({
                RequestItems: {
                    [this.tableName]: batch.map(item => ({
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
    }

    public async delete(id: string): Promise<void> {
        await db.delete({
            TableName: this.tableName,
            Key: { id },
        });
    }
}
