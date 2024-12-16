import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-2xl text-gray-600 mb-8">Oops! Page not found</p>
                <p className="text-lg text-gray-500 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily
                    unavailable.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Home className="mr-2 h-5 w-5" />
                    Go back home
                </Link>
            </div>
        </div>
    );
}
