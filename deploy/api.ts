import { usersTable, answersTable, quizStateTable, questionsTable } from './db';
import { domainName } from './domain';
import { avatarsBucket, avatarsCdnUrl } from './s3';
import { botToken } from './secrets';

const region = aws.getRegionOutput().name;

export const api = new sst.aws.ApiGatewayV2('ApiRouter', {
    transform: {
        route: {
            handler: {
                link: [botToken, usersTable, questionsTable, answersTable, quizStateTable],
                environment: {
                    NODE_ENV: $dev ? 'development' : 'production',
                    APP_ENV: $dev ? 'development' : 'production',
                    S3_REGION_NAME: region,
                    TELEGRAM_BOT_TOKEN: botToken.value,
                    AVATARS_CDN_URL: avatarsCdnUrl,
                    AVATARS_BUCKET_NAME: avatarsBucket.name,
                    API_URL: `https://${domainName}/api/`,
                    AUTH_SERVER_URL: `https://auth.${domainName}`,
                },
            },
        },
    },
    accessLog: {
        retention: '1 month',
    },
    cors: false,
});

const basePath = 'packages/api/src/handlers';

api.route('GET /leaderboard', `${basePath}/leaderboard.handler`);

api.route('GET /auth/login', `${basePath}/auth/login.handler`);
api.route('GET /auth/callback', `${basePath}/auth/callback.handler`);
api.route('GET /auth/user-info', `${basePath}/auth/user-info.handler`);
api.route('POST /auth/logout', `${basePath}/auth/logout.handler`);

api.route('GET /admin/current', `${basePath}/admin/current-question.handler`);
api.route('POST /admin/start', `${basePath}/admin/start-question.handler`);
api.route('POST /admin/stop', `${basePath}/admin/stop-question.handler`);
api.route('POST /admin/reset', `${basePath}/admin/reset.handler`);
api.route('GET /admin/questions', `${basePath}/admin/get-questions.handler`);
api.route('POST /admin/questions', `${basePath}/admin/save-question.handler`);
api.route('DELETE /admin/questions', `${basePath}/admin/delete-question.handler`);
api.route('POST /admin/questions/save-order', `${basePath}/admin/save-order.handler`);
