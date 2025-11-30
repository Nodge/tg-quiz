import { Resource } from 'sst';
import { array, assert, boolean, Infer, nullable, number, string, type } from 'superstruct';
import type { PlayersRepository, Player } from '@quiz/core';
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { paginate } from '../lib/paginate';

const dbSchema = type({
    telegramId: string(),
    telegramLogin: string(),
    avatarId: nullable(string()),
    createdAt: number(),
    blocked: boolean(),
});

export class DynamoDBPlayersRepository implements PlayersRepository {
    private tableName = Resource.UsersTable.name;

    constructor(private db: DynamoDBDocument) {}

    public async findById(id: string): Promise<Player | null> {
        const res = await this.db.get({
            TableName: this.tableName,
            Key: { telegramId: id },
        });

        if (!res.Item) {
            return null;
        }

        assert(res.Item, dbSchema);
        return this.toDomain(res.Item);
    }

    public async findAll(): Promise<Player[]> {
        const players = await paginate(key =>
            this.db.scan({
                TableName: this.tableName,
                ExclusiveStartKey: key,
            })
        );

        assert(players, array(dbSchema));
        return players.map(player => this.toDomain(player));
    }

    public async create(player: Player): Promise<Player> {
        await this.db.put({
            TableName: this.tableName,
            Item: this.fromDomain(player),
        });

        return player;
    }

    public async update(player: Player): Promise<void> {
        await this.db.put({
            TableName: this.tableName,
            Item: this.fromDomain(player),
        });
    }

    private toDomain(player: Infer<typeof dbSchema>): Player {
        return {
            id: player.telegramId,
            name: player.telegramLogin,
            avatarId: player.avatarId,
            createdAt: player.createdAt,
            blocked: player.blocked,
        };
    }

    private fromDomain(player: Player): Infer<typeof dbSchema> {
        return {
            telegramId: player.id,
            telegramLogin: player.name,
            avatarId: player.avatarId,
            createdAt: player.createdAt,
            blocked: player.blocked,
        };
    }
}
