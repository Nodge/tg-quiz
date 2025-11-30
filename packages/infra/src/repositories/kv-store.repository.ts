import { Resource } from 'sst';
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export class DynamoDBKeyValueStoreRepository<T> {
    private tableName = Resource.QuizStateTable.name;

    public constructor(
        private key: string,
        private db: DynamoDBDocument
    ) {}

    public async load(): Promise<T | null> {
        const res = await this.db.get({
            TableName: this.tableName,
            Key: {
                id: this.key,
            },
        });

        return res.Item?.value as T;
    }

    public async save(value: T) {
        await this.db.put({
            TableName: this.tableName,
            Item: {
                id: this.key,
                value,
            },
        });
    }
}
