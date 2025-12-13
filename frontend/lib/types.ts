export interface Character {
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  gender: string;
  abilities: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  skills: { [key: string]: { proficient: boolean; bonus: number } };
  feats: string[];
  armor: string;
  hp: { current: number; max: number };
  ac: number;
  initiative: number;
}

export interface World {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  playerCount: number;
}
