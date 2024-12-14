// import { bus, eventBusArn } from './event-bus';
import { usersTable, answersTable, quizStateTable } from './db';
import { botToken } from './secrets';

export const api = new sst.aws.ApiGatewayV2('ApiRouter', {
    transform: {
        route: {
            handler: {
                link: [botToken, usersTable, answersTable, quizStateTable],
                // link: [bus],
                environment: {
                    TELEGRAM_BOT_TOKEN: botToken.value,
                    // EVENT_BUS_ARN: eventBusArn,
                },
            },
        },
    },
    accessLog: {
        retention: '1 month',
    },
    // cors: false,
});

api.route('GET /current', 'src/api/api-current-question.handler');
api.route('POST /start', 'src/api/api-start-question.handler');
api.route('POST /stop', 'src/api/api-stop-question.handler');
api.route('GET /leaderboard', 'src/api/api-leaderboard.handler');
