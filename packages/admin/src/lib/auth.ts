export function navigateToLoginScreen() {
    const loginUrl = new URL('/api/auth/login', window.location.origin);
    loginUrl.searchParams.set('redirect_uri', window.location.href);
    window.location.href = loginUrl.toString();
}

export async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });

        if (response.ok) {
            navigateToLoginScreen();
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}
