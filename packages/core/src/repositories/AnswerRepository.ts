import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { Answer } from '../models/Answer';
import { paginate } from '../lib/paginate';

export class AnswerRepository {
    private db: DynamoDBDocument;

    public constructor() {
        const client = new DynamoDBClient();
        this.db = DynamoDBDocument.from(client);
    }

    public async getAllAnswers(): Promise<Answer[]> {
        const items = await paginate(key =>
            this.db.scan({
                TableName: Resource.AnswersTable.name,
                ExclusiveStartKey: key,
            })
        );
        return items as Answer[];
    }

    public async getUserAnswers(userId: string): Promise<Answer[]> {
        const items = await paginate(key =>
            this.db.query({
                TableName: Resource.AnswersTable.name,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
                ExclusiveStartKey: key,
            })
        );

        return items as Answer[];
    }

    public async createAnswer(input: Omit<Answer, 'createdAt'>): Promise<Answer> {
        const answer: Answer = {
            ...input,
            createdAt: Date.now(),
        };

        await this.db.put({
            TableName: Resource.AnswersTable.name,
            Item: answer,
        });

        return answer;
    }

    public async deleteAll(): Promise<void> {
        const items = (await paginate(key =>
            this.db.scan({
                TableName: Resource.AnswersTable.name,
                ExclusiveStartKey: key,
            })
        )) as Answer[];

        for (let i = 0; i < items.length; i += 25) {
            const batch = items.slice(i, i + 25);

            const deleteRequests = {
                RequestItems: {
                    [Resource.AnswersTable.name]: batch.map(item => ({
                        DeleteRequest: {
                            Key: {
                                userId: item.userId,
                                questionId: item.questionId,
                            },
                        },
                    })),
                },
            };

            const res = await this.db.batchWrite(deleteRequests);
            if (Object.keys(res.UnprocessedItems ?? {}).length > 0) {
                throw new Error('Failed to delete answers');
            }
        }
    }
}
