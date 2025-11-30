import type {
    CurrentQuestionResponse,
    DeleteQuestionRequest,
    QuestionsResponse,
    SaveQuestionsOrderRequest,
    ResetResponse,
    SaveQuestionRequest,
    NextQuestionResponse,
    StopQuestionResponse,
} from '@quiz/api';

export async function getCurrentQuestion(): Promise<CurrentQuestionResponse> {
    const res = await fetch('/api/admin/current', { method: 'GET' });
    if (!res.ok) {
        throw new Error('Failed to fetch question');
    }
    const data = await res.json();
    return data;
}

export async function startNextQuestion(): Promise<NextQuestionResponse> {
    const res = await fetch('/api/admin/start', { method: 'POST' });
    if (!res.ok) {
        throw new Error('Failed to start question');
    }
    const data = await res.json();
    return data;
}

export async function stopCurrentQuestion(): Promise<StopQuestionResponse> {
    const res = await fetch('/api/admin/stop', { method: 'POST' });

    if (!res.ok) {
        throw new Error('Failed to stop question');
    }

    const data = await res.json();
    return data;
}

export async function resetState(): Promise<ResetResponse> {
    const res = await fetch('/api/admin/reset', { method: 'POST' });
    if (!res.ok) {
        throw new Error('Failed to reset state');
    }
    const data = await res.json();
    return data;
}

export async function getQuestions(): Promise<QuestionsResponse> {
    const res = await fetch('/api/admin/questions', { method: 'GET' });
    if (!res.ok) {
        throw new Error('Failed to get questions');
    }
    const data = await res.json();
    return data;
}

export async function saveQuestion(question: SaveQuestionRequest['question']): Promise<void> {
    const body: SaveQuestionRequest = {
        question,
    };

    const res = await fetch('/api/admin/questions', {
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

export async function deleteQuestion(question: DeleteQuestionRequest['question']): Promise<void> {
    const body: DeleteQuestionRequest = {
        question,
    };

    const res = await fetch('/api/admin/questions', {
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

export async function saveQuestionsOrder(questions: SaveQuestionsOrderRequest['questions']): Promise<void> {
    const body: SaveQuestionsOrderRequest = {
        questions,
    };

    const res = await fetch('/api/admin/questions/save-order', {
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
