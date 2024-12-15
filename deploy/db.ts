export const usersTable = new sst.aws.Dynamo('UsersTable', {
    fields: {
        telegramId: 'string',
    },
    primaryIndex: { hashKey: 'telegramId' },
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
