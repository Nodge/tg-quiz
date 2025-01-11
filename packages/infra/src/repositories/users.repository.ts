import { Resource } from 'sst';
import { UsersRepository, type User, type UserRegistrationData } from '@quiz/core';
import { db } from '../db';

export class DynamoDBUsersRepository extends UsersRepository {
    private tableName = Resource.UserAccountsTable.name;

    public async findById(id: string) {
        const res = await db.get({
            TableName: this.tableName,
            Key: { id },
        });

        if (!res.Item) {
            return null;
        }

        return res.Item as User;
    }

    public async findByEmail(email: string) {
        const res = await db.query({
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

        return res.Items[0] as User;
    }

    public async create(data: UserRegistrationData) {
        const user: User = {
            ...data,
            id: crypto.randomUUID(),
            role: 'basic' as const,
            createdAt: Date.now(),
        };

        await db.put({
            TableName: this.tableName,
            Item: user,
        });

        return user;
    }
}
