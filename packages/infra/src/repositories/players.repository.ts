import { Resource } from 'sst';
import { PlayersRepository, type Player, type NewPlayerData } from '@quiz/core';

import { paginate } from '../lib/paginate';
import { db } from '../db';

export class DynamoDBPlayersRepository extends PlayersRepository {
    private tableName = Resource.UsersTable.name;

    public async findById(id: string): Promise<Player | null> {
        const res = await db.get({
            TableName: this.tableName,
            Key: { telegramId: id },
        });

        if (!res.Item) {
            return null;
        }

        return res.Item as Player;
    }

    public async findAll(): Promise<Player[]> {
        const users = await paginate(key =>
            db.scan({
                TableName: this.tableName,
                ExclusiveStartKey: key,
            })
        );
        return users as Player[];
    }

    public async create(data: NewPlayerData): Promise<Player> {
        const player: Player = {
            ...data,
            createdAt: Date.now(),
            currentMessageId: null,
            currentQuestionId: null,
        };

        await db.put({
            TableName: this.tableName,
            Item: player,
        });

        return player;
    }

    public async update(player: Player): Promise<void> {
        await db.put({
            TableName: this.tableName,
            Item: player,
        });
    }
}
