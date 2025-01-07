import { serialize, parse, CookieSerializeOptions } from 'cookie-es';

export function createSessionCookie<T>(options: CookieSerializeOptions & { name: string }) {
    const { name, ...cookieOptions } = options;

    return {
        async getSession(cookies: string): Promise<T | undefined> {
            const parsedCookies = parse(cookies);
            const value = parsedCookies[name];
            if (!value) {
                return undefined;
            }
            return JSON.parse(value) as T;
        },
        async commitSession(session: T): Promise<string[]> {
            const value = JSON.stringify(session);
            return [serialize(name, value, cookieOptions)];
        },
        async destroySession() {
            return [
                serialize(name, '', {
                    ...cookieOptions,
                    expires: new Date(0),
                    maxAge: 0,
                }),
            ];
        },
    };
}
