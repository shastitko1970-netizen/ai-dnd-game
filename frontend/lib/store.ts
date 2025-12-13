import { create } from 'zustand';
import type { Character, World } from './types';

interface GameStore {
  character: Character | null;
  selectedWorld: World | null;
  sessionId: string | null;
  mergedRules: any | null;

  setCharacter: (char: Character) => void;
  setSelectedWorld: (world: World) => void;
  setSessionId: (id: string) => void;
  setMergedRules: (rules: any) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  character: null,
  selectedWorld: null,
  sessionId: null,
  mergedRules: null,

  setCharacter: (char) => set({ character: char }),
  setSelectedWorld: (world) => set({ selectedWorld: world }),
  setSessionId: (id) => set({ sessionId: id }),
  setMergedRules: (rules) => set({ mergedRules: rules }),
  reset: () => set({
    character: null,
    selectedWorld: null,
    sessionId: null,
    mergedRules: null,
  })
}));
