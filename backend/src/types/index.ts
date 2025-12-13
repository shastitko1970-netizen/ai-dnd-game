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

export interface Session {
  id: string;
  character: Character;
  world: World;
  startTime: Date;
  turn: number;
  combatActive: boolean;
  combatState: CombatState | null;
  narrative: string;
  actions: GameAction[];
}

export interface GameAction {
  type: 'attack' | 'spell' | 'dodge' | 'disengage' | 'hide' | 'help';
  weapon?: string;
  spell?: string;
  target?: string;
  timestamp: Date;
}

export interface CombatState {
  round: number;
  currentTurn: number;
  turnOrder: Array<{ type: 'player' | 'enemy'; character: any; initiative: number }>;
  playerHP: { current: number; max: number };
  enemyHP: Array<{ name: string; current: number; max: number }>;
  combatLog: string[];
}

export interface CustomRace {
  id: string;
  name: string;
  description: string;
  size: 'Tiny' | 'Small' | 'Medium' | 'Large';
  speed: number;
  abilityBonus: { [key: string]: number };
  features: string[];
  source: 'Official' | 'CUSTOM';
}

export interface CustomClass {
  id: string;
  name: string;
  description?: string;
  hitDice: number;
  primaryAbility: string;
  customFeatures: Array<{ level: number; name: string; description: string }>;
  source: 'Official' | 'CUSTOM';
}

export interface CustomFeat {
  id: string;
  name: string;
  description: string;
  prerequisite?: string;
  source: 'Official' | 'CUSTOM';
}

export interface CustomContent {
  races?: { [key: string]: CustomRace };
  classes?: { [key: string]: CustomClass };
  feats?: { [key: string]: CustomFeat };
}

export interface MergedRules {
  races: { [key: string]: any };
  classes: { [key: string]: any };
  feats: { [key: string]: any };
  spells: any;
  monsters: any;
  skills: any;
  conditions: any;
  mechanics: any;
  equipment: any;
}

export interface World {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  playerCount: number;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  damage?: string;
  savingThrow?: string;
  classes: string[];
}

export interface Race {
  name: string;
  size: string;
  speed: number;
  abilityBonus: { [key: string]: number };
  features: string[];
}

export interface Class {
  name: string;
  hitDice: number;
  primaryAbility: string;
  savingThrows: string[];
}

export interface Feat {
  name: string;
  description: string;
  prerequisite?: string;
}
