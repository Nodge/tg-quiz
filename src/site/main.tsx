import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LeaderboardPage } from './routes/Leaderboard';
import { AdminPage } from './routes/Admin';
import { NotFoundPage } from './routes/NotFound';

import './main.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LeaderboardPage />} />
                <Route path="/hidden-admin" element={<AdminPage />} />
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
