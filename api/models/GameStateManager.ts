import type { GameState, EconomicParams } from '../../shared/index.js';
import { initializeGame, simulateDay, updateParams, setGameControl } from '../engine/EconomicEngine.js';

class GameStateManager {
  private state: GameState;

  constructor() {
    this.state = initializeGame();
  }

  getState(): GameState {
    return this.state;
  }

  initialize(): GameState {
    this.state = initializeGame();
    return this.state;
  }

  reset(): GameState {
    return this.initialize();
  }

  step(): GameState {
    this.state = simulateDay(this.state);
    return this.state;
  }

  updateParams(params: Partial<EconomicParams>): GameState {
    this.state = updateParams(this.state, params);
    return this.state;
  }

  setControl(isRunning: boolean, speed?: number): GameState {
    this.state = setGameControl(this.state, isRunning, speed);
    return this.state;
  }

  getEntity(id: string) {
    return this.state.entities.find(e => e.id === id);
  }

  getHistory() {
    return this.state.history;
  }
}

export const gameStateManager = new GameStateManager();
