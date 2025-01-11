import { Resource } from 'sst';
import { KeyValueStoreRepository } from '@quiz/core';
import { db } from '../db';

export class DynamoDBKeyValueStoreRepository extends KeyValueStoreRepository {
    private tableName = Resource.QuizStateTable.name;

    public async get(key: string) {
        const res = await db.get({
            TableName: this.tableName,
            Key: {
                id: key,
            },
        });

        return res.Item?.value as unknown;
    }

    public async set(key: string, value: unknown) {
        await db.put({
            TableName: this.tableName,
            Item: {
                id: key,
                value,
            },
        });
    }

    public async delete(key: string) {
        await db.delete({
            TableName: this.tableName,
            Key: {
                id: key,
            },
        });
    }
}
