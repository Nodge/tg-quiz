import { useEffect } from 'react';

export function usePolling(fn: () => void, interval: number) {
    useEffect(() => {
        const intervalId = setInterval(fn, interval);
        return () => clearInterval(intervalId);
    }, [fn, interval]);
}
