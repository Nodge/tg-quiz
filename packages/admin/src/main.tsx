import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthGuard } from './components/AuthGuard';
import { AdminPage } from './routes/Admin';
import { NotFoundPage } from './routes/NotFound';
import { QuestionsPage } from './routes/Questions/Page';

import './main.css';

function App() {
    return (
        <BrowserRouter basename="/admin">
            <AuthGuard>
                <Routes>
                    <Route path="/" element={<AdminPage />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AuthGuard>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
