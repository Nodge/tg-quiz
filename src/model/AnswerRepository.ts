import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { Answer } from './Answer';

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
}
