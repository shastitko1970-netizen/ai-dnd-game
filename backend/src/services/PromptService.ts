// backend/src/services/PromptService.ts
// ПОЛНОЦЕННАЯ использация контекста персонажа

import type { Character, World } from '../types/index.js';
import { AbilityScoreService } from './AbilityScoreService.js';

export interface GameContext {
  narrativeHistory: string;
  lastAction: string;
  emotionalState: string;
  npcRelations?: Record<string, string>;
  sessionDuration: number;
  turn: number;
  worldState?: string; // Ютекущее состояние мира
}

export class PromptService {
  /**
   * Основница: болюшен системный промпт для D&D GM AI
   * Интегрирует: расу, черты, класс, фон, личность, характеристики
   */
  static getSystemPrompt(
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en' = 'ru'
  ): string {
    const basePrompt = language === 'ru'
      ? this.getSystemPromptRU()
      : this.getSystemPromptEN();

    // Построим полный портрет персонажа
    const characterPortrait = this.buildCharacterPortrait(character);
    const personalityContext = this.buildPersonalityContext(character);
    const abilitiesContext = this.buildAbilitiesContext(character);
    const npcContext = this.buildNPCContext(context.npcRelations);
    const emotionalContext = this.buildEmotionalContext(character, context);

    const truncatedHistory = context.narrativeHistory.slice(-2000); // Last 2000 chars

    return basePrompt
      .replace('{WORLD_NAME}', world.name || 'Неизвестный мир')
      .replace('{WORLD_DESCRIPTION}', world.description || '')
      .replace('{DIFFICULTY}', world.difficulty || 'Средняя')
      .replace('{CHARACTER_PORTRAIT}', characterPortrait)
      .replace('{PERSONALITY_CONTEXT}', personalityContext)
      .replace('{ABILITIES_CONTEXT}', abilitiesContext)
      .replace('{PREVIOUS_NARRATIVE}', truncatedHistory || 'Огра началась')
      .replace('{LAST_ACTION}', context.lastAction || 'Ничего')
      .replace('{EMOTIONAL_STATE}', emotionalContext)
      .replace('{NPC_RELATIONS}', npcContext)
      .replace('{TURN}', context.turn?.toString() || '1')
      .replace('{WORLD_STATE}', context.worldState || '');
  }

  /**
   * Поотрет персонажа: раса + черты + класс + фон
   */
  private static buildCharacterPortrait(character: Character): string {
    const parts: string[] = [];

    // Основная информация
    parts.push(`Имя: ${character.name}`);
    parts.push(`Пол: ${character.gender || 'Не указан'}`);
    parts.push(`Уровень: ${character.level || 1}`);

    // Раса + Черты
    let raceDisplay = character.race;
    if (character.traits && character.traits.length > 0) {
      raceDisplay += ` (с чертами: ${character.traits.join(', ')})`;
    }
    parts.push(`Раса: ${raceDisplay}`);
    parts.push(`Класс: ${character.class}`);

    // Фон
    if (character.background) {
      parts.push(`Фон: ${character.background}`);
    }

    return parts.join('\n');
  }

  /**
   * Личность и тайны
   */
  private static buildPersonalityContext(character: Character): string {
    const parts: string[] = [];

    // Личность
    if (character.personality) {
      if (character.personality.traits?.length) {
        parts.push(`Черты: ${character.personality.traits.join(', ')}`);
      }
      if (character.personality.ideals) {
        parts.push(`Идеалы: ${character.personality.ideals}`);
      }
      if (character.personality.bonds) {
        parts.push(`Связи: ${character.personality.bonds}`);
      }
      if (character.personality.flaws) {
        parts.push(`Недостатки: ${character.personality.flaws}`);
      }
    }

    // Выравнивание
    if (character.alignment) {
      parts.push(`Мировоззрение: ${character.alignment}`);
    }

    // Тайны (для GM контекста)
    if (character.secrets && character.secrets.length > 0) {
      parts.push(`🔐 Тайны: ${character.secrets[0]}`);
    }

    // Предыстория
    if (character.backstory) {
      const shortBackstory = character.backstory.slice(0, 200);
      parts.push(`Предыстория: ${shortBackstory}...`);
    }

    return parts.join('\n');
  }

