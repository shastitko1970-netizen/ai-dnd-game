// ActionOrchestrator.ts - Intelligent action analysis and processing with D&D 5e mechanics

import type { Character, World } from '../types/index.js';
import PromptService, { type GameContext } from './PromptService.js';
import { AIService } from './AIService.js';
import { AbilityScoreService } from './AbilityScoreService.js';

/**
 * Action type determined by AI
 */
export type ActionType = 'combat' | 'skill_check' | 'dialogue' | 'exploration' | 'freeform';

/**
 * Skill mapping to ability scores
 */
const SKILL_ABILITY_MAP: { [key: string]: keyof typeof CHARACTER_ABILITIES } = {
  'Athletics': 'STR',
  'Acrobatics': 'DEX',
  'Stealth': 'DEX',
  'Sleight of Hand': 'DEX',
  'Perception': 'WIS',
  'Insight': 'WIS',
  'Medicine': 'WIS',
  'Animal Handling': 'WIS',
  'Survival': 'WIS',
  'Arcana': 'INT',
  'History': 'INT',
  'Investigation': 'INT',
  'Nature': 'INT',
  'Religion': 'INT',
  'Deception': 'CHA',
  'Intimidation': 'CHA',
  'Performance': 'CHA',
  'Persuasion': 'CHA',
};

const CHARACTER_ABILITIES = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

/**
 * Analysis of player intent
 */
export interface ActionIntent {
  type: ActionType;
  skill?: string; // Athletics, Stealth, Perception, Persuasion, etc.
  ability?: string; // Underlying ability for this action
  difficulty?: number; // DC 10, 15, 20, 25
  targetAC?: number; // For attacks
  requiresRoll: boolean;
  reasoning: string; // Why AI chose this type
}

/**
 * Dice roll result
 */
export interface DiceResult {
  roll: number; // d20
  abilityMod: number; // Modifier from character's ability
  profBonus: number; // Proficiency bonus (if any)
  modifier: number; // abilityMod + profBonus
  total: number; // roll + modifier
  success: boolean; // total >= difficulty
  margin: number; // total - difficulty
  criticalHit: boolean; // 20
  criticalMiss: boolean; // 1
}

/**
 * Final action processing result
 */
export interface ActionResult {
  intent: ActionIntent;
  diceResult?: DiceResult;
  narrative: string;
  suggestedActions: string[];
  npcInfluence?: string; // How personality influenced NPC response
  relationshipChanged?: boolean; // If relationships evolved
}

/**
 * NPC relationship state
 */
export interface NPCRelationship {
  name: string;
  attitude: 'hostile' | 'indifferent' | 'friendly' | 'devoted';
  points: number; // -100 to +100
  lastInteraction: string;
}

export class ActionOrchestrator {
  /**
   * Localize text by replacing English class/race names
   */
  private static sanitizeForLanguage(text: string, language: 'ru' | 'en'): string {
    if (language === 'en') return text;
    
    const translations: { [key: string]: string } = {
      'Barbarian': 'Варвар',
      'Bard': 'Бард',
      'Cleric': 'Священник',
      'Druid': 'Друид',
      'Fighter': 'Воин',
      'Monk': 'Монах',
      'Paladin': 'Паладин',
      'Ranger': 'Рейнджер',
      'Rogue': 'Разбойник',
      'Sorcerer': 'Чародей',
      'Warlock': 'Колдун',
      'Wizard': 'Волшебник',
    };
    
    let result = text;
    Object.entries(translations).forEach(([en, ru]) => {
      result = result.replace(new RegExp(`\\b${en}\\b`, 'g'), ru);
    });
    return result;
  }

  /**
   * Format action text - remove camelCase, add spaces
   */
  private static formatActionText(action: string): string {
    let formatted = action.replace(/\s+/g, ' ').trim();
    
    if (!/\s/.test(formatted) && /[a-z][A-Z]/.test(formatted)) {
      formatted = formatted
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase();
    }

    return formatted;
  }

  /**
   * Get modifier for a skill based on character's ability scores
   */
  private static getSkillModifier(character: Character, skill: string): number {
    const abilityKey = SKILL_ABILITY_MAP[skill];
    
    if (!abilityKey) {
      console.warn(`Unknown skill: ${skill}`);
      return 0;
    }

    const ability = character.abilities[abilityKey] || 10;
    const abilityMod = Math.floor((ability - 10) / 2);
    
    // Check if character has proficiency in this skill
    let profBonus = 0;
    if (character.skills && character.skills[skill]) {
      const skillBonus = character.skills[skill].bonus || 0;
      profBonus = Math.max(0, skillBonus - abilityMod);
    }

    return abilityMod + profBonus;
  }

  /**
   * Get proficiency bonus based on character level
   */
  private static getProficiencyBonus(level: number): number {
    if (level < 5) return 2;
    if (level < 9) return 2;
    if (level < 13) return 3;
    if (level < 17) return 3;
    return 4;
  }

