import { Character } from '../types/index.js';
import { RulesEngine } from './RulesEngine.js';
import { LocalizationService } from './LocalizationService.js';

export class CharacterService {
  private rulesEngine: RulesEngine;

  constructor(rulesEngine: RulesEngine) {
    this.rulesEngine = rulesEngine;
  }

  /**
   * Попытка найти оригинальное название расы (обратный маппинг)
   */
  private findOriginalRaceName(raceName: string, mergedRules: any): string {
    // Сначала пробуем найти как есть (на случай английского или кастомного)
    if (mergedRules.races[raceName]) {
      return raceName;
    }
    
    // Если не нашли, пробуем обратный перевод
    const translations = LocalizationService.getAllRaceTranslations();
    
    // Ищем по значениям (русским)
    for (const [english, russian] of Object.entries(translations)) {
      if (russian === raceName) {
        return english;
      }
    }
    
    // Не нашли - возвращаем как есть
    return raceName;
  }

  /**
   * Попытка найти оригинальное название класса (обратный маппинг)
   */
  private findOriginalClassName(className: string, mergedRules: any): string {
    // Сначала пробуем найти как есть
    if (mergedRules.classes[className]) {
      return className;
    }
    
    // Обратный перевод
    const translations = LocalizationService.getAllClassTranslations();
    
    for (const [english, russian] of Object.entries(translations)) {
      if (russian === className) {
        return english;
      }
    }
    
    return className;
  }

  createCharacter(data: any, mergedRules: any): Character {
    // Преобразовываем русские названия в английские
    const originalRaceName = this.findOriginalRaceName(data.race, mergedRules);
    const originalClassName = this.findOriginalClassName(data.class, mergedRules);
    
    // Validate race and class exist
    const race = mergedRules.races[originalRaceName];
    const clazz = mergedRules.classes[originalClassName];

    if (!race) {
      console.error('❌ Available races:', Object.keys(mergedRules.races));
      throw new Error(`Race '${data.race}' (tried: '${originalRaceName}') not found in available races`);
    }
    if (!clazz) {
      console.error('❌ Available classes:', Object.keys(mergedRules.classes));
      throw new Error(`Class '${data.class}' (tried: '${originalClassName}') not found in available classes`);
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
    // Используем оригинальные названия для совместимости с рулами
    const character: Character = {
      id: `char-${Date.now()}`,
      name: data.name.trim(),
      level: 1,
      race: originalRaceName,
      class: originalClassName,
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
