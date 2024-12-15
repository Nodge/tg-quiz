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

api.route('GET /current', 'src/api/api-current-question.handler');
api.route('POST /start', 'src/api/api-start-question.handler');
api.route('POST /stop', 'src/api/api-stop-question.handler');
api.route('GET /leaderboard', 'src/api/api-leaderboard.handler');
api.route('POST /reset', 'src/api/api-reset.handler');
api.route('GET /questions', 'src/api/api-get-questions.handler');
api.route('POST /questions', 'src/api/api-save-question.handler');
api.route('DELETE /questions', 'src/api/api-delete-question.handler');
api.route('POST /questions/save-order', 'src/api/api-save-order.handler');
