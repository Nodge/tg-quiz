import { UsersRepository as BaseUsersRepository, type User, type UserRegistrationData } from '@quiz/core';
import { db } from '../db';
import { Resource } from 'sst';

const TableName = Resource.UserAccountsTable.name;

export class UsersRepository extends BaseUsersRepository {
    public async findById(id: string) {
        const res = await db.get({
            TableName,
            Key: { id },
        });

        if (!res.Item) {
            return null;
        }

        return res.Item as User;
    }

    public async findByEmail(email: string) {
        const res = await db.query({
            TableName,
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
            TableName,
            Item: user,
        });

        return user;
    }
}
