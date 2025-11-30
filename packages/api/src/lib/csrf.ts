import type { APIGatewayProxyEvent } from '@quiz/shared';

import { getApiBaseUrl } from './base-url';

export function validateCSRF(event: APIGatewayProxyEvent): boolean {
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
