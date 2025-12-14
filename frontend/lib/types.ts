// Общие TypeScript типы для всего приложения

export interface Character {
  id: string;
  name: string;
  gender: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  hp: {
    current: number;
    max: number;
  };
  ac: number;
  initiative: number;
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  skills: Record<string, number>;
  feats: string[];
  equipment: string[];
}

export interface World {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  playerCount: number;
}

export interface GameSession {
  id: string;
  character: Character;
  world: World;
  startedAt: string;
  narrative: string;
  actions: GameAction[];
}

export interface GameAction {
  type: 'attack' | 'spell' | 'dodge' | 'disengage' | 'hide' | 'help';
  target?: string;
  result: string;
  timestamp: string;
}

export interface CustomRace {
  name: string;
  description: string;
  size: string;
  speed: number;
  abilityBonus: Record<string, number>;
  features: string[];
}

export interface CustomClass {
  name: string;
  description: string;
  hitDice: string;
  features: Record<number, string[]>;
}

export interface CustomFeat {
  name: string;
  description: string;
  passive: boolean;
  bonus?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
