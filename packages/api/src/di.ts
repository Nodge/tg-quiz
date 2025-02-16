import { register, createToken, inject } from '@quiz/shared';
import {
    DynamoDBUsersRepository,
    DynamoDBKeyValueStoreRepository,
    S3FileStorageRepository,
    DynamoDBPlayersRepository,
    DynamoDBQuestionsRepository,
    DynamoDBAnswersRepository,
} from '@quiz/infra';
import {
    AnswersRepository,
    AnswersService,
    FileStorageRepository,
    KeyValueStoreRepository,
    LeaderboardService,
    PlayersRepository,
    PlayersService,
    QuestionsRepository,
    QuestionsService,
    QuizStateService,
    UsersRepository,
} from '@quiz/core';
import { KeyValueStore } from '../../core/src/modules/kv-store';

export const answersRepository = createToken<AnswersRepository>('AnswersRepository');
export const answersService = createToken<AnswersService>('AnswersService');

export const fileStorageRepository = createToken<FileStorageRepository>('FileStorageRepository');

export const keyValueStoreRepository = createToken<KeyValueStoreRepository>('KeyValueStoreRepository');
export const keyValueStore = createToken<KeyValueStore>('KeyValueStore');

export const playersRepository = createToken<PlayersRepository>('PlayersRepository');
export const playersService = createToken<PlayersService>('PlayersService');

export const questionsRepository = createToken<QuestionsRepository>('QuestionsRepository');
export const questionsService = createToken<QuestionsService>('QuestionsService');

export const usersRepository = createToken<UsersRepository>('UsersRepository');

export const leaderboardService = createToken<LeaderboardService>('LeaderboardService');
export const quizStateService = createToken<QuizStateService>('QuizStateService');

export function init() {
    register(usersRepository, () => new DynamoDBUsersRepository());

    register(keyValueStoreRepository, () => new DynamoDBKeyValueStoreRepository());
    register(keyValueStore, () => new KeyValueStore(inject(keyValueStoreRepository)));

    register(fileStorageRepository, () => new S3FileStorageRepository());

    register(playersRepository, () => new DynamoDBPlayersRepository());
    register(playersService, () => new PlayersService(inject(playersRepository), inject(fileStorageRepository)));

    register(questionsRepository, () => new DynamoDBQuestionsRepository());
    register(questionsService, () => new QuestionsService(inject(questionsRepository)));

    register(answersRepository, () => new DynamoDBAnswersRepository());
    register(answersService, () => new AnswersService(inject(answersRepository)));

    register(leaderboardService, () => new LeaderboardService(inject(playersService), inject(answersService)));

    register(quizStateService, () => new QuizStateService(inject(keyValueStore), inject(questionsService)));
}
