import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { Question } from '../model/Question';
import type { QuestionState } from '../model/QuizState';
import { getCurrentQuestion, getLeaderboard, startNextQuestion, stopCurrentQuestion } from './api';

// import App from './App.tsx'
// import './index.css'

function App() {
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [currentQuestionState, setCurrentQuestionState] = useState<QuestionState>('STOPPED');
    const [hasNextQuestion, setHasNextQuestion] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const [result, setResult] = useState<unknown>();

    const start = () => {
        startNextQuestion().then(data => {
            setCurrentQuestion(data.question);
            setHasNextQuestion(data.hasNextQuestion);
            setCurrentQuestionState(data.state);
        });
    };

    const stop = () => {
        stopCurrentQuestion().then(data => {
            setCurrentQuestionState(data.state);
        });
    };

    const list = () => {
        getLeaderboard().then(setResult);
    };

    useEffect(() => {
        const update = () => {
            getCurrentQuestion().then(data => {
                setCurrentQuestion(data.question);
                setHasNextQuestion(data.hasNextQuestion);
                setCurrentQuestionState(data.state);
                setUserCount(data.usersCount);
            });
        };

        update();

        // const interval = setInterval(update, 5000);
        // return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>App</h1>
            <pre>
                {JSON.stringify(
                    {
                        userCount,
                        currentQuestionState,
                        currentQuestion,
                        hasNextQuestion,
                    },
                    null,
                    4
                )}
            </pre>
            {hasNextQuestion && currentQuestionState === 'STOPPED' && <button onClick={start}>START</button>}
            <br />
            {currentQuestionState === 'ON_AIR' && <button onClick={stop}>STOP</button>}
            <br />
            <button onClick={list}>LEADERBOARD</button>
            <br />
            <pre>{JSON.stringify(result, null, 4)}</pre>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
