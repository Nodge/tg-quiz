import { DynamoDBUsersRepository } from '@quiz/infra';

class UsersService {
    private users: DynamoDBUsersRepository;

    constructor() {
        this.users = new DynamoDBUsersRepository();
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
