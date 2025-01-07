export type UserRole = 'basic' | 'admin';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    createdAt: number;
}
