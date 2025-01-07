import { register } from '@quiz/shared';
import { usersRepositoryToken } from '@quiz/core';
import { UsersRepository } from '@quiz/infra';

export function initDeps() {
    register(usersRepositoryToken, new UsersRepository());
}
