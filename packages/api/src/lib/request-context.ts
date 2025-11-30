import {
    AnswersRepository,
    CurrentUserService,
    LeaderboardService,
    PlayersRepository,
    PlayerStateRepository,
    QuestionsRepository,
    QuestionsService,
    QuizState,
    QuizStateService,
} from '@quiz/core';
import { AuthService, type AuthSession } from '@quiz/auth';
import type { APIGatewayProxyEvent } from '@quiz/shared';
import {
    createDb,
    DynamoDBAnswersRepository,
    DynamoDBKeyValueStoreRepository,
    DynamoDBPlayersRepository,
    DynamoDBPlayerStateRepository,
    DynamoDBQuestionsRepository,
    DynamoDBUsersRepository,
    S3FileStorageRepository,
} from '@quiz/infra';
import { PlayersNotificationService } from '@quiz/tg-bot';

import { tryAuth } from './auth';
import { env } from './env';

interface RequestContext {
    currentUser: CurrentUserService;
    authService: AuthService;
    authSession: AuthSession | null;
    quizStateService: QuizStateService;
    questionsRepository: QuestionsRepository;
    questionsService: QuestionsService;
    playersRepository: PlayersRepository;
    playerStateRepository: PlayerStateRepository;
    playersNotificationService: PlayersNotificationService;
    answersRepository: AnswersRepository;
    leaderboardService: LeaderboardService;
}

// note: should be cached between requests
const authService = new AuthService({
    clientId: 'web',
    authServerUrl: env('AUTH_SERVER_URL'),
});

export async function createRequestContext(event: APIGatewayProxyEvent): Promise<RequestContext> {
    const db = createDb();

    const usersRepository = new DynamoDBUsersRepository(db);

    const questionsRepository = new DynamoDBQuestionsRepository(db);
    const questionsService = new QuestionsService(questionsRepository);

    const quizStateRepository = new DynamoDBKeyValueStoreRepository<QuizState>('quiz-state-2025', db);
    const quizStateService = new QuizStateService(quizStateRepository, questionsService);

    const playersRepository = new DynamoDBPlayersRepository(db);
    const playerStateRepository = new DynamoDBPlayerStateRepository(db);
    const playersNotificationService = new PlayersNotificationService(null);

    const answersRepository = new DynamoDBAnswersRepository(db);

    const fileStorage = new S3FileStorageRepository();

    const leaderboardService = new LeaderboardService(playersRepository, answersRepository, fileStorage);

    const auth = await tryAuth(event, authService, usersRepository);
    const currentUser = new CurrentUserService(auth?.user ?? null);

    return {
        currentUser,
        authService,
        authSession: auth?.session ?? null,
        quizStateService,
        questionsRepository,
        questionsService,
        playersRepository,
        playerStateRepository,
        playersNotificationService,
        answersRepository,
        leaderboardService,
    };
}
