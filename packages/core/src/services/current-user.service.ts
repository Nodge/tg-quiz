import type { User } from '../entities/User';

export class CurrentUserService {
    private user: User | null;

    public constructor(currentUser: User | null) {
        this.user = currentUser;
    }

    public getUser(): User | null {
        return this.user;
    }

    public isAuthenticated(): boolean {
        return this.user !== null;
    }

    public isAdmin(): boolean {
        return this.user?.role === 'admin';
    }

    public assertAdmin(): undefined {
        if (!this.isAdmin()) {
            throw new Error('Access denied');
        }
    }
}
