// types/index.ts - D&D Game Types (Fully Refactored)

/**
 * ПОЛНОСТЬЮ РАСШИРЕННЫЙ Character для D&D GM AI
 * Характер = Base Race + Optional Traits + Class + Personality + Abilities
 */
export interface Character {
  id: string;
  name: string;
  level: number;
  gender: string;
  
  // ===== ОСНОВА: РАСА, ЧЕРТЫ, КЛАСС =====
  race: string; // Base Race (Человек, Эльф, etc)
  traits?: string[]; // Optional Archetypes/Traits (Дампир, Оборотень, etc) - MULTI-SELECT!
  class: string; // Класс (Боец, Волшебник, etc)
  
  // ===== ХАРАКТЕРИСТИКИ D&D 5e (STR, DEX, CON, INT, WIS, CHA) =====
  abilities: {
    STR: number;  // Сила
    DEX: number;  // Ловкость
    CON: number;  // Телосложение
    INT: number;  // Интеллект
    WIS: number;  // Мудрость
    CHA: number;  // Харизма
  };
  
  // Модификаторы характеристик (как применяются)
  abilityModifiers?: {
    race?: { [key: string]: number };
    class?: { [key: string]: number };
    traits?: { [key: string]: number };
    custom?: { [key: string]: number }; // Что игрок распределил
  };
  
  // ===== ФОНОВАЯ ИНФОРМАЦИЯ И ЛИЧНОСТЬ =====
  background?: string; // Фон персонажа (Воин, Торговец, Отшельник, etc)
  personality?: {
    traits: string[]; // Личностные черты ("храбрый", "скаредный", etc)
    ideals: string; // Идеалы ("Честь", "Вера", etc)
    bonds: string; // Связи ("Мой отряд - моя семья", etc)
    flaws: string; // Недостатки ("Слишком горд", etc)
  };
  
  alignment?: 'Lawful Good' | 'Neutral Good' | 'Chaotic Good' |
             'Lawful Neutral' | 'True Neutral' | 'Chaotic Neutral' |
             'Lawful Evil' | 'Neutral Evil' | 'Chaotic Evil';
  
  // ===== НАВЫКИ И ПРОФЕССИИ =====
  skills?: {
    [skillName: string]: {
      proficient: boolean;
      bonus: number; // Бонус от особенности/оборудования
    };
  };
  feats?: string[]; // Подвиги D&D
  
  // ===== БОЕВЫЕ ХАРАКТЕРИСТИКИ =====
  hp: { current: number; max: number };
  ac: number; // Класс брони
  initiative: number; // Инициатива
  armor?: string; // Тип брони
  weapon?: string; // Основное оружие
  
  // ===== СОСТОЯНИЕ И ИСТОРИЯ =====
  emotionalState?: string; // "напряжён", "уверен", "испуган", etc
  shortTermGoal?: string; // Текущая цель в сессии
  wounds?: string[]; // Активные раны/последствия
  conditions?: string[]; // D&D условия (отравлен, оглушён, etc)
  
  // ===== ДЛЯ AI КОНТЕКСТА =====
  backstory?: string; // Предыстория (чем занимался ДО игры)
  fears?: string[]; // Страхи персонажа
  dreams?: string[]; // Мечты и амбиции
  secrets?: string[]; // Тайны персонажа (для GM)
  
  // Отношения с NPC
  npcRelations?: {
    [npcName: string]: {
      reputation: 'friendly' | 'neutral' | 'hostile';
      trust: number; // -10 до +10
      history: string[];
      lastInteraction?: Date;
    };
  };
  
  // ===== ОПЦИОНАЛЬНЫЕ РАСШИРЕНИЯ =====
  customNotes?: string; // Пользовательские заметки
  createdAt?: Date;
  lastModified?: Date;
}

/**
 * Game Session - расширенная сессия с полной историей
 */
export interface GameSession {
  id: string;
  character: Character;
  world: World;
  startTime: Date;
  turn: number;
  
