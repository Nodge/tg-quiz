import { bus } from 'sst/aws/bus';
import { Todo } from '@sst-app-example/core/todo';

export const handler = bus.subscriber(Todo.Events.Created, async evt => {
    console.log('Event: Todo created', evt);
});
