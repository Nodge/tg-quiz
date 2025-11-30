import { Resource } from 'sst';
import { array, assert, nullable, string, type } from 'superstruct';
import type { PlayerState, PlayerStateRepository } from '@quiz/core';
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { paginate } from '../lib/paginate';

const dbSchema = type({
    playerId: string(),
    currentQuestionId: nullable(string()),
    currentMessageId: nullable(string()),
});

export class DynamoDBPlayerStateRepository implements PlayerStateRepository {
    private tableName = Resource.PlayerStateTable.name;

    constructor(private db: DynamoDBDocument) {}

    public async loadAll(): Promise<Map<string, PlayerState>> {
        const states = await paginate(key =>
            this.db.scan({
                TableName: this.tableName,
                ExclusiveStartKey: key,
            })
        );

        assert(states, array(dbSchema));

        const map = new Map<string, PlayerState>();
        for (const state of states) {
            map.set(state.playerId, state);
        }
        return map;
    }

    public async loadState(playerId: string): Promise<PlayerState | null> {
        const res = await this.db.get({
            TableName: this.tableName,
            Key: { playerId },
        });

        if (!res.Item) {
            return null;
        }

        assert(res.Item, dbSchema);
        return res.Item;
    }

    public async saveState(playerId: string, state: PlayerState): Promise<void> {
        await this.db.put({
            TableName: this.tableName,
            Item: {
                playerId,
                currentQuestionId: state.currentQuestionId,
                currentMessageId: state.currentMessageId,
            },
        });
    }
}
