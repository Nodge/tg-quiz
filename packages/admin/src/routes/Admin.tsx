import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Question, QuestionState } from '@quiz/core';
import { UserInfoResponse } from '@quiz/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { getCurrentQuestion, resetState, startNextQuestion, stopCurrentQuestion } from '../lib/api';
import { env } from '../lib/env';

enum QuizStatus {
    NOT_STARTED = 'NOT_STARTED',
    QUESTION_ACTIVE = 'QUESTION_ACTIVE',
    WAITING_NEXT_QUESTION = 'WAITING_NEXT_QUESTION',
    FINISHED = 'FINISHED',
    LOADING = 'LOADING',
}

export function AdminPage() {
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [currentQuestionState, setCurrentQuestionState] = useState<QuestionState>('STOPPED');
    const [hasNextQuestion, setHasNextQuestion] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [isResetOpened, setResetOpened] = useState(false);

    const start = () => {
        setLoading(true);
        startNextQuestion().then(data => {
            setLoading(false);
            setCurrentQuestion(data.question);
            setHasNextQuestion(data.hasNextQuestion);
            setCurrentQuestionState(data.state);
        });
    };

    const stop = () => {
        setLoading(true);
        stopCurrentQuestion().then(data => {
            setLoading(false);
            setCurrentQuestionState(data.state);
        });
    };

    const reset = () => {
        setLoading(true);
        resetState().then(data => {
            setLoading(false);
            setCurrentQuestion(data.question);
            setCurrentQuestionState(data.state);
            setHasNextQuestion(data.hasNextQuestion);
        });
    };

    useEffect(() => {
        getCurrentQuestion().then(data => {
            setLoading(false);
            setCurrentQuestion(data.question);
            setCurrentQuestionState(data.state);
            setHasNextQuestion(data.hasNextQuestion);
            setActiveUsers(data.usersCount);
            setQuestionsCount(data.questionsCount);
        });
    }, []);

    const quizStatus = getQuizStatus(currentQuestion, currentQuestionState, hasNextQuestion, isLoading);

    return (
        <div className="container mx-auto p-4 flex flex-col gap-y-[20px]">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Quiz Admin Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Quiz Status:</span>
                        <Badge className={`${getStatusColor(quizStatus)} text-white`}>{quizStatus}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Active Users:</span>
                        <span>{activeUsers}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Progress:</span>
                        <span>
                            {(currentQuestion?.index ?? -1) + 1} / {questionsCount}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <span className="font-semibold">Current Question:</span>
                        <p className="p-2 bg-gray-100 rounded">{currentQuestion?.title ?? 'No question available'}</p>
                    </div>

                    {hasNextQuestion && currentQuestionState === 'STOPPED' && (
                        <Button onClick={start} className="w-full" disabled={isLoading}>
                            Запустить следующий вопрос
                        </Button>
                    )}

                    {currentQuestionState === 'ON_AIR' && (
                        <Button onClick={stop} className="w-full" disabled={isLoading}>
                            Остановить сбор ответов
                        </Button>
                    )}

                    <Link to={env('VITE_SITE_URL')} className="block text-center text-blue-500 hover:underline">
                        View Leaderboard
                    </Link>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button asChild variant="secondary">
                    <Link to="/questions">Edit questions</Link>
                </Button>
            </div>

            <div className="flex justify-center">
                <Button variant="link" onClick={() => setResetOpened(true)}>
                    Reset state
                </Button>
            </div>

            <ResetAlertDialog isOpen={isResetOpened} onReset={reset} onClose={() => setResetOpened(false)} />

            <AuthTest />
        </div>
    );
}

function getStatusColor(status: QuizStatus) {
    switch (status) {
        case QuizStatus.LOADING:
            return 'bg-gray-500';
        case QuizStatus.NOT_STARTED:
        case QuizStatus.WAITING_NEXT_QUESTION:
            return 'bg-yellow-500';
        case QuizStatus.QUESTION_ACTIVE:
            return 'bg-green-500';
        case QuizStatus.FINISHED:
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
}

function getQuizStatus(
    currentQuestion: Question | null,
    currentQuestionState: QuestionState,
    hasNextQuestion: boolean,
    isLoading: boolean
) {
    if (isLoading) {
        return QuizStatus.LOADING;
    }

    if (currentQuestionState === 'ON_AIR') {
        return QuizStatus.QUESTION_ACTIVE;
    }

    if (!hasNextQuestion) {
        return QuizStatus.FINISHED;
    }

    if (currentQuestion) {
        return QuizStatus.WAITING_NEXT_QUESTION;
    }

    return QuizStatus.NOT_STARTED;
}

interface ResetAlertDialogProps {
    isOpen: boolean;
    onReset: () => void;
    onClose: () => void;
}

function ResetAlertDialog({ isOpen, onReset, onClose }: ResetAlertDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all the scores and answers for all
                        users.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onReset}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function AuthTest() {
    const [user, setUser] = useState<UserInfoResponse>({ isAuthenticated: false });

    const authUrl = new URL('/api/auth/login', window.location.origin);
    authUrl.searchParams.set('redirect_uri', window.location.href);

    useEffect(() => {
        fetch('/api/auth/user-info')
            .then(res => res.json())
            .then(data => {
                setUser(data);
            });
    }, []);

    const logout = () => {
        fetch('/api/auth/logout', { method: 'POST' }).then(() => {
            setUser({ isAuthenticated: false });
        });
    };

    return (
        <div>
            <p>Is authenticated: {user.isAuthenticated ? 'true' : 'false'}</p>
            <p>user: {JSON.stringify(user)}</p>

            {user.isAuthenticated && <button onClick={logout}>Logout</button>}
            {!user.isAuthenticated && <a href={authUrl.toString()}>Login</a>}
        </div>
    );
}
