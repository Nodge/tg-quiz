import { Schema } from 'zod';
import { event } from 'sst/event';
import { bus } from 'sst/aws/bus';

type EnvVariable = 'EVENT_BUS_ARN';

export function env(name: EnvVariable) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ENV variable: ${name}`);
    }
    return value;
}

function validator(schema: Schema) {
    return (input: unknown) => {
        return schema.parse(input);
    };
}

export const defineEvent = event.builder({
    validator,
});

type InferSchema<T> = T extends { $input: infer Schema } ? Schema : never;

export async function publishEvent<T extends event.Definition>(event: T, params: InferSchema<T>) {
    await bus.publish(env('EVENT_BUS_ARN'), event, params);
}