  /**
   * MAIN: Process action completely
   */
  static async processAction(
    action: string,
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en' = 'ru'
  ): Promise<ActionResult> {
    console.log(`🎯 Processing action: "${action.substring(0, 50)}..."`);

    // STEP 1: Analyze intent
    const intent = await this.analyzeIntent(action, character, language);
    console.log(`📊 Action type: ${intent.type}${intent.skill ? ` (${intent.skill})` : ''}`);

    // STEP 2: Roll dice if needed
    let diceResult: DiceResult | undefined;
    if (intent.requiresRoll) {
      diceResult = this.rollDice(character, intent);
      const resultText = diceResult.criticalHit
        ? 'CRITICAL HIT!'
        : diceResult.criticalMiss
          ? 'CRITICAL MISS!'
          : diceResult.success
            ? 'SUCCESS'
            : 'FAILURE';
      console.log(`${resultText} | Roll: d20[${diceResult.roll}] + ${diceResult.modifier} = ${diceResult.total}`);
    }

    // STEP 3: Analyze personality influence on NPCs
    const personalityInfluence = this.analyzePersonalityInfluence(
      character,
      intent,
      diceResult
    );
    console.log(`💭 Personality influence: ${personalityInfluence}`);

    // STEP 4: Generate narrative
    const narrative = await this.generateNarrative(
      action,
      character,
      world,
      context,
      intent,
      diceResult,
      personalityInfluence,
      language
    );

    // STEP 5: Evolve relationships if dialogue/interaction
    let relationshipChanged = false;
    if (intent.type === 'dialogue' && diceResult) {
      relationshipChanged = this.evolveRelationships(
        character,
        context,
        diceResult.success,
        character.personality?.ideals || ''
      );
    }

    // Get next actions
    let suggestedActions = await AIService.generateNextActions(
      character,
      world,
      context,
      language
    );

    suggestedActions = suggestedActions.map(a => {
      let formatted = this.formatActionText(a);
      formatted = this.sanitizeForLanguage(formatted, language);
      return formatted;
    });

    return {
      intent,
      diceResult,
      narrative,
      suggestedActions,
      npcInfluence: personalityInfluence,
      relationshipChanged,
    };
  }

  /**
   * STEP 1: Analyze player intent
   */
  private static async analyzeIntent(
    action: string,
    character: Character,
    language: 'ru' | 'en'
  ): Promise<ActionIntent> {
    const systemPrompt = language === 'ru'
      ? `Ты анализатор действий в D&D 5e. Верни ТОЛЬКО JSON:\n{
  "type": "combat" | "skill_check" | "dialogue" | "exploration" | "freeform",
  "skill": null | "Athletics" | "Stealth" | "Perception" | "Persuasion" | "Deception" | "Insight" | "Investigation",
  "difficulty": null | 10 | 15 | 20 | 25,
  "requiresRoll": true | false,
  "reasoning": "Объяснение"
}`
      : `Analyze D&D 5e action. Return ONLY JSON:\n{
  "type": "combat" | "skill_check" | "dialogue" | "exploration" | "freeform",
  "skill": null | "Athletics" | "Stealth" | "Perception" | "Persuasion" | ...,
  "difficulty": null | 10 | 15 | 20,
  "requiresRoll": true | false,
  "reasoning": "Explanation"
}`;

    const userPrompt = language === 'ru'
      ? `${character.name} (${character.class}, Level ${character.level}), Personality: ${character.personality?.traits || 'neutral'}\nAction: "${action}"`
      : `${character.name} (${character.class}, Level ${character.level}), Personality: ${character.personality?.traits || 'neutral'}\nAction: "${action}"`;

    try {
      const response = await AIService.analyzeAction(systemPrompt, userPrompt);
      const parsed = JSON.parse(response);

      const ability = parsed.skill ? SKILL_ABILITY_MAP[parsed.skill] : undefined;

      return {
        type: parsed.type || 'freeform',
        skill: parsed.skill || undefined,
        ability: ability || undefined,
        difficulty: parsed.difficulty || undefined,
        requiresRoll: parsed.requiresRoll === true,
        reasoning: parsed.reasoning || 'Automated analysis',
      };
    } catch (error) {
      console.warn('⚠️ Parse error, using freeform');
      return {
        type: 'freeform',
        requiresRoll: false,
        reasoning: 'Parse error',
      };
    }
  }

