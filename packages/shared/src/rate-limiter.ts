interface Task {
    fn: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
}

interface RateLimitedQueueOptions {
    maxPerSecond: number;
}

export class RateLimitedQueue {
    private queue: Task[] = [];
    private running = 0;
    private lastExecutionTime = Date.now();
    private executedInLastSecond = 0;
    private maxPerSecond: number;

    constructor(options: RateLimitedQueueOptions) {
        this.maxPerSecond = options.maxPerSecond;
    }

    async add<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({
                fn,
                resolve: resolve as (value: unknown) => void,
                reject,
            });
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.queue.length === 0 || this.running >= this.maxPerSecond) {
            return;
        }

        const now = Date.now();
        if (now - this.lastExecutionTime >= 1000) {
            this.executedInLastSecond = 0;
            this.lastExecutionTime = now;
        }

        if (this.executedInLastSecond >= this.maxPerSecond) {
            setTimeout(() => this.processQueue(), 1000 - (now - this.lastExecutionTime));
            return;
        }

        const task = this.queue.shift();
        if (!task) {
            return;
        }

        this.running++;
        this.executedInLastSecond++;

        try {
            const result = await task.fn();
            task.resolve(result);
        } catch (error) {
            task.reject(error);
        } finally {
            this.running--;
            this.processQueue();
        }
    }
}
