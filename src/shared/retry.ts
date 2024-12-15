interface RetryOptions {
    maxRetries: number;
    initialDelay?: number;
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
    const initialDelay = options.initialDelay || 1000;
    let attempts = 0;

    const executeWithRetry = async (): Promise<T> => {
        try {
            return await fn();
        } catch (error) {
            attempts++;

            if (attempts >= options.maxRetries) {
                throw error;
            }

            const delay = initialDelay * Math.pow(2, attempts - 1);
            await new Promise(resolve => setTimeout(resolve, delay));

            return executeWithRetry();
        }
    };

    return executeWithRetry();
}
