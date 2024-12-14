export const bus = new sst.aws.Bus('EventBus', {
    // transform: {
    //     bus(args, opts, name) {
    //         // todo: add retries
    //         opts.retries = 10;
    //     },
    // }
});

// bus.subscribe('packages/functions/src/events/todo-created.handler');

export const eventBusArn = bus.nodes.bus.arn;
