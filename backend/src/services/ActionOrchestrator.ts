// ActionOrchestrator.ts - Умный анализ и обработка действий игрока

import type { Character, World } from '../types/index.js';
import PromptService, { type GameContext } from './PromptService.js';
import { AIService } from './AIService.js';

/**
 * Тип действия, определённый AI
 */
export type ActionType = 'combat' | 'skill_check' | 'dialogue' | 'exploration' | 'freeform';

/**
 * Результат анализа намерения
 */
export interface ActionIntent {
  type: ActionType;
  skill?: string; // Athletics, Stealth, Perception, Persuasion, etc.
  difficulty?: number; // DC 10, 15, 20, 25
  targetAC?: number; // Для атак
  requiresRoll: boolean;
  reasoning: string; // Почему AI выбрал этот тип
}

/**
 * Результат броска кубика
 */
export interface DiceResult {
  roll: number; // d20
  modifier: number; // Модификатор от персонажа
  total: number; // roll + modifier
  success: boolean;
  margin: number; // Разница между total и DC
  criticalHit: boolean; // 20
  criticalMiss: boolean; // 1
}

/**
 * Финальный результат обработки действия
 */
export interface ActionResult {
  intent: ActionIntent;
  diceResult?: DiceResult;
  narrative: string;
  suggestedActions: string[];
}

// Таблица переводов для локализации
const TRANSLATIONS: { [key: string]: { [key: string]: string } } = {
  ru: {
    'Damphir': 'Дампир',
    'Necromancer': 'Некромант',
    'Paladin': 'Паладин',
    'Rogue': 'Разбойник',
    'Fighter': 'Воин',
    'Wizard': 'Волшебник',
    'Barbarian': 'Варвар',
    'Bard': 'Бард',
    'Cleric': 'Священник',
    'Druid': 'Друид',
    'Monk': 'Монах',
    'Ranger': 'Рейнджер',
    'Sorcerer': 'Чародей',
    'Warlock': 'Колдун',
    'Elf': 'Эльф',
    'Human': 'Человек',
    'Dwarf': 'Гном',
    'Halfling': 'Полурослик',
    'Dragonborn': 'Драконорожденный',
    'Half-Elf': 'Полуэльф',
    'Half-Orc': 'Полуорк',
    'Tiefling': 'Тифлинг',
  },
  en: {},
};

export class ActionOrchestrator {
  /**
   * Локализация текста - заменяет английские слова на нужный язык
   */
  private static sanitizeForLanguage(text: string, language: 'ru' | 'en'): string {
    if (language === 'en') return text;

    let result = text;
    const langMap = TRANSLATIONS[language] || {};

    Object.entries(langMap).forEach(([en, translated]) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      result = result.replace(regex, translated);
    });

