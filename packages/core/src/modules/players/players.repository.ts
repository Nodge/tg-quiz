import { createToken } from '@quiz/shared';

import type { Player } from './player.dto';

export type NewPlayerData = Omit<Player, 'createdAt' | 'currentMessageId' | 'currentQuestionId'>;

export abstract class PlayersRepository {
    public abstract findById(id: string): Promise<Player | null>;
    public abstract findAll(): Promise<Player[]>;
    public abstract create(data: NewPlayerData): Promise<Player>;
    public abstract update(player: Player): Promise<void>;
}

export const playersRepositoryToken = createToken<PlayersRepository>('PlayersRepository');
