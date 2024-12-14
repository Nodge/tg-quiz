import { useEffect } from 'react';

export function usePolling(fn: () => Promise<void>, interval: number) {
    useEffect(() => {
        const intervalId = setInterval(fn, interval);
        return () => clearInterval(intervalId);
    }, [fn, interval]);
}
