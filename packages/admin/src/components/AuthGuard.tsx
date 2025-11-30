import { useEffect, useState } from 'react';
import type { UserInfoResponse } from '@quiz/api';
import { navigateToLoginScreen, logout } from '../lib/auth';

type AuthState =
    | { status: 'loading' }
    | { status: 'authenticated' }
    | { status: 'unauthenticated' }
    | { status: 'limited' };

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const [authState, setAuthState] = useState<AuthState>({ status: 'loading' });

    useEffect(() => {
        let isMounted = true;

        fetch('/api/auth/user-info')
            .then(res => res.json())
            .then((data: UserInfoResponse) => {
                if (!isMounted) return;

                if (data.isAuthenticated) {
                    setAuthState({ status: data.role === 'admin' ? 'authenticated' : 'limited' });
                } else {
                    navigateToLoginScreen();
                }
            })
            .catch(error => {
                console.error('Failed to fetch user info:', error);
                if (isMounted) {
                    // Treat network errors as unauthenticated
                    navigateToLoginScreen();
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (authState.status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        );
    }

    if (authState.status === 'authenticated') {
        return <>{children}</>;
    }

    if (authState.status === 'limited') {
        return <AccessDenied />;
    }

    // Unauthenticated state (should not render as redirect happens)
    return null;
}

function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full mx-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="text-6xl">🔒</div>
                    <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                    <p className="text-gray-600">Admin access required. Please log in with an admin account.</p>
                    <button
                        onClick={logout}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