  // История для AI
  narrativeHistory: string; // Полная история сессии
  lastAction: string; // Последнее действие игрока
  lastActionIntent?: {
    type: 'combat' | 'skill_check' | 'dialogue' | 'exploration' | 'freeform';
    skill?: string;
    difficulty?: number;
    requiresRoll: boolean;
  };
  
  // Боевое состояние
  combatActive: boolean;
  combatState: CombatState | null;
  
  // Отслеживание изменений
  worldChanges: WorldChange[];
  npcRelations: Record<string, 'friendly' | 'neutral' | 'hostile'>;
  sessionDuration: number; // minutes
  actions: GameAction[];
}

export interface WorldChange {
  timestamp: Date;
  description: string;
  impact: 'minor' | 'major';
  affectedNPCs?: string[];
}

export interface GameAction {
  type: 'attack' | 'spell' | 'dodge' | 'disengage' | 'hide' | 'help' | 'custom';
  weapon?: string;
  spell?: string;
  target?: string;
  customAction?: string;
  description?: string;
  timestamp: Date;
  success?: boolean;
  consequence?: string;
}

export interface CombatState {
  round: number;
  currentTurn: number;
  turnOrder: Array<{
    type: 'player' | 'enemy';
    character: any;
    initiative: number;
  }>;
  playerHP: { current: number; max: number };
  enemyHP: Array<{ name: string; current: number; max: number }>;
  combatLog: string[];
}

// ===== ПОЛЬЗОВАТЕЛЬСКИЙ КОНТЕНТ =====

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

// ===== МИР И NPC =====

/**
 * World - расширенный мир D&D
 */
export interface World {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  playerCount: number;
  
  // Для AI контекста
  lore?: string; // История мира
  factions?: string[]; // Фракции
  npcs?: NPC[]; // Известные NPC
  locations?: Location[]; // Известные места
  currentLocation?: string; // Где сейчас партия
}

export interface NPC {
  id: string;
  name: string;
  role: string; // "Бармен", "Охранник", etc
  description: string;
  personality: string;
  motivations: string[];
  alignment?: string;
  lastInteraction?: Date;
  relationshipWithParty?: 'friendly' | 'neutral' | 'hostile';
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'tavern' | 'dungeon' | 'city' | 'forest' | 'castle' | 'custom';
  connections: string[];
  npcs?: string[]; // ID NPCs in this location
  hazards?: string[]; // Опасности
}

// ===== D&D ПРАВИЛА =====

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

export interface Trait {
  name: string;
  type: 'Supernatural' | 'Physical' | 'Fey' | 'Construct' | 'Shapeshifter';
  abilityBonus: { [key: string]: number };
  features: string[];
  canCombineWith?: string[] | string; // "All" или конкретные расы
}

export interface Class {
  name: string;
  hitDice: number;
  primaryAbility: string;
  savingThrows: string[];
  abilityBonus?: { [key: string]: number };
}

export interface Background {
  name: string;
  description: string;
  skillProficiencies: string[];
  personalityTraits: string[];
  ideals: string;
  bonds: string;
  flaws: string;
}

export interface Feat {
  name: string;
  description: string;
  prerequisite?: string;
}

export interface Ability {
  name: string;
  short: string; // STR, DEX, etc
  description: string;
}

// ===== СПОСОБЫ РАСЧЁТА ХАРАКТЕРИСТИК =====

export type AbilityScoringMethod = 'StandardArray' | 'PointBuy' | 'Random' | 'Fixed';

export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

// ===== DICE ROLL РЕЗУЛЬТАТЫ =====

export interface DiceRoll {
  roll: number; // d20 result
  modifier: number; // STR/DEX/etc modifier
  total: number; // roll + modifier
  success: boolean; // Is total >= DC?
  criticalHit: boolean; // 20?
  criticalMiss: boolean; // 1?
  dc?: number; // Target DC
}
