import { Context, APIGatewayProxyEvent, APIGatewayProxyResultV2 } from 'aws-lambda';

type ApiHandler = (evt: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResultV2>;

export function apiHandler(lambda: ApiHandler) {
    return async (event: APIGatewayProxyEvent, context: Context) => {
        let res: APIGatewayProxyResultV2;

        try {
            res = await lambda(event, context);
        } catch (error) {
            res = {
                statusCode: 500,
                body: JSON.stringify({
                    error: error instanceof Error ? error.message : String(error),
                }),
            };
        }

        return res;
    };
}
