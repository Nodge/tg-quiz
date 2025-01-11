import { register } from '@quiz/shared';
import {
    keyValueStoreRepositoryToken,
    usersRepositoryToken,
    questionsRepositoryToken,
    answersRepositoryToken,
    playersRepositoryToken,
    fileStorageRepositoryToken,
} from '@quiz/core';
import {
    DynamoDBUsersRepository,
    DynamoDBKeyValueStoreRepository,
    S3FileStorageRepository,
    DynamoDBPlayersRepository,
    DynamoDBQuestionsRepository,
    DynamoDBAnswersRepository,
} from '@quiz/infra';

export function init() {
    register(usersRepositoryToken, new DynamoDBUsersRepository());
    register(keyValueStoreRepositoryToken, new DynamoDBKeyValueStoreRepository());
    register(fileStorageRepositoryToken, new S3FileStorageRepository());
    register(playersRepositoryToken, new DynamoDBPlayersRepository());
    register(questionsRepositoryToken, new DynamoDBQuestionsRepository());
    register(answersRepositoryToken, new DynamoDBAnswersRepository());
}
