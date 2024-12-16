export type QuestionState = 'ON_AIR' | 'STOPPED';

export interface QuizState {
    id: string;
    currentQuestionId: string | null;
    currentQuestionState: QuestionState;
}
