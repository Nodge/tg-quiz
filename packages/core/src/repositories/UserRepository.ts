import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { User } from '../models/User';
import { paginate } from '../lib/paginate';

export class UserRepository {
    private db: DynamoDBDocument;

    public constructor() {
        const client = new DynamoDBClient();
        this.db = DynamoDBDocument.from(client);
    }

    public async createUser(input: Omit<User, 'createdAt' | 'currentMessageId' | 'currentQuestionId'>): Promise<User> {
        const user: User = {
            ...input,
            createdAt: Date.now(),
            currentMessageId: null,
            currentQuestionId: null,
        };

        const existingUser = await this.db.get({
            TableName: Resource.UsersTable.name,
            Key: {
                telegramId: user.telegramId,
            },
        });

        if (existingUser.Item) {
            return existingUser.Item as User;
        }

        await this.db.put({
            TableName: Resource.UsersTable.name,
            Item: user,
        });

        return user;
    }

    public async getAllUsers(): Promise<User[]> {
        const users = await paginate(key =>
            this.db.scan({
                TableName: Resource.UsersTable.name,
                ExclusiveStartKey: key,
            })
        );

        return users as User[];
    }

    public async getUser(telegramId: string): Promise<User | null> {
        const res = await this.db.get({
            TableName: Resource.UsersTable.name,
            Key: { telegramId },
        });

        if (res.Item) {
            return res.Item as User;
        }

        return null;
    }

    public async setLastMessageId(user: User, messageId: string | null, questionId: string | null): Promise<void> {
        await this.db.update({
            TableName: Resource.UsersTable.name,
            Key: { telegramId: user.telegramId },
            AttributeUpdates: {
                currentMessageId: { Value: messageId },
                currentQuestionId: { Value: questionId },
            },
        });
    }
}
