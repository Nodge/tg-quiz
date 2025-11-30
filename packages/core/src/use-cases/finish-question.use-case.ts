import type { Player } from '../entities/Player';
import type { PlayerState } from '../entities/PlayerState';
import type { Question } from '../entities/Question';
import type { PlayersRepository } from '../repositories/players.repository';
import type { PlayerStateRepository } from '../repositories/player-state.repository';
import type { CurrentUserService } from '../services/current-user.service';
import type { QuestionsService } from '../services/questions.service';
import type { QuizStateService } from '../services/quiz-state.service';

interface PlayersNotificationService {
    sendFinishQuestionMessage(player: Player, state: PlayerState, question: Question): Promise<void>;
    sendFinalMessage(player: Player): Promise<void>;
}

export class FinishQuestionUseCase {
    constructor(
        private quizStateService: QuizStateService,
        private questionsService: QuestionsService,
        private playersRepository: PlayersRepository,
        private playerStateRepository: PlayerStateRepository,
        private playersNotificationService: PlayersNotificationService,
        private currentUser: CurrentUserService
    ) {}

    public async execute(): Promise<void> {
        this.currentUser.assertAdmin();

        const { id, state } = await this.quizStateService.getCurrentQuestion();
        if (!id) {
            throw new Error('No current question');
        }

        if (state !== 'ON_AIR') {
            throw new Error('Question already stopped');
        }

        const question = await this.questionsService.getQuestion(id);
        const hasNextQuestion = await this.questionsService.hasNextQuestion(id);
        await this.stopCurrentQuestionForAllPlayers(question, hasNextQuestion);

        await this.quizStateService.setCurrentQuestion(id, 'STOPPED');
    }

    private async stopCurrentQuestionForAllPlayers(currentQuestion: Question, hasNextQuestion: boolean) {
        const players = await this.playersRepository.findAll();
        const states = await this.playerStateRepository.loadAll();

        const promises = players.map(async player => {
            const state = states.get(player.id);

            if (state?.currentMessageId) {
                await this.playerStateRepository.saveState(player.id, {
                    currentQuestionId: null,
                    currentMessageId: null,
                });
                await this.playersNotificationService.sendFinishQuestionMessage(player, state, currentQuestion);
            }

            if (!hasNextQuestion) {
                await this.playersNotificationService.sendFinalMessage(player);
            }
        });

        const result = await Promise.allSettled(promises);

        for (const item of result) {
            if (item.status === 'rejected') {
                console.error(new Error('Failed to notify player', { cause: item.reason }));
            }
        }
    }
}
