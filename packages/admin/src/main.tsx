import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AdminPage } from './routes/Admin';
import { NotFoundPage } from './routes/NotFound';
import { QuestionsPage } from './routes/Questions/Page';

import './main.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AdminPage />} />
                <Route path="/questions" element={<QuestionsPage />} />
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
