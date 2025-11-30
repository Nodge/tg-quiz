import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export function createDb(): DynamoDBDocument {
    const client = new DynamoDBClient();
    const db = DynamoDBDocument.from(client);
    return db;
}
