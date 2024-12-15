import { useState, useEffect } from 'react';

import type { Question } from '../../../model/Question';
import { deleteQuestion, getQuestions, saveQuestion, saveQuestionsOrder } from '../../lib/api';
import { QuestionsTable } from './Table';
import { QuestionFormSheet } from './FormSheet';

export function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [editQuestion, setEditQuestion] = useState<Question | null>(null);
    const [isSaving, setSaving] = useState(false);

    useEffect(() => {
        getQuestions().then(data => {
            setQuestions(data.questions);
        });
    }, []);

    const onAdd = () => {
        const question: Question = {
            id: crypto.randomUUID(),
            title: '',
            answers: [
                {
                    id: crypto.randomUUID(),
                    title: '',
                    score: 0,
                },
                {
                    id: crypto.randomUUID(),
                    title: '',
                    score: 0,
                },
            ],
            index: questions.length,
        };

        setEditQuestion(question);
        setQuestions(list => list.concat(question));
    };

    const onEdit = (question: Question) => {
        setEditQuestion(question);
    };

    const onSave = (question: Question) => {
        setQuestions(list =>
            list.map(item => {
                if (item.id === question.id) {
                    return question;
                }
                return item;
            })
        );

        setSaving(true);
        saveQuestion(question).then(
            () => {
                setSaving(false);
                setEditQuestion(null);
            },
            err => {
                console.error(err);
                setSaving(false);
            }
        );
    };

    const onDelete = async (question: Question) => {
        setQuestions(list => list.filter(item => item.id !== question.id));
        deleteQuestion(question);
    };

    const onSaveOrder = async (questions: Question[]) => {
        const data = questions.map((q, index) => {
            return {
                ...q,
                index,
            };
        });

        setQuestions(data);
        saveQuestionsOrder(data);
    };

    return (
        <>
            <QuestionsTable
                questions={questions}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onSaveOrder={onSaveOrder}
            />
            {editQuestion && (
                <QuestionFormSheet
                    onClose={() => setEditQuestion(null)}
                    onSave={onSave}
                    isSaving={isSaving}
                    question={editQuestion}
                />
            )}
        </>
    );
}