  /**
   * Характеристики (STR, DEX, CON, INT, WIS, CHA с модификаторами)
   */
  private static buildAbilitiesContext(character: Character): string {
    if (!character.abilities) {
      return 'Характеристики не рассчитаны';
    }

    const mods = AbilityScoreService.getAllModifiers(character.abilities);
    const abilityNames: { [key: string]: string } = {
      STR: 'СИЛ',
      DEX: 'ЛОВ',
      CON: 'ТЕЛ',
      INT: 'ИНТ',
      WIS: 'МУД',
      CHA: 'ХАР',
    };

    const abilityLines = Object.entries(character.abilities).map(([key, value]) => {
      const mod = mods[key];
      const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
      return `${abilityNames[key]}: ${value} (${modStr})`;
    });

    return abilityLines.join(' | ');
  }

  /**
   * Отношения с NPC
   */
  private static buildNPCContext(npcRelations?: Record<string, string>): string {
    if (!npcRelations || Object.keys(npcRelations).length === 0) {
      return 'Нет важных отношений';
    }

    return Object.entries(npcRelations)
      .map(([npc, relation]) => `${npc}: ${relation}`)
      .join(' | ');
  }

  /**
   * Эмоциональный контекст
   */
  private static buildEmotionalContext(character: Character, context: GameContext): string {
    const parts: string[] = [];

    if (context.emotionalState) {
      parts.push(context.emotionalState);
    }

    if (character.emotionalState) {
      parts.push(character.emotionalState);
    }

    if (character.shortTermGoal) {
      parts.push(`Цель: ${character.shortTermGoal}`);
    }

    if (character.wounds && character.wounds.length > 0) {
      parts.push(`Недуги: ${character.wounds.join(', ')}`);
    }

    return parts.join(' | ') || 'Нейтральное';
  }

  private static getSystemPromptRU(): string {
    return `══════════════════════════════════════════════════════
🎫 ТЫ - МАСТЕР ПОДЗЕМЕЛИЙ (DUNGEON MASTER)
══════════════════════════════════════════════════════

⚔️ ТВОЯ ЕДИНСТВЕННАЯ ЗАДАЧА:
Рассказывать эпические истории в мире D&D 5e.
Ты - режиссёр, рассказчик, голос мира.
НЕ ты чат-бот. ТЫ - живой мастер.

══════════════════════════════════════════════════════
🌍 КОНТЕКСТ МИРА
══════════════════════════════════════════════════════
Мир: {WORLD_NAME}
Описание: {WORLD_DESCRIPTION}
Сложность: {DIFFICULTY}
Эпоха: Классическая фэнтези (мечи, магия, монстры)

══════════════════════════════════════════════════════
🐤 ПОРТРЕТ ПЕРСОНАЖА
══════════════════════════════════════════════════════
{CHARACTER_PORTRAIT}

📊 ХАРАКТЕРИСТИКИ D&D:
{ABILITIES_CONTEXT}

══════════════════════════════════════════════════════
📖 ЛИЧНОСТЬ И ТАЙНЫ
══════════════════════════════════════════════════════
{PERSONALITY_CONTEXT}

══════════════════════════════════════════════════════
📖 ИСТОРИЯ (контекст сессии)
══════════════════════════════════════════════════════
Ход: {TURN}
{WORLD_STATE}

{PREVIOUS_NARRATIVE}

Последнее действие: {LAST_ACTION}
Эмоциональное состояние: {EMOTIONAL_STATE}

Отношения:
{NPC_RELATIONS}

══════════════════════════════════════════════════════
🎮 ПРАВИЛА ТВОЕЙ ИГРЫ
══════════════════════════════════════════════════════

1. 🎬 ТЫ - РАССКАЗЧИК, НЕ СОВЕТНИК
   - Описываешь мир БЕЗ осуждения
   - Показываешь последствия действий
   - Не говоришь "можешь" или "нельзя"

2. 🔥 АТМОСФЕРА И ДЕТАЛИ
   - Описываешь запахи, звуки, ощущения
   - "Пахнет кровью и пеплом" > "Вы в опасности"
   - Показываешь, не рассказываешь

3. 🎭 ЖИВЫЕ ПЕРСОНАЖИ
   - NPC имеют мотивы, желания, страхи
   - Они реагируют на поступки персонажа
   - Помнят прошлые встречи и личность персонажа

4. ⚡ ДИНАМИКА
   - Мир НЕ статичный
   - Враги движутся, люди говорят, события происходят
   - После каждого действия персонажа - мир меняется

5. 🌙 МОРАЛОВНОСТЬ - ОТНОСИТЕЛЬНА
   - Нет "добрых" или "злых" решений
   - Мир МНОГООттеновный
   - Персонаж сам решает цену

6. 🚫 НИКОГДА НЕ ОТКАЗЫВАЙ
   - Игрок делает что угодно? Покажи результат
   - Понятие используют плюсы в контексте преклюностей персонажа

══════════════════════════════════════════════════════
✍️ СТИЛЬ ПИСьМА
══════════════════════════════════════════════════════

LENGTH: 2-3 предложения максимум
ЛАНГУАГ: ТОЛЬКО РУССКИЙ (кириллица + пунктуация)
NO: Английский, Markdown, emoji, символы других языков
YES: Живой язык, короткие фразы, глаголы

ПОЧЕМУ: Личность и предыстория персонажа должны инфлюэнсировать AI
Он не одно должно знать фон данного персонажа, но и по стоимости истории.
Операжаю ассеты персонажа (стости) в нюансированные действия

══════════════════════════════════════════════════════
`;
  }

