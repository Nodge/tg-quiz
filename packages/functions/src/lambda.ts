import { apiHandler } from './utils';

export const handler = apiHandler(async () => {
    return {
        statusCode: 201,
        body: `Hi from SST ${new Date().toISOString()}`,
    };
});
