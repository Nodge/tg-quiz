import { z } from 'zod';
import crypto from 'crypto';

import { defineEvent, publishEvent } from './utils';

export * as Todo from './todo';

export const Events = {
    Created: defineEvent(
        'todo.created',
        z.object({
            id: z.string(),
        })
    ),
};

export async function create() {
    const id = crypto.randomUUID() + '1';

    // todo: write to database

    await publishEvent(Events.Created, { id });

    return { id };
}

export function list() {
    return Array(50)
        .fill(0)
        .map((_, index) => ({
            id: crypto.randomUUID(),
            title: 'Todo #' + index,
        }));
}
