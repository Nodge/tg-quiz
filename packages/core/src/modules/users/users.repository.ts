import { createToken } from '@quiz/shared';
import type { User } from './user.dto';

export interface UserRegistrationData {
    email: string;
}

export abstract class UsersRepository {
    public abstract findById(id: string): Promise<User | null>;
    public abstract findByEmail(email: string): Promise<User | null>;
    public abstract create(data: UserRegistrationData): Promise<User>;
}

export const usersRepositoryToken = createToken<UsersRepository>('UsersRepository');
