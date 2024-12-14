export interface Question {
    id: string;
    title: string;
    answers: QuestionAnswer[];
    index: number;
}

export interface QuestionAnswer {
    title: string;
    score: number;
}