  private static getSystemPromptEN(): string {
    return `══════════════════════════════════════════════════════
🎫 YOU ARE THE DUNGEON MASTER
══════════════════════════════════════════════════════

⚔️ YOUR SOLE PURPOSE:
Tell epic stories in the D&D 5e world.
You are the director, narrator, voice of the realm.
NOT a chatbot. YOU are a living master.

══════════════════════════════════════════════════════
🌍 WORLD CONTEXT
══════════════════════════════════════════════════════
World: {WORLD_NAME}
Description: {WORLD_DESCRIPTION}
Difficulty: {DIFFICULTY}
Era: Classic Fantasy (swords, magic, monsters)

══════════════════════════════════════════════════════
🐤 CHARACTER PORTRAIT
══════════════════════════════════════════════════════
{CHARACTER_PORTRAIT}

📊 ABILITY SCORES:
{ABILITIES_CONTEXT}

══════════════════════════════════════════════════════
📖 PERSONALITY & SECRETS
══════════════════════════════════════════════════════
{PERSONALITY_CONTEXT}

══════════════════════════════════════════════════════
📖 NARRATIVE CONTEXT (Turn {TURN})
══════════════════════════════════════════════════════
{WORLD_STATE}

{PREVIOUS_NARRATIVE}

Last Action: {LAST_ACTION}
Emotional State: {EMOTIONAL_STATE}

Relationships:
{NPC_RELATIONS}

══════════════════════════════════════════════════════
🎮 YOUR RULES
══════════════════════════════════════════════════════

1. 🎬 YOU ARE A NARRATOR, NOT A JUDGE
   - Describe the world without judgment
   - Show consequences of actions
   - Never say "you can't" or "you can"

2. 🔥 ATMOSPHERE AND DETAILS
   - Describe smells, sounds, sensations
   - "Reeks of blood and ash" > "You are in danger"
   - Show, don't tell

3. 🎭 LIVING CHARACTERS
   - NPCs have motives, desires, fears
   - They react to the player's deeds
   - They remember past encounters and character personality

4. ⚡ DYNAMIC WORLD
   - World is NOT static
   - Enemies move, people talk, events happen
   - World changes after each action

5. 🌙 MORALITY IS RELATIVE
   - No "good" or "evil" choices
   - Only consequences
   - Player decides the price

6. 🚫 NEVER REFUSE
   - Player does anything? Show the result

══════════════════════════════════════════════════════
✍️ WRITING STYLE
══════════════════════════════════════════════════════
LENGTH: 2-3 sentences maximum
LANGUAGE: ENGLISH ONLY
NO: Other languages, Markdown, emoji
YES: Vivid language, short phrases, verbs

NOTE: Use this deep character context to inform GM decisions, reactions, and story beats.
`;
  }
}

export default PromptService;
