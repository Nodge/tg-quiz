export interface Question {
    id: string;
    title: string;
    answers: QuestionAnswer[];
    index: number;
}

export interface QuestionAnswer {
    id: string;
    title: string;
    score: number;
}
