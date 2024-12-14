import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { QuestionState, QuizState } from './QuizState';

const STATE_ID = '2025';

export class QiuzStateRepository {
    private db: DynamoDBDocument;

    public constructor() {
        const client = new DynamoDBClient();
        this.db = DynamoDBDocument.from(client);
    }

    public async getCurrentQuestion(): Promise<{ id: string | null; state: QuestionState }> {
        const res = await this.db.get({
            TableName: Resource.QuizStateTable.name,
            Key: {
                id: STATE_ID,
            },
        });

        const state = res.Item as QuizState | undefined;
        if (state) {
            return {
                id: state.currentQuestionId,
                state: state.currentQuestionState,
            };
        }

        return {
            id: null,
            state: 'STOPPED',
        };
    }

    public async setCurrentQuestion(id: string, state: QuestionState): Promise<void> {
        const data: QuizState = {
            id: STATE_ID,
            currentQuestionId: id,
            currentQuestionState: state,
        };

        await this.db.put({
            TableName: Resource.QuizStateTable.name,
            Item: data,
        });
    }

    public async resetState(): Promise<void> {
        const data: QuizState = {
            id: STATE_ID,
            currentQuestionId: null,
            currentQuestionState: 'STOPPED',
        };

        await this.db.put({
            TableName: Resource.QuizStateTable.name,
            Item: data,
        });
    }
}
