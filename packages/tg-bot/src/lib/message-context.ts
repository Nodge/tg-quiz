import type { Context } from 'telegraf';
import {
    AnswersRepository,
    FileStorageRepository,
    PlayersRepository,
    PlayerStateRepository,
    QuestionsService,
    QuizState,
    QuizStateService,
} from '@quiz/core';
import {
    createDb,
    DynamoDBAnswersRepository,
    DynamoDBKeyValueStoreRepository,
    DynamoDBPlayersRepository,
    DynamoDBPlayerStateRepository,
    DynamoDBQuestionsRepository,
    S3FileStorageRepository,
} from '@quiz/infra';

import { PlayersNotificationService } from '../services/PlayersNotificationService';

export interface MessageContext {
    quizStateService: QuizStateService;
    questionsService: QuestionsService;
    playersRepository: PlayersRepository;
    playerStateRepository: PlayerStateRepository;
    playersNotificationService: PlayersNotificationService;
    answersRepository: AnswersRepository;
    fileStorageRepository: FileStorageRepository;
}

export async function createMessageContext(ctx: Context): Promise<MessageContext> {
    const db = createDb();

    const questionsRepository = new DynamoDBQuestionsRepository(db);
    const questionsService = new QuestionsService(questionsRepository);

    const quizStateRepository = new DynamoDBKeyValueStoreRepository<QuizState>('quiz-state-2025', db);
    const quizStateService = new QuizStateService(quizStateRepository, questionsService);

    const playersRepository = new DynamoDBPlayersRepository(db);
    const playerStateRepository = new DynamoDBPlayerStateRepository(db);
    const playersNotificationService = new PlayersNotificationService(ctx);

    const answersRepository = new DynamoDBAnswersRepository(db);

    const fileStorageRepository = new S3FileStorageRepository();

    return {
        quizStateService,
        questionsService,
        playersRepository,
        playerStateRepository,
        playersNotificationService,
        answersRepository,
        fileStorageRepository,
    };
}
