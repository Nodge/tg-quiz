import { APIGatewayProxyEvent, apiHandler } from '@quiz/shared';
import { deleteTokens } from '../../lib/auth';
import { getApiBaseUrl } from '../../lib/base-url';

export const handler = apiHandler(async event => {
    if (!csrtCheck(event)) {
        return {
            statusCode: 400,
        };
    }

    return {
        statusCode: 201,
        cookies: deleteTokens(),
    };
});

function csrtCheck(event: APIGatewayProxyEvent): boolean {
    const origin = event.headers.origin;
    if (!origin) {
        return false;
    }

    if (!URL.canParse(origin)) {
        return false;
    }

    const apiUrl = new URL(getApiBaseUrl());
    return apiUrl.origin === origin;
}
