import type { Question, QuestionAnswer } from '../entities/Question';
import type { AnswersRepository } from '../repositories/answers.repository';
import { PlayerStateRepository } from '../repositories/player-state.repository';
import { PlayersRepository } from '../repositories/players.repository';
import { QuestionsService } from '../services/questions.service';
import { QuizStateService } from '../services/quiz-state.service';

interface Answer {
    playerId: string;
    messageId: string;
    index: number;
}

interface PlayersNotificationService {
    sendAnswerConfirmation(question: Question, answer: QuestionAnswer): Promise<void>;
    sendAnswerRejection(): Promise<void>;
}

export class AcceptPlayerAnswerUseCase {
    constructor(
        private playersRepository: PlayersRepository,
        private playerStateRepository: PlayerStateRepository,
        private playersNotificationService: PlayersNotificationService,
        private questionsService: QuestionsService,
        private answersRepository: AnswersRepository,
        private quizStateService: QuizStateService
    ) {}

    async execute(input: Answer): Promise<void> {
        const player = await this.playersRepository.findById(input.playerId);
        if (!player) {
            console.warn(`Unknown user: ${input.playerId}`);
            return;
        }

        const playerState = await this.playerStateRepository.loadState(player.id);
        if (input.messageId !== playerState?.currentMessageId) {
            console.warn(`Outdated message reply: ${input.messageId} !== ${playerState?.currentMessageId}`);
            await this.playersNotificationService.sendAnswerRejection();
            return;
        }

        const state = await this.quizStateService.getCurrentQuestion();
        if (!state.id) {
            console.warn(`Outdated message reply. Current question stopped.`);
            await this.playersNotificationService.sendAnswerRejection();
            return;
        }

        if (state.id !== playerState.currentQuestionId) {
            console.warn(`Outdated question reply: ${state.id} !== ${playerState.currentQuestionId}`);
            await this.playersNotificationService.sendAnswerRejection();
            return;
        }

        const question = await this.questionsService.getQuestion(state.id);
        const answer = question.answers[input.index];
        if (!answer) {
            throw new Error(`Invalid answer index: ${input.index}`);
        }

        await this.answersRepository.create({
            id: crypto.randomUUID(),
            playerId: player.id,
            questionId: question.id,
            answer: answer.id,
            score: answer.score,
            createdAt: Date.now(),
        });

        await this.playerStateRepository.saveState(player.id, {
            currentMessageId: null,
            currentQuestionId: null,
        });

        await this.playersNotificationService.sendAnswerConfirmation(question, answer);
    }
}
