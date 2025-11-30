import type { Player } from '../entities/Player';
import type { Question } from '../entities/Question';
import type { PlayersRepository } from '../repositories/players.repository';
import type { PlayerStateRepository } from '../repositories/player-state.repository';
import type { CurrentUserService } from '../services/current-user.service';
import type { QuestionsService } from '../services/questions.service';
import type { QuizStateService } from '../services/quiz-state.service';

interface Message {
    id: string;
}

interface PlayersNotificationService {
    sendNewQuestionMessage(player: Player, question: Question): Promise<Message>;
}

export class ActivateNextQuestionUseCase {
    constructor(
        private quizStateService: QuizStateService,
        private questionsService: QuestionsService,
        private playersRepository: PlayersRepository,
        private playerStateRepository: PlayerStateRepository,
        private playersNotificationService: PlayersNotificationService,
        private currentUser: CurrentUserService
    ) {}

    public async execute(): Promise<Question | null> {
        this.currentUser.assertAdmin();

        const { id, state } = await this.quizStateService.getCurrentQuestion();
        if (state === 'ON_AIR') {
            throw new Error('Previous question has not been stopped');
        }

        const nextQuestion = await this.questionsService.getNextQuestion(id);
        if (!nextQuestion) {
            return null;
        }

        await this.quizStateService.setCurrentQuestion(nextQuestion.id, 'ON_AIR');
        await this.broadcastQuestionToPlayers(nextQuestion);

        return nextQuestion;
    }

    private async broadcastQuestionToPlayers(question: Question) {
        const allPlayers = await this.playersRepository.findAll();

        const promises = allPlayers.map(async player => {
            await this.playerStateRepository.saveState(player.id, {
                currentQuestionId: question.id,
                currentMessageId: null,
            });

            const message = await this.playersNotificationService.sendNewQuestionMessage(player, question);

            await this.playerStateRepository.saveState(player.id, {
                currentQuestionId: question.id,
                currentMessageId: message.id,
            });
        });

        const result = await Promise.allSettled(promises);

        for (const item of result) {
            if (item.status === 'rejected') {
                console.error(new Error('Failed to notify player', { cause: item.reason }));
            }
        }
    }
}
