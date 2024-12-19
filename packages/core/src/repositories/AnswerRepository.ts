import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { Answer } from '../models/Answer';

export class AnswerRepository {
    private db: DynamoDBDocument;

    public constructor() {
        const client = new DynamoDBClient();
        this.db = DynamoDBDocument.from(client);
    }

    public async getAllAnswers(): Promise<Answer[]> {
        const res = await this.db.scan({
            TableName: Resource.AnswersTable.name,
        });

        return (res.Items ?? []) as Answer[];
    }

    public async getUserAnswers(userId: string): Promise<Answer[]> {
        const items: Answer[] = [];
        let lastKey: Record<string, unknown> | undefined = undefined;

        do {
            const res = await this.db.query({
                TableName: Resource.AnswersTable.name,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
                ExclusiveStartKey: lastKey,
            });

            items.push(...res.Items);
            lastKey = res.LastEvaluatedKey;
        } while (lastKey);

        return items;
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
        const scanResult = await this.db.scan({ TableName: Resource.AnswersTable.name });
        const items = (scanResult.Items as Answer[] | undefined) || [];

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
