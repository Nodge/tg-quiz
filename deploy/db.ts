export const usersTable = new sst.aws.Dynamo('UserAccountsTable', {
    fields: {
        id: 'string',
        email: 'string',
    },
    primaryIndex: { hashKey: 'id' },
    globalIndexes: {
        email: {
            hashKey: 'email',
        },
    },
});

export const playersTable = new sst.aws.Dynamo('UsersTable', {
    fields: {
        telegramId: 'string',
    },
    primaryIndex: { hashKey: 'telegramId' },
});

export const playerStateTable = new sst.aws.Dynamo('PlayerStateTable', {
    fields: {
        playerId: 'string',
    },
    primaryIndex: { hashKey: 'playerId' },
});

export const questionsTable = new sst.aws.Dynamo('QuestionsTable', {
    fields: {
        id: 'string',
    },
    primaryIndex: { hashKey: 'id' },
});

export const answersTable = new sst.aws.Dynamo('AnswersTable', {
    fields: {
        userId: 'string',
        questionId: 'string',
    },
    primaryIndex: { hashKey: 'userId', rangeKey: 'questionId' },
});

export const quizStateTable = new sst.aws.Dynamo('QuizStateTable', {
    fields: {
        id: 'string',
    },
    primaryIndex: { hashKey: 'id' },
});
