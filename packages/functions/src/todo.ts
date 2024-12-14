import { Todo } from '@sst-app-example/core/todo';
import { apiHandler } from './utils';

export const create = apiHandler(async _evt => {
    const todo = await Todo.create();

    return {
        statusCode: 200,
        body: `Todo created ${todo.id}`,
    };
});

export const list = apiHandler(async _evt => {
    return {
        statusCode: 200,
        body: JSON.stringify(Todo.list()),
    };
});
