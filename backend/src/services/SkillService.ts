// SkillService.ts - D&D 5e Skill Management

import type { Character } from '../types/index.js';

export interface Skill {
  name: string;
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  bonus: number;
  isProficient: boolean;
}

export class SkillService {
  /**
   * All D&D 5e skills mapped to their base abilities
   */
  private static readonly SKILL_ABILITY_MAP: { [key: string]: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA' } = {
    'Acrobatics': 'DEX',
    'Animal Handling': 'WIS',
    'Arcana': 'INT',
    'Athletics': 'STR',
    'Deception': 'CHA',
    'History': 'INT',
    'Insight': 'WIS',
    'Intimidation': 'CHA',
    'Investigation': 'INT',
    'Medicine': 'WIS',
    'Nature': 'INT',
    'Perception': 'WIS',
    'Performance': 'CHA',
    'Persuasion': 'CHA',
    'Religion': 'INT',
    'Sleight of Hand': 'DEX',
    'Stealth': 'DEX',
    'Survival': 'WIS',
  };

  /**
   * Get proficiency bonus based on character level
   */
  static getProficiencyBonus(level: number): number {
    if (level < 5) return 2;
    if (level < 9) return 2;
    if (level < 13) return 3;
    if (level < 17) return 3;
    return 4;
  }

  /**
   * Calculate ability modifier from ability score
   */
  private static getAbilityModifier(abilityScore: number): number {
    return Math.floor((abilityScore - 10) / 2);
  }

  /**
   * Get all available skills
   */
  static getAllSkills(): { [key: string]: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA' } {
    return { ...this.SKILL_ABILITY_MAP };
  }

  /**
   * Calculate total skill bonus for a character
   */
  static calculateSkillBonus(
    skillName: string,
    character: Character
  ): { bonus: number; abilityMod: number; profBonus: number } {
    const ability = this.SKILL_ABILITY_MAP[skillName];
    
    if (!ability) {
      console.warn(`Unknown skill: ${skillName}`);
      return { bonus: 0, abilityMod: 0, profBonus: 0 };
    }

    // Get ability modifier
    const abilityScore = character.abilities[ability] || 10;
    const abilityMod = this.getAbilityModifier(abilityScore);

    // Check proficiency
    const isProficient = character.skills?.[skillName]?.isProficient || false;
    const profBonus = isProficient ? this.getProficiencyBonus(character.level || 1) : 0;

    return {
      bonus: abilityMod + profBonus,
      abilityMod,
      profBonus,
    };
  }

  /**
   * Initialize all skills for a character based on class
   */
  static initializeSkillsForClass(
    characterClass: string,
    abilities: { STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number },
    level: number = 1
  ): { [key: string]: { bonus: number; isProficient: boolean } } {
    const skills: { [key: string]: { bonus: number; isProficient: boolean } } = {};

    // Default proficiencies by class
    const classProficiencies: { [key: string]: string[] } = {
      'Barbarian': ['Athletics', 'Intimidation'],
      'Bard': ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'],
      'Cleric': ['Insight', 'Medicine', 'Persuasion', 'Religion'],
      'Druid': ['Animal Handling', 'Arcana', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
      'Fighter': ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
      'Monk': ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
      'Paladin': ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
      'Ranger': ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
      'Rogue': ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
      'Sorcerer': ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Perception', 'Persuasion'],
      'Warlock': ['Arcana', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
      'Wizard': ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    };

    const proficiencies = classProficiencies[characterClass] || [];
    const profBonus = this.getProficiencyBonus(level);

    // Initialize all skills
    Object.entries(this.SKILL_ABILITY_MAP).forEach(([skillName, ability]) => {
      const abilityScore = abilities[ability] || 10;
      const abilityMod = this.getAbilityModifier(abilityScore);
      const isProficient = proficiencies.includes(skillName);
      const bonus = abilityMod + (isProficient ? profBonus : 0);

      skills[skillName] = {
        bonus,
        isProficient,
      };
    });

    return skills;
  }

  /**
   * Get class skill proficiencies
   */
  static getClassProficiencies(characterClass: string): string[] {
    const classProficiencies: { [key: string]: string[] } = {
      'Barbarian': ['Athletics', 'Intimidation'],
      'Bard': ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'],
      'Cleric': ['Insight', 'Medicine', 'Persuasion', 'Religion'],
      'Druid': ['Animal Handling', 'Arcana', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
      'Fighter': ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
      'Monk': ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
      'Paladin': ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
      'Ranger': ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
      'Rogue': ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
      'Sorcerer': ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Perception', 'Persuasion'],
      'Warlock': ['Arcana', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
      'Wizard': ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    };

    return classProficiencies[characterClass] || [];
  }

  /**
   * Get recommended skills to take proficiency in (character creation)
   */
  static getRecommendedSkills(characterClass: string, count: number = 2): string[] {
    const allProficiencies = this.getClassProficiencies(characterClass);
    return allProficiencies.slice(0, count);
  }

  /**
   * Apply proficiency bonus when leveling up
   */
  static updateSkillsOnLevelUp(
    skills: { [key: string]: { bonus: number; isProficient: boolean } },
    previousLevel: number,
    newLevel: number
  ): { [key: string]: { bonus: number; isProficient: boolean } } {
    const previousBonus = this.getProficiencyBonus(previousLevel);
    const newBonus = this.getProficiencyBonus(newLevel);
    const bonusDifference = newBonus - previousBonus;

    if (bonusDifference === 0) return skills; // No change

    const updatedSkills = { ...skills };
    Object.entries(updatedSkills).forEach(([skillName, skillData]) => {
      if (skillData.isProficient) {
        updatedSkills[skillName] = {
          ...skillData,
          bonus: skillData.bonus + bonusDifference,
        };
      }
    });

    return updatedSkills;
  }

  /**
   * Format skill bonus for display (e.g., "+5", "-2")
   */
  static formatBonus(bonus: number): string {
    if (bonus > 0) return `+${bonus}`;
    if (bonus < 0) return `${bonus}`;
    return '+0';
  }

  /**
   * Get DC (Difficulty Class) recommendation based on skill difficulty
   */
  static recommendDC(difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'very hard' | 'nearly impossible'): number {
    const dcMap = {
      'trivial': 5,
      'easy': 10,
      'medium': 15,
      'hard': 20,
      'very hard': 25,
      'nearly impossible': 30,
    };
    return dcMap[difficulty];
  }
}

export default SkillService;
