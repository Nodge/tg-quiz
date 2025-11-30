import { createDb, DynamoDBUsersRepository } from '@quiz/infra';

export class UsersService {
    private users: DynamoDBUsersRepository;

    constructor() {
        const db = createDb();
        this.users = new DynamoDBUsersRepository(db);
    }

    public async createByEmail(email: string): Promise<string> {
        let user = await this.users.findByEmail(email);

        if (!user) {
            user = await this.users.create({
                id: crypto.randomUUID(),
                email,
                role: 'basic',
                createdAt: Date.now(),
            });
        }

        return user.id;
    }
}
