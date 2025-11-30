import { Resource } from 'sst';
import { array, assert, number, string, type } from 'superstruct';
import type { QuestionsRepository, Question } from '@quiz/core';
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { paginate } from '../lib/paginate';

const dbSchema = type({
    id: string(),
    title: string(),
    answers: array(
        type({
            id: string(),
            title: string(),
            score: number(),
        })
    ),
    index: number(),
});

export class DynamoDBQuestionsRepository implements QuestionsRepository {
    private tableName = Resource.QuestionsTable.name;

    constructor(private db: DynamoDBDocument) {}

    public async findAll(): Promise<Question[]> {
        const questions = await paginate(key =>
            this.db.scan({
                TableName: this.tableName,
                ExclusiveStartKey: key,
            })
        );

        assert(questions, array(dbSchema));
        return questions;
    }

    public async findById(id: string): Promise<Question | null> {
        const res = await this.db.get({
            TableName: this.tableName,
            Key: { id },
        });

        if (!res.Item) {
            return null;
        }

        assert(res.Item, dbSchema);
        return res.Item;
    }

    public async create(question: Question): Promise<Question> {
        await this.db.put({
            TableName: this.tableName,
            Item: question,
        });

        return question;
    }

    public async update(data: Question): Promise<void> {
        await this.db.put({
            TableName: this.tableName,
            Item: data,
        });
    }

    public async updateBatch(data: Question[]): Promise<void> {
        const chunkSize = 25;

        for (let i = 0; i < data.length; i += chunkSize) {
            const batch = data.slice(i, i + chunkSize);
            const res = await this.db.batchWrite({
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
        await this.db.delete({
            TableName: this.tableName,
            Key: { id },
        });
    }
}
