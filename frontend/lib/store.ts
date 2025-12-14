// Zustand стор для глобального управления состоянием

import { create } from 'zustand';
import type { Character, World, GameSession } from './types';

interface GameStore {
  character: Character | null;
  world: World | null;
  session: GameSession | null;
  narrative: string;
  isLoading: boolean;
  error: string | null;

  // Акции
  setCharacter: (character: Character | null) => void;
  setWorld: (world: World | null) => void;
  setSession: (session: GameSession | null) => void;
  setNarrative: (narrative: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  character: null,
  world: null,
  session: null,
  narrative: '',
  isLoading: false,
  error: null,

  setCharacter: (character) => set({ character }),
  setWorld: (world) => set({ world }),
  setSession: (session) => set({ session }),
  setNarrative: (narrative) => set({ narrative }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      character: null,
      world: null,
      session: null,
      narrative: '',
      isLoading: false,
      error: null,
    }),
}));
