export type QuestionState = 'ON_AIR' | 'STOPPED';

export interface QuizState {
    currentQuestionId: string | null;
    currentQuestionState: QuestionState;
}
