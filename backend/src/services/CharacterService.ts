import { Character } from '../types/index.js';
import { RulesEngine } from './RulesEngine.js';

export class CharacterService {
  private rulesEngine: RulesEngine;

  constructor(rulesEngine: RulesEngine) {
    this.rulesEngine = rulesEngine;
  }

  createCharacter(data: any, mergedRules: any): Character {
    // Validate race and class exist
    const race = mergedRules.races[data.race];
    const clazz = mergedRules.classes[data.class];

    if (!race) {
      throw new Error(`Race '${data.race}' not found in available races`);
    }
    if (!clazz) {
      throw new Error(`Class '${data.class}' not found in available classes`);
    }

    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Character name is required');
    }

    // Calculate ability scores with racial bonuses
    const abilities = {
      STR: 10 + (race.abilityBonus?.STR || 0),
      DEX: 10 + (race.abilityBonus?.DEX || 0),
      CON: 10 + (race.abilityBonus?.CON || 0),
      INT: 10 + (race.abilityBonus?.INT || 0),
      WIS: 10 + (race.abilityBonus?.WIS || 0),
      CHA: 10 + (race.abilityBonus?.CHA || 0)
    };

    // Handle 'all' ability bonus (e.g., Human)
    if (race.abilityBonus?.all) {
      Object.keys(abilities).forEach(key => {
        (abilities as any)[key] += race.abilityBonus.all;
      });
    }

    // Create character with base stats
    const character: Character = {
      id: `char-${Date.now()}`,
      name: data.name.trim(),
      level: 1,
      race: data.race,
      class: data.class,
      gender: data.gender || 'Other',
      abilities,
      skills: this.initializeSkills(),
      feats: data.feats || [],
      armor: 'Leather',
      hp: { current: 10, max: 10 },
      ac: 12,
      initiative: this.rulesEngine.calculateModifier(abilities.DEX)
    };

    // Calculate AC and HP based on rules
    character.ac = this.rulesEngine.calculateAC(character);
    character.hp.max = this.rulesEngine.calculateHP(character);
    character.hp.current = character.hp.max;

    return character;
  }

  private initializeSkills(): { [key: string]: { proficient: boolean; bonus: number } } {
    const skills: any = {};
    const skillList = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];

    for (const skill of skillList) {
      skills[skill] = { proficient: false, bonus: 0 };
    }

    return skills;
  }
}

export default CharacterService;
