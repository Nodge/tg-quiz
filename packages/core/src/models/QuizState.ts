export type QuestionState = 'ON_AIR' | 'STOPPED';

export type QuizStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED';

export interface QuizState {
    id: string;
    currentQuestionId: string | null;
    currentQuestionState: QuestionState;
}
