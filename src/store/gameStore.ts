import { create } from 'zustand';
import type { GameState, EconomicParams, Entity } from '@shared/index';
import { DEFAULT_PARAMS } from '@shared/index';

interface GameStore {
  state: GameState | null;
  selectedEntity: Entity | null;
  isConnected: boolean;
  error: string | null;
  
  setState: (state: GameState) => void;
  setSelectedEntity: (entity: Entity | null) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  
  updateParams: (params: Partial<EconomicParams>) => void;
  setControl: (isRunning: boolean, speed?: number) => void;
  step: () => void;
  reset: () => void;
}

const initialGameState: GameState = {
  day: 0,
  isRunning: false,
  speed: 1,
  params: { ...DEFAULT_PARAMS },
  stats: {
    gdp: 0,
    gdpChange: 0,
    unemploymentRate: 0.1,
    unemploymentChange: 0,
    priceIndex: 100,
    priceChange: 0,
    totalPopulation: 100,
    employedPopulation: 90,
  },
  entities: [],
  history: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  state: initialGameState,
  selectedEntity: null,
  isConnected: false,
  error: null,

  setState: (state) => set({ state }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ error }),

  updateParams: (params) => {
    const socket = (window as any).gameSocket;
    if (socket) {
      socket.emit('game:params:update', params);
    }
  },

  setControl: (isRunning, speed) => {
    const socket = (window as any).gameSocket;
    if (socket) {
      socket.emit('game:control', { isRunning, speed });
    }
  },

  step: () => {
    const socket = (window as any).gameSocket;
    if (socket) {
      socket.emit('game:step');
    }
  },

  reset: () => {
    const socket = (window as any).gameSocket;
    if (socket) {
      socket.emit('game:reset');
    }
    set({ selectedEntity: null });
  },
}));
