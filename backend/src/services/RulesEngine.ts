import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CustomContent, MergedRules, Character, Spell } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Core D&D 5e Rules Engine
 * Loads official rules from dnd-5e-rules.json and merges with custom content
 */
export class RulesEngine {
  private coreRules: any;
  private customContent: CustomContent;
  private mergedRules: MergedRules;

  constructor(customContent: CustomContent = {}) {
    this.customContent = customContent;
    this.coreRules = {
      races: {},
      classes: {},
      feats: {},
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
    this.mergedRules = { races: {}, classes: {}, feats: {}, spells: {}, monsters: {}, skills: {}, conditions: {}, mechanics: {}, equipment: {} };
  }

  /**
   * Load official rules from dnd-5e-rules.json
   * Tries multiple paths to handle both development and production
   */
  async loadCoreRules(): Promise<void> {
    try {
      // Try multiple paths to find the JSON file
      const possiblePaths = [
        // During development: backend/src/data/dnd-5e-rules.json (compiled to dist/data)
        path.join(__dirname, '..', 'data', 'dnd-5e-rules.json'),
        // From dist (after build): dist/services/../data/dnd-5e-rules.json
        path.join(__dirname, '..', '..', 'data', 'dnd-5e-rules.json'),
        // Fallback: from root
        path.join(process.cwd(), 'backend', 'src', 'data', 'dnd-5e-rules.json'),
        path.join(process.cwd(), 'src', 'data', 'dnd-5e-rules.json'),
      ];

      let data = null;
      let filePath = '';

      for (const tryPath of possiblePaths) {
        try {
          console.log(`🔍 Trying to load from: ${tryPath}`);
          const raw = await fs.readFile(tryPath, 'utf-8');
          data = JSON.parse(raw);
          filePath = tryPath;
          console.log(`✅ Successfully loaded rules from: ${filePath}`);
          break;
        } catch (e) {
          // Try next path
          continue;
        }
      }

      if (!data) {
        throw new Error(`Could not find dnd-5e-rules.json in any of: ${possiblePaths.join(', ')}`);
      }

      // Load races from JSON
      if (data.races) {
        this.coreRules.races = data.races;
      }

      // Load classes from JSON
      if (data.classes) {
        this.coreRules.classes = data.classes;
      }

      // Load feats (if available)
      if (data.feats) {
        this.coreRules.feats = data.feats;
      }

      // Load spells sample
      if (data.spells_sample) {
        this.coreRules.spells = data.spells_sample;
      }

      // Load monsters sample
      if (data.monsters_sample) {
        this.coreRules.monsters = data.monsters_sample;
      }

      // Load skills
      if (data.skills) {
        this.coreRules.skills = data.skills;
      }

      // Load conditions
      if (data.conditions) {
        this.coreRules.conditions = data.conditions;
      }

      console.log(`✅ Core rules loaded: ${Object.keys(this.coreRules.races).length} races, ${Object.keys(this.coreRules.classes).length} classes`);
      this.mergeRules();
    } catch (error) {
      console.error('⚠️ Error loading core rules from JSON:', error);
      // Fallback to empty but valid structure
      console.log('ℹ️ Using fallback empty rules structure');
      this.mergeRules();
    }
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

  getAllRaces(): any[] {
    return Object.values(this.mergedRules.races);
  }

  getAllClasses(): any[] {
    return Object.values(this.mergedRules.classes);
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
