export interface Question {
    title: string;
    answers: QuestionAnswer[];
}

export interface QuestionAnswer {
    title: string;
    score: number;
}