  /**
   * STEP 2: Roll d20 + ability modifiers
   */
  private static rollDice(character: Character, intent: ActionIntent): DiceResult {
    const roll = Math.floor(Math.random() * 20) + 1;

    let abilityMod = 0;
    let profBonus = 0;

    if (intent.skill) {
      abilityMod = this.getSkillModifier(character, intent.skill);
    } else if (intent.type === 'combat') {
      const dexMod = Math.floor((character.abilities.DEX - 10) / 2);
      const strMod = Math.floor((character.abilities.STR - 10) / 2);
      abilityMod = Math.max(dexMod, strMod);
      profBonus = this.getProficiencyBonus(character.level || 1);
    }

    const modifier = abilityMod + profBonus;
    const total = roll + modifier;
    const difficulty = intent.difficulty || 10;
    const success = total >= difficulty;

    return {
      roll,
      abilityMod,
      profBonus,
      modifier,
      total,
      success,
      margin: total - difficulty,
      criticalHit: roll === 20,
      criticalMiss: roll === 1,
    };
  }

  /**
   * STEP 3: Analyze how personality influences NPC reactions
   */
  private static analyzePersonalityInfluence(
    character: Character,
    intent: ActionIntent,
    diceResult?: DiceResult
  ): string {
    if (intent.type !== 'dialogue') {
      return 'No NPC interaction';
    }

    const personality = character.personality?.traits || 'neutral';
    const ideals = character.personality?.ideals || 'survival';
    const charisma = Math.floor((character.abilities.CHA - 10) / 2);

    // Personality affects persuasion effectiveness
    if (personality.toLowerCase().includes('charm')) {
      return 'Charming personality: NPCs are more receptive (CHA bonus applies)';
    }
    if (personality.toLowerCase().includes('intimidat')) {
      return 'Intimidating demeanor: NPCs respect strength (STR can apply)';
    }
    if (personality.toLowerCase().includes('deceptive')) {
      return 'Deceptive nature: NPCs may be fooled but trust is hard to earn';
    }

    // Ideals affect NPC responses
    if (ideals.toLowerCase().includes('justice')) {
      return 'Idealistic about justice: Lawful NPCs are more helpful';
    }
    if (ideals.toLowerCase().includes('freedom')) {
      return 'Values freedom: Chaotic NPCs respect this character';
    }

    return `CHA modifier ${charisma >= 0 ? '+' : ''}${charisma} affects persuasion`;
  }

  /**
   * STEP 4: Generate narrative with ability modifiers noted
   */
  private static async generateNarrative(
    action: string,
    character: Character,
    world: World,
    context: GameContext,
    intent: ActionIntent,
    diceResult: DiceResult | undefined,
    personalityInfluence: string,
    language: 'ru' | 'en'
  ): Promise<string> {
    let enhancedAction = action;

    if (diceResult) {
      const abilityName = intent.ability ? CHARACTER_ABILITIES[intent.ability as keyof typeof CHARACTER_ABILITIES] : 'Check';
      
      if (diceResult.criticalHit) {
        enhancedAction += language === 'ru'
          ? `\n[✨ КРИТ УСПЕХ! Бросок: 20 (${abilityName} +${diceResult.abilityMod}) = ${diceResult.total}]`
          : `\n[✨ CRITICAL SUCCESS! Roll: 20 (${abilityName} +${diceResult.abilityMod}) = ${diceResult.total}]`;
      } else if (diceResult.criticalMiss) {
        enhancedAction += language === 'ru'
          ? `\n[💥 КРИТ ПРОВАЛ! Бросок: 1 (${abilityName} +${diceResult.abilityMod}) = ${diceResult.total}]`
          : `\n[💥 CRITICAL FAIL! Roll: 1 (${abilityName} +${diceResult.abilityMod}) = ${diceResult.total}]`;
      } else {
        const status = diceResult.success ? 'SUCCESS' : 'FAILURE';
        enhancedAction += language === 'ru'
          ? `\n[Бросок: d20[${diceResult.roll}] ${abilityName} +${diceResult.abilityMod} = ${diceResult.total} (${status})]`
          : `\n[Roll: d20[${diceResult.roll}] ${abilityName} +${diceResult.abilityMod} = ${diceResult.total} (${status})]`;
      }
    }

    // Add personality influence to context
    enhancedAction += `\n[Personality influence: ${personalityInfluence}]`;

    return await AIService.generateActionResponse(
      enhancedAction,
      character,
      world,
      context,
      language
    );
  }

  /**
   * STEP 5: Evolve relationships based on success and personality
   */
  private static evolveRelationships(
    character: Character,
    context: GameContext,
    success: boolean,
    personality: string
  ): boolean {
    // Initialize NPC relations if needed
    if (!character.npcRelations) {
      character.npcRelations = {};
    }

    // Simulate relationship changes
    const pointsChange = success
      ? (personality.includes('kind') ? 5 : 3)
      : (personality.includes('deceptive') ? -5 : -2);

    // This would integrate with actual NPC tracking in a full system
    console.log(`📊 Relationship change: ${pointsChange > 0 ? '+' : ''}${pointsChange} points`);
    
    return true; // Relationship changed
  }
}

export default ActionOrchestrator;
