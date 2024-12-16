import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import type { Question, QuestionAnswer } from '@quiz/core';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';

interface QuestionFormSheetProps {
    isSaving: boolean;
    question: Question;
    onSave: (question: Question) => void;
    onClose: () => void;
}

export function QuestionFormSheet({ isSaving, question, onClose, onSave }: QuestionFormSheetProps) {
    const [title, setTitle] = useState(question.title);
    const [answers, setAnswers] = useState<QuestionAnswer[]>(question.answers);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const addAnswer = () => {
        const newAnswer: QuestionAnswer = {
            id: crypto.randomUUID(),
            title: '',
            score: 0,
        };
        setAnswers([...answers, newAnswer]);
    };

    const updateAnswer = (id: string, field: keyof QuestionAnswer, value: string | number) => {
        setAnswers(answers.map(answer => (answer.id === id ? { ...answer, [field]: value } : answer)));
    };

    const removeAnswer = (id: string) => {
        setAnswers(answers.filter(answer => answer.id !== id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setAnswers(items => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: question.id,
            index: question.index,
            title,
            answers,
        });
    };

    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent className="w-[70%] sm:w-[70%] sm:max-w-[70%] h-full">
                <div className="space-y-6 flex flex-col h-full">
                    <SheetHeader>
                        <SheetTitle>Edit Question</SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full overflow-y-auto">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Enter question title"
                            />
                        </div>

                        <div>
                            <Label>Answers</Label>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                modifiers={[restrictToVerticalAxis]}
                            >
                                <SortableContext items={answers} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3">
                                        {answers.map(answer => (
                                            <SortableAnswer
                                                key={answer.id}
                                                id={answer.id}
                                                answer={answer}
                                                updateAnswer={updateAnswer}
                                                removeAnswer={removeAnswer}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                            <Button type="button" onClick={addAnswer} className="mt-2" variant="ghost" size="sm">
                                <Plus className="w-4 h-4 mr-2" /> Add Answer
                            </Button>
                        </div>

                        <SheetFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </SheetFooter>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface SortableAnswerProps {
    id: string;
    answer: QuestionAnswer;
    updateAnswer: (id: string, field: keyof QuestionAnswer, value: string | number) => void;
    removeAnswer: (id: string) => void;
}

function SortableAnswer({ id, answer, updateAnswer, removeAnswer }: SortableAnswerProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card ref={setNodeRef} style={style}>
            <CardContent className="flex items-center space-x-4 p-4">
                <div {...attributes} {...listeners}>
                    <GripVertical className="text-gray-400 cursor-move" />
                </div>
                <Input
                    value={answer.title}
                    onChange={e => updateAnswer(id, 'title', e.target.value)}
                    placeholder="Answer title"
                    className="flex-grow"
                />
                <Input
                    type="number"
                    value={answer.score}
                    onChange={e => updateAnswer(id, 'score', parseInt(e.target.value))}
                    placeholder="Score"
                    className="w-20"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeAnswer(id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
}
