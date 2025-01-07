import { createClient } from '@openauthjs/openauth/client';
import { subjects } from './subjects';

export interface AuthSession {
    access: string;
    refresh: string;
}

interface AuthServiceOptions {
    clientId: string;
    authServerUrl: string;
}

type ValidateSessionResult =
    | {
          isValid: false;
      }
    | {
          isValid: true;
          userId: string;
          updatedSession?: AuthSession;
      };

export class AuthService {
    private client: ReturnType<typeof createClient>;

    public constructor(options: AuthServiceOptions) {
        this.client = createClient({
            clientID: options.clientId,
            issuer: options.authServerUrl,
        });
    }

    public async getAuthUrl(redirectUrl: string): Promise<string> {
        const { url } = await this.client.authorize(redirectUrl, 'code');
        return url;
    }

    public async createSession(code: string, redirectUrl: string): Promise<AuthSession> {
        const exchanged = await this.client.exchange(code, redirectUrl);

        if (exchanged.err) {
            throw new Error('Failed to create auth session', {
                cause: exchanged.err,
            });
        }

        return exchanged.tokens;
    }

    public async validateSession(session: AuthSession): Promise<ValidateSessionResult> {
        const verified = await this.client.verify(subjects, session.access, {
            refresh: session.refresh,
        });

        if (verified.err) {
            return {
                isValid: false,
            };
        }

        return {
            isValid: true,
            userId: verified.subject.properties.userId,
            updatedSession: verified.tokens,
        };
    }
}
