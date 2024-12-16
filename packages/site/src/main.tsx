import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { LeaderboardPage } from './routes/Leaderboard';
import { NotFoundPage } from './routes/NotFound';

import './main.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LeaderboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
