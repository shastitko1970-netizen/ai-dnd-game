import { CustomContent, MergedRules, Character, Spell } from '../types/index.js';

/**
 * Core D&D 5e Rules Engine
 * Merges core rules with custom content and provides game mechanics
 */
export class RulesEngine {
  private coreRules: any;
  private customContent: CustomContent;
  private mergedRules: MergedRules;

  constructor(customContent: CustomContent = {}) {
    // Initialize with default core rules structure
    this.coreRules = {
      races: {
        'Human': { name: 'Human', size: 'Medium', speed: 30, abilityBonus: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 }, features: ['Versatile'] },
        'Elf': { name: 'Elf', size: 'Medium', speed: 30, abilityBonus: { DEX: 2 }, features: ['Darkvision', 'Keen Senses'] },
        'Dwarf': { name: 'Dwarf', size: 'Medium', speed: 25, abilityBonus: { CON: 2, WIS: 0 }, features: ['Darkvision', 'Stone Cunning'] },
        'Halfling': { name: 'Halfling', size: 'Small', speed: 25, abilityBonus: { DEX: 2 }, features: ['Lucky', 'Brave'] }
      },
      classes: {
        'Barbarian': { name: 'Barbarian', hitDice: 12, primaryAbility: 'STR', features: ['Rage', 'Unarmored Defense'] },
        'Bard': { name: 'Bard', hitDice: 8, primaryAbility: 'CHA', features: ['Spellcasting', 'Bardic Inspiration'] },
        'Cleric': { name: 'Cleric', hitDice: 8, primaryAbility: 'WIS', features: ['Spellcasting', 'Channel Divinity'] },
        'Fighter': { name: 'Fighter', hitDice: 10, primaryAbility: 'STR', features: ['Fighting Style', 'Second Wind'] },
        'Rogue': { name: 'Rogue', hitDice: 8, primaryAbility: 'DEX', features: ['Expertise', 'Sneak Attack'] },
        'Wizard': { name: 'Wizard', hitDice: 6, primaryAbility: 'INT', features: ['Spellcasting', 'Spellbook'] }
      },
      feats: {
        'Alert': { name: 'Alert', description: 'Always in initiative as if in combat' },
        'Athlete': { name: 'Athlete', description: 'Improved athleticism' },
        'Great Weapon Master': { name: 'Great Weapon Master', description: '+5 bonus to attack rolls' }
      },
      spells: {},
      monsters: {},
      skills: {},
      conditions: {},
      mechanics: {},
      equipment: {
        armor: {
          light: [{ name: 'Leather', ac: 11, type: 'light' }],
          medium: [{ name: 'Chain Mail', ac: 16, type: 'medium' }],
          heavy: [{ name: 'Plate', ac: 18, type: 'heavy' }]
        }
      }
    };
    this.customContent = customContent;
    this.mergeRules();
  }

  /**
   * Merge core rules with custom content
   */
  private mergeRules(): void {
    this.mergedRules = {
      races: {
        ...this.coreRules.races,
        ...(this.customContent.races || {})
      },
      classes: {
        ...this.coreRules.classes,
        ...(this.customContent.classes || {})
      },
      feats: {
        ...this.coreRules.feats,
        ...(this.customContent.feats || {})
      },
      spells: this.coreRules.spells,
      monsters: this.coreRules.monsters,
      skills: this.coreRules.skills,
      conditions: this.coreRules.conditions,
      mechanics: this.coreRules.mechanics,
      equipment: this.coreRules.equipment
    };
  }

  getMergedRules(): MergedRules {
    return this.mergedRules;
  }

  getCoreRules(): any {
    return this.coreRules;
  }

  getRace(name: string): any {
    return this.mergedRules.races[name] || null;
  }

  getClass(name: string): any {
    return this.mergedRules.classes[name] || null;
  }

  getFeat(name: string): any {
    return this.mergedRules.feats[name] || null;
  }

  calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  calculateAC(character: Character): number {
    const baseAC = 10;
    const dexMod = this.calculateModifier(character.abilities.DEX);
    return baseAC + dexMod;
  }

  calculateHP(character: Character): number {
    const classData = this.getClass(character.class);
    if (!classData) return 8;
    const conMod = this.calculateModifier(character.abilities.CON);
    const hitDie = classData.hitDice || 8;
    let hp = hitDie + conMod;
    for (let i = 2; i <= character.level; i++) {
      hp += Math.max(1, Math.ceil(hitDie / 2) + conMod);
    }
    return Math.max(1, hp);
  }

  getSpell(name: string): Spell | null {
    // Simplified spell lookup
    return null;
  }

  rollAttack(attackBonus: number): { roll: number; total: number; isCrit: boolean; isMiss: boolean } {
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + attackBonus;
    return { roll, total, isCrit: roll === 20, isMiss: roll === 1 };
  }

  canCastSpell(character: Character, spellName: string): { can: boolean; reason?: string } {
    return { can: true };
  }
}

export default RulesEngine;
