import { UsersRepository } from '@quiz/infra';

class UsersService {
    private users: UsersRepository;

    constructor() {
        this.users = new UsersRepository();
    }

    public async createByEmail(email: string): Promise<string> {
        let user = await this.users.findByEmail(email);

        if (!user) {
            user = await this.users.create({ email });
        }

        return user.id;
    }
}

export const usersService = new UsersService();
