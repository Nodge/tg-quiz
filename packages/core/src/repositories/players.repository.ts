import type { Player } from '../entities/Player';

export interface PlayersRepository {
    findById(id: string): Promise<Player | null>;
    findAll(): Promise<Player[]>;
    create(data: Player): Promise<Player>;
    update(player: Player): Promise<void>;
}
