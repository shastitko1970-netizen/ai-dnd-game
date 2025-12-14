// types/index.ts - D&D Game Types (Extended)

/**
 * Расширенный Character - для D&D GM AI
 */
export interface Character {
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  gender: string;
  
  // Характеристики D&D 5e
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
  
  // Здоровье и защита
  hp: { current: number; max: number };
  ac: number;
  initiative: number;
  
  // ===== НОВЫЕ ПОЛЯ ДЛЯ AI GM =====
  
  // Личность и цели
  alignment?: 'Lawful Good' | 'Neutral Good' | 'Chaotic Good' | 
             'Lawful Neutral' | 'True Neutral' | 'Chaotic Neutral' | 
             'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil';
  
  traits?: string[]; // Личностные черты ("храбрый", "скаредный", etc)
  goal?: string; // Общая цель персонажа
  fear?: string; // Страх персонажа
  dream?: string; // Мечта персонажа
  
  // История и состояние
  backstory?: string; // Предыстория персонажа
  emotionalState?: string; // Текущее эмоциональное состояние
  wounds?: string[]; // Текущие раны/последствия
  
  // Отношения с NPC
  npcRelations?: {
    [npcName: string]: {
      reputation: 'friendly' | 'neutral' | 'hostile';
      history: string[]; // История взаимодействий
    };
  };
  
  // Боевые состояние (advanced)
  conditions?: string[]; // Активные D&D условия (poisoned, stunned, etc)
  shortTermGoal?: string; // Краткосрочная цель в текущей сессии
}

/**
 * Game Session - расширенная сессия с историей
 */
export interface GameSession {
  id: string;
  character: Character;
  world: World;
  startTime: Date;
  turn: number;
  combatActive: boolean;
  combatState: CombatState | null;
  
  // История для контекста AI
  narrativeHistory: string; // Вся история сессии
  lastAction: string; // Последнее действие игрока
  emotionalState: string; // Эмоциональное состояние
  npcRelations: Record<string, 'friendly' | 'neutral' | 'hostile'>; // Reputation
  
  actions: GameAction[];
  worldChanges: WorldChange[]; // Как мир изменился
  sessionDuration: number; // minutes
}

/**
 * Отслеживание изменений мира
 */
export interface WorldChange {
  timestamp: Date;
  description: string;
  impact: 'minor' | 'major'; // Насколько значительно?
  affectedNPCs?: string[]; // Кого это коснулось?
}

export interface GameAction {
  type: 'attack' | 'spell' | 'dodge' | 'disengage' | 'hide' | 'help' | 'custom';
  weapon?: string;
  spell?: string;
  target?: string;
  customAction?: string; // Для любых других действий
  description?: string; // Как игрок это описал
  timestamp: Date;
  success?: boolean; // Результат
  consequence?: string; // Последствия
}

export interface CombatState {
  round: number;
  currentTurn: number;
  turnOrder: Array<{ type: 'player' | 'enemy'; character: any; initiative: number }>;
  playerHP: { current: number; max: number };
  enemyHP: Array<{ name: string; current: number; max: number }>;
  combatLog: string[];
}

// Custom Content
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

/**
 * World - расширенный мир
 */
export interface World {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  playerCount: number;
  
  // Для AI контекста
  lore?: string; // История мира
  factions?: string[]; // Фракции в мире
  npcs?: NPC[]; // Знакомые NPC
  locations?: Location[]; // Известные места
}

export interface NPC {
  id: string;
  name: string;
  role: string; // "Бармен", "Охранник", etc
  description: string;
  personality: string;
  motivations: string[];
  lastInteraction?: Date;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'tavern' | 'dungeon' | 'city' | 'forest' | 'castle' | 'custom';
  connections: string[]; // Связанные локации
}

// D&D Rules
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
