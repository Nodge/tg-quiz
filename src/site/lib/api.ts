import type { CurrentQuestionResponse } from '../../api/api-current-question';
import type { DeleteQuestionRequest } from '../../api/api-delete-question';
import type { QuestionsResponse } from '../../api/api-get-questions';
import type { LeaderBoardItem } from '../../api/api-leaderboard';
import type { ResetResponse } from '../../api/api-reset';
import type { SaveQuestionsOrderRequest } from '../../api/api-save-order';
import type { SaveQuestionRequest } from '../../api/api-save-question';
import type { NextQuestionResponse } from '../../api/api-start-question';
import type { StopQuestionRequest, StopQuestionResponse } from '../../api/api-stop-question';
import type { Question } from '../../model/Question';

const API_URL = import.meta.env.VITE_APP_API_URL;

export async function getCurrentQuestion(): Promise<CurrentQuestionResponse> {
    const res = await fetch(`${API_URL}/current`, { method: 'GET' });
    if (!res.ok) {
        throw new Error('Failed to fetch question');
    }
    const data = await res.json();
    return data;
}

export async function startNextQuestion(): Promise<NextQuestionResponse> {
    const res = await fetch(`${API_URL}/start`, { method: 'POST' });
    if (!res.ok) {
        throw new Error('Failed to start question');
    }
    const data = await res.json();
    return data;
}

export async function stopCurrentQuestion(): Promise<StopQuestionResponse> {
    const body: StopQuestionRequest = {
        siteUrl: window.location.origin + '/',
    };

    const res = await fetch(`${API_URL}/stop`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error('Failed to stop question');
    }

    const data = await res.json();
    return data;
}

export async function getLeaderboard(): Promise<LeaderBoardItem[]> {
    const res = await fetch(`${API_URL}/leaderboard`, { method: 'GET' });
    if (!res.ok) {
        throw new Error('Failed to get leaderboard');
    }
    const data = await res.json();
    return data;
}

export async function resetState(): Promise<ResetResponse> {
    const res = await fetch(`${API_URL}/reset`, { method: 'POST' });
    if (!res.ok) {
        throw new Error('Failed to reset state');
    }
    const data = await res.json();
    return data;
}

export async function getQuestions(): Promise<QuestionsResponse> {
    const res = await fetch(`${API_URL}/questions`, { method: 'GET' });
    if (!res.ok) {
        throw new Error('Failed to get questions');
    }
    const data = await res.json();
    return data;
}

export async function saveQuestion(question: Question): Promise<void> {
    const body: SaveQuestionRequest = {
        question,
    };

    const res = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error('Failed to save question');
    }
}

export async function deleteQuestion(question: Question): Promise<void> {
    const body: DeleteQuestionRequest = {
        question,
    };

    const res = await fetch(`${API_URL}/questions`, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error('Failed to delete question');
    }
}

export async function saveQuestionsOrder(questions: Question[]): Promise<void> {
    const body: SaveQuestionsOrderRequest = {
        questions,
    };

    const res = await fetch(`${API_URL}/questions/save-order`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error('Failed to save questions order');
    }
}
