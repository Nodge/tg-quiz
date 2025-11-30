import type { PlayerState } from '../entities/PlayerState';

export interface PlayerStateRepository {
    loadAll(): Promise<Map<string, PlayerState>>;
    loadState(playerId: string): Promise<PlayerState | null>;
    saveState(playerId: string, state: PlayerState): Promise<void>;
}
