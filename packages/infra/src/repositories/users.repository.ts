import { Resource } from 'sst';
import { assert, literal, number, string, type, union } from 'superstruct';
import type { UsersRepository, User } from '@quiz/core';
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dbSchema = type({
    id: string(),
    email: string(),
    role: union([literal('basic'), literal('admin')]),
    createdAt: number(),
});

export class DynamoDBUsersRepository implements UsersRepository {
    private tableName = Resource.UserAccountsTable.name;

    constructor(private db: DynamoDBDocument) {}

    public async findById(id: string): Promise<User | null> {
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

    public async findByEmail(email: string): Promise<User | null> {
        const res = await this.db.query({
            TableName: this.tableName,
            IndexName: 'email',
            KeyConditions: {
                email: { ComparisonOperator: 'EQ', AttributeValueList: [email] },
            },
            Limit: 1,
        });

        if (!res.Items || !res.Items[0]) {
            return null;
        }

        assert(res.Items[0], dbSchema);
        return res.Items[0];
    }

    public async create(user: User): Promise<User> {
        await this.db.put({
            TableName: this.tableName,
            Item: user,
        });

        return user;
    }
}
