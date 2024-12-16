import { usersTable, answersTable, quizStateTable, questionsTable } from './db';
import { avatarsBucket, avatarsCdnUrl } from './s3';
import { botToken } from './secrets';

const region = aws.getRegionOutput().name;

export const api = new sst.aws.ApiGatewayV2('ApiRouter', {
    transform: {
        route: {
            handler: {
                link: [botToken, usersTable, questionsTable, answersTable, quizStateTable],
                environment: {
                    S3_REGION_NAME: region,
                    TELEGRAM_BOT_TOKEN: botToken.value,
                    AVATARS_CDN_URL: avatarsCdnUrl,
                    AVATARS_BUCKET_NAME: avatarsBucket.name,
                },
            },
        },
    },
    accessLog: {
        retention: '1 month',
    },
    cors: true,
});

api.route('GET /leaderboard', 'packages/api/src/handlers/leaderboard.handler');

api.route('GET /admin/current', 'packages/api/src/handlers/current-question.handler');
api.route('POST /admin/start', 'packages/api/src/handlers/start-question.handler');
api.route('POST /admin/stop', 'packages/api/src/handlers/stop-question.handler');
api.route('POST /admin/reset', 'packages/api/src/handlers/reset.handler');
api.route('GET /admin/questions', 'packages/api/src/handlers/get-questions.handler');
api.route('POST /admin/questions', 'packages/api/src/handlers/save-question.handler');
api.route('DELETE /admin/questions', 'packages/api/src/handlers/delete-question.handler');
api.route('POST /admin/questions/save-order', 'packages/api/src/handlers/save-order.handler');
