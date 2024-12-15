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
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';

import type { Question } from '../../../model/Question';

interface QuestionsTableProps {
    questions: Question[];
    onAdd: () => void;
    onEdit: (question: Question) => void;
    onDelete: (question: Question) => void;
    onSaveOrder: (questions: Question[]) => void;
}

export function QuestionsTable({ questions, onAdd, onEdit, onDelete, onSaveOrder }: QuestionsTableProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = questions.findIndex(item => item.id === active.id);
            const newIndex = questions.findIndex(item => item.id === over.id);

            const newOrder = arrayMove(questions, oldIndex, newIndex);
            onSaveOrder(newOrder);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Questions</h1>
                <Button onClick={onAdd}>Add Question</Button>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>#</TableHead>
                            <TableHead className="w-[100%]">Title</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <SortableContext items={questions} strategy={verticalListSortingStrategy}>
                            {questions.map(question => (
                                <SortableTableRow
                                    key={question.id}
                                    question={question}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </SortableContext>
                    </TableBody>
                </Table>
            </DndContext>
        </div>
    );
}

interface SortableItemProps {
    question: Question;
    onEdit: (question: Question) => void;
    onDelete: (question: Question) => void;
}

function SortableTableRow({ question, onEdit, onDelete }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 'auto',
        position: 'relative' as const,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <TableRow ref={setNodeRef} style={style} {...attributes}>
            <TableCell {...listeners}>
                <GripVertical className="text-gray-400 cursor-move" />
            </TableCell>
            <TableCell>{question.index + 1}</TableCell>
            <TableCell>{question.title}</TableCell>
            <TableCell>
                <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(question)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDelete(question)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