    return result;
  }

  /**
   * Форматирует текст действия - добавляет пробелы, убирает camelCase
   */
  private static formatActionText(action: string): string {
    // 1. Убираем двойные пробелы
    let formatted = action.replace(/\s+/g, ' ').trim();

    // 2. Проверяем что есть пробелы между словами
    if (formatted.length > 0 && !formatted.includes(' ')) {
      // Если одно слово - ОК
      return formatted;
    }

    // 3. Если слова слиплись (camelCase), разделяем
    // "войтиВТаверну" -> "войти в таверну"
    if (!/\s/.test(formatted) && /[a-z][A-Z]/.test(formatted)) {
      formatted = formatted
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase();
    }

    return formatted;
  }

  /**
   * ШАГИ 1-3 ВМЕСТЕ: Полная обработка действия
   */
  static async processAction(
    action: string,
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en' = 'ru'
  ): Promise<ActionResult> {
    console.log(`🎯 Обработка действия: "${action.substring(0, 50)}..."`);

    // STEP 1: Анализ намерения
    const intent = await this.analyzeIntent(action, character, language);
    console.log(`📊 Тип действия: ${intent.type} (requiresRoll: ${intent.requiresRoll})`);

    // STEP 2: Бросок кубика (если нужен)
    let diceResult: DiceResult | undefined;
    if (intent.requiresRoll) {
      diceResult = this.rollDice(character, intent);
      const resultText = diceResult.criticalHit
        ? '🎲 КРИТ УСПЕХ!'
        : diceResult.criticalMiss
          ? '💥 КРИТ ПРОВАЛ!'
          : diceResult.success
            ? '✅ УСПЕХ'
            : '❌ ПРОВАЛ';
      console.log(`${resultText} | Roll: ${diceResult.roll} + ${diceResult.modifier} = ${diceResult.total}`);
    } else {
      console.log('⏭️  Бросок кубика не требуется');
    }

    // STEP 3: Генерация нарратива с учётом результата
    const narrative = await this.generateNarrative(
      action,
      character,
      world,
      context,
      intent,
      diceResult,
      language
    );

    // Генерируем следующие действия
    let suggestedActions = await AIService.generateNextActions(
      character,
      world,
      context,
      language
    );

    // Форматируем и локализуем все действия
    suggestedActions = suggestedActions.map(action => {
      let formatted = this.formatActionText(action);
      formatted = this.sanitizeForLanguage(formatted, language);
      return formatted;
    });

    return {
      intent,
      diceResult,
      narrative,
      suggestedActions,
    };
  }

  /**
   * STEP 1: AI анализирует намерение игрока
   */
  private static async analyzeIntent(
    action: string,
    character: Character,
    language: 'ru' | 'en'
  ): Promise<ActionIntent> {
    const systemPrompt = language === 'ru'
      ? `Ты - анализатор действий игрока в D&D 5e.

Анализируй действие и верни ТОЛЬКО JSON (без markdown, без объяснений):
{
  "type": "combat" | "skill_check" | "dialogue" | "exploration" | "freeform",
  "skill": null | "Athletics" | "Acrobatics" | "Stealth" | "Perception" | "Insight" | "Persuasion" | "Deception" | "Arcana" | "Nature" | "Medicine" | "Investigation",
  "difficulty": null | 10 | 12 | 15 | 18 | 20 | 25,
  "requiresRoll": true | false,
  "reasoning": "Краткое объяснение"
}`
      : `You are a D&D 5e action analyzer.

Analyze the action and return ONLY JSON (no markdown):
{
  "type": "combat" | "skill_check" | "dialogue" | "exploration" | "freeform",
  "skill": null | "Athletics" | "Stealth" | "Perception" | "Persuasion" | ...,
  "difficulty": null | 10 | 15 | 20,
  "requiresRoll": true | false,
  "reasoning": "Brief explanation"
}`;

    const userPrompt = language === 'ru'
      ? `Персонаж: ${character.name} (${character.class}), Уровень: ${character.level}
Действие: "${action}"

Какой это тип действия и нужен ли бросок кубика?`
      : `Character: ${character.name} (${character.class}), Level: ${character.level}
Action: "${action}"

What type of action is this and does it require a dice roll?`;

    try {
      const response = await AIService.analyzeAction(systemPrompt, userPrompt);
      const parsed = JSON.parse(response);

      return {
        type: parsed.type || 'freeform',
        skill: parsed.skill || undefined,
        difficulty: parsed.difficulty || undefined,
        requiresRoll: parsed.requiresRoll === true,
        reasoning: parsed.reasoning || 'Automated analysis',
      };
    } catch (error) {
      console.warn('⚠️  Не могу распарсить анализ, используется freeform');
      return {
        type: 'freeform',
        requiresRoll: false,
        reasoning: 'Parse error, defaulting to freeform',
      };
    }
  }

  /**
   * STEP 2: Бросок кубика d20 + модификаторы
   */
  private static rollDice(character: Character, intent: ActionIntent): DiceResult {
    // Бросок d20 (1-20)
    const roll = Math.floor(Math.random() * 20) + 1;

    // Получаем модификатор из навыка персонажа
    let modifier = 0;
    if (intent.skill && character.skills[intent.skill]) {
      modifier = character.skills[intent.skill].bonus;
    } else if (intent.type === 'combat') {
      // Для боя используем DEX или STR
      const dexMod = Math.floor((character.abilities.DEX - 10) / 2);
      const strMod = Math.floor((character.abilities.STR - 10) / 2);
      modifier = Math.max(dexMod, strMod);
    }

    const total = roll + modifier;
    const difficulty = intent.difficulty || 10;
    const success = total >= difficulty;
    const margin = total - difficulty;

    return {
      roll,
      modifier,
      total,
      success,
      margin,
      criticalHit: roll === 20,
      criticalMiss: roll === 1,
    };
  }

  /**
   * STEP 3: Генерация нарратива с учётом броска
   */
  private static async generateNarrative(
    action: string,
    character: Character,
    world: World,
    context: GameContext,
    intent: ActionIntent,
    diceResult: DiceResult | undefined,
    language: 'ru' | 'en'
  ): Promise<string> {
    let enhancedAction = action;

    // Добавляем информацию о броске в контекст для AI
    if (diceResult) {
      if (diceResult.criticalHit) {
        enhancedAction += language === 'ru'
          ? `\n[🎲 КРИТ УСПЕХ! Бросок: 20 + ${diceResult.modifier} = ${diceResult.total}]`
          : `\n[🎲 CRITICAL SUCCESS! Roll: 20 + ${diceResult.modifier} = ${diceResult.total}]`;
      } else if (diceResult.criticalMiss) {
        enhancedAction += language === 'ru'
          ? `\n[💥 КРИТ ПРОВАЛ! Бросок: 1 + ${diceResult.modifier} = ${diceResult.total}]`
          : `\n[💥 CRITICAL FAILURE! Roll: 1 + ${diceResult.modifier} = ${diceResult.total}]`;
      } else {
        const status = diceResult.success ? '✅ УСПЕХ' : '❌ ПРОВАЛ';
        const statusEn = diceResult.success ? '✅ SUCCESS' : '❌ FAILURE';
        enhancedAction += language === 'ru'
          ? `\n[${status} Бросок: ${diceResult.roll} + ${diceResult.modifier} = ${diceResult.total}]`
          : `\n[${statusEn} Roll: ${diceResult.roll} + ${diceResult.modifier} = ${diceResult.total}]`;
      }
    } else {
      if (language === 'ru') {
        enhancedAction += `\n[Не требует броска кубика]`;
      } else {
        enhancedAction += `\n[No dice roll required]`;
      }
    }

    // Генерируем нарратив с улучшенным контекстом
    return await AIService.generateActionResponse(
      enhancedAction,
      character,
      world,
      context,
      language
    );
  }
}

export default ActionOrchestrator;
