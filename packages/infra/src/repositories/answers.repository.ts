import { Resource } from 'sst';
import { type Answer, AnswersRepository } from '@quiz/core';

import { paginate } from '../lib/paginate';
import { db } from '../db';

export class DynamoDBAnswersRepository extends AnswersRepository {
    private tableName = Resource.AnswersTable.name;

    public async findAll(): Promise<Answer[]> {
        const answers = await paginate(key =>
            db.scan({
                TableName: this.tableName,
                ExclusiveStartKey: key,
            })
        );

        return answers as Answer[];
    }

    public async findByUserId(userId: string): Promise<Answer[]> {
        const answers = await paginate(key =>
            db.query({
                TableName: this.tableName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
                ExclusiveStartKey: key,
            })
        );

        return answers as Answer[];
    }

    public async create(data: Answer): Promise<Answer> {
        await db.put({
            TableName: this.tableName,
            Item: data,
        });
        return data;
    }

    public async deleteBatch(answers: Answer[]): Promise<void> {
        const chunkSize = 25;

        for (let i = 0; i < answers.length; i += chunkSize) {
            const batch = answers.slice(i, i + chunkSize);
            const deleteRequests = {
                RequestItems: {
                    [this.tableName]: batch.map(item => ({
                        DeleteRequest: {
                            Key: {
                                userId: item.userId,
                                questionId: item.questionId,
                            },
                        },
                    })),
                },
            };

            const res = await db.batchWrite(deleteRequests);

            if (Object.keys(res.UnprocessedItems ?? {}).length > 0) {
                throw new Error('Failed to delete answers');
            }
        }
    }
}
