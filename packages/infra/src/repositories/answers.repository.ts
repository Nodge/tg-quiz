import { Resource } from 'sst';
import { number, string, type, assert, array, Infer } from 'superstruct';
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { PlayerAnswer, AnswersRepository } from '@quiz/core';

import { paginate } from '../lib/paginate';

const dbSchema = type({
    userId: string(),
    questionId: string(),
    answer: string(),
    score: number(),
    createdAt: number(),
});

export class DynamoDBAnswersRepository implements AnswersRepository {
    private tableName = Resource.AnswersTable.name;

    public constructor(private db: DynamoDBDocument) {}

    public async findAll(): Promise<PlayerAnswer[]> {
        const answers = await paginate(key =>
            this.db.scan({
                TableName: this.tableName,
                ExclusiveStartKey: key,
            })
        );

        assert(answers, array(dbSchema));
        return answers.map(answer => this.toDomain(answer));
    }

    public async findAllByUserId(userId: string): Promise<PlayerAnswer[]> {
        const answers = await paginate(key =>
            this.db.query({
                TableName: this.tableName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
                ExclusiveStartKey: key,
            })
        );

        assert(answers, array(dbSchema));
        return answers.map(answer => this.toDomain(answer));
    }

    public async create(data: PlayerAnswer): Promise<PlayerAnswer> {
        await this.db.put({
            TableName: this.tableName,
            Item: this.fromDomain(data),
        });
        return data;
    }

    public async deleteBatch(ids: string[]): Promise<void> {
        const chunkSize = 25;

        for (let i = 0; i < ids.length; i += chunkSize) {
            const batch = ids.slice(i, i + chunkSize);
            const deleteRequests = {
                RequestItems: {
                    [this.tableName]: batch.map(id => {
                        const { playerId, questionId } = this.decodeId(id);
                        return {
                            DeleteRequest: {
                                Key: {
                                    userId: playerId,
                                    questionId,
                                },
                            },
                        };
                    }),
                },
            };

            const res = await this.db.batchWrite(deleteRequests);

            if (Object.keys(res.UnprocessedItems ?? {}).length > 0) {
                throw new Error('Failed to delete answers');
            }
        }
    }

    private toDomain(answer: Infer<typeof dbSchema>): PlayerAnswer {
        return {
            id: this.encodeId(answer.userId, answer.questionId),
            playerId: answer.userId,
            questionId: answer.questionId,
            answer: answer.answer,
            score: answer.score,
            createdAt: answer.createdAt,
        };
    }

    private fromDomain(answer: PlayerAnswer): Infer<typeof dbSchema> {
        return {
            userId: answer.playerId,
            questionId: answer.questionId,
            answer: answer.answer,
            score: answer.score,
            createdAt: answer.createdAt,
        };
    }

    private encodeId(playerId: string, questionId: string) {
        return encodeURIComponent(playerId) + '#' + encodeURIComponent(questionId);
    }

    private decodeId(id: string) {
        const [player, question] = id.split('#');
        if (!player || !question) {
            throw new Error(`Invalid answer id: ${id}`);
        }

        return {
            playerId: decodeURIComponent(player),
            questionId: decodeURIComponent(question),
        };
    }
}
