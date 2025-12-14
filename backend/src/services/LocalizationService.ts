/**
 * Система локализации D&D содержимого
 * Переводит расы, классы, способности на русский
 */

interface TranslationMap {
  [key: string]: string;
}

const raceTranslations: TranslationMap = {
  // Core races (PHB)
  'Dwarf': 'Дворф',
  'Elf': 'Эльф',
  'Halfling': 'Полурослик',
  'Human': 'Человек',
  'Dragonborn': 'Драконорожденный',
  'Gnome': 'Гном',
  'Half-Elf': 'Полуэльф',
  'Half-Orc': 'Полуорк',
  'Tiefling': 'Тифлинг',
  
  // Xanathar's Guide
  'Aasimar': 'Ааз самар',
  'Goliath': 'Голиаф',
  'Kenku': 'Кенку',
  'Orc': 'Орк',
  'Tabaxi': 'Табакси',
  'Triton': 'Тритон',
  
  // Volo's Guide
  'Bugbear': 'Багбер',
  'Firbolg': 'Фирболг',
  'Goblin': 'Гоблин',
  'Hobgoblin': 'Хоббитлин',
  'Kobold': 'Кобольд',
  'Tortle': 'Тортл',
  'Yuan-ti Pureblood': 'Юань-ти чистокровный',
  
  // Tasha's Cauldron
  'Changeling': 'Оборотень',
  'Fairy': 'Фея',
  'Hexblood': 'Ведьмокровный',
  'Harengon': 'Харенгон',
  'Kalashtar': 'Калаштар',
  'Lineage': 'Наследие',
  'Rune Knight': 'Рыцарь Рун',
  
  // Mordenkainen's Tome
  'Air Genasi': 'Генази Воздуха',
  'Earth Genasi': 'Генази Земли',
  'Fire Genasi': 'Генази Огня',
  'Water Genasi': 'Генази Воды',
  'Autognome': 'Автогном',
  'Plasmoid': 'Плазмоид',
  'Giff': 'Гифф',
  
  // FR specific
  'Drow': 'Дроу',
  'Fey': 'Фейри',
  'Dragon': 'Дракон',
};

const classTranslations: TranslationMap = {
  // Core classes
  'Barbarian': 'Варвар',
  'Bard': 'Бард',
  'Cleric': 'Клирик',
  'Druid': 'Друид',
  'Fighter': 'Боец',
  'Monk': 'Монах',
  'Paladin': 'Паладин',
  'Ranger': 'Рейнджер',
  'Rogue': 'Плут',
  'Sorcerer': 'Чародей',
  'Warlock': 'Волшебник',
  'Wizard': 'Маг',
  
  // UA / Additional
  'Artificer': 'Мастеромех',
  'Blood Hunter': 'Охотник Крови',
  'Mystic': 'Мистик',
  'Revised Ranger': 'Пересмотренный Рейнджер',
};

const abilityTranslations: TranslationMap = {
  'STR': 'СИЛ',
  'DEX': 'ЛОВ',
  'CON': 'ВЫН',
  'INT': 'ИНТ',
  'WIS': 'МДР',
  'CHA': 'ХАР',
  'Strength': 'Сила',
  'Dexterity': 'Ловкость',
  'Constitution': 'Выносливость',
  'Intelligence': 'Интеллект',
  'Wisdom': 'Мудрость',
  'Charisma': 'Харизма',
};

const skillTranslations: TranslationMap = {
  'Acrobatics': 'Акробатика',
  'Animal Handling': 'Забота о животных',
  'Arcana': 'Магия',
  'Athletics': 'Атлетика',
  'Deception': 'Обман',
  'History': 'История',
  'Insight': 'Проницательность',
  'Intimidation': 'Запугивание',
  'Investigation': 'Расследование',
  'Medicine': 'Медицина',
  'Nature': 'Природа',
  'Perception': 'Восприятие',
  'Performance': 'Выступление',
  'Persuasion': 'Убеждение',
  'Religion': 'Религия',
  'Sleight of Hand': 'Ловкость рук',
  'Stealth': 'Скрытность',
  'Survival': 'Выживание',
};

export class LocalizationService {
  /**
   * Переводит название расы на русский
   */
  static translateRace(raceName: string): string {
    return raceTranslations[raceName] || raceName;
  }

  /**
   * Переводит название класса на русский
   */
  static translateClass(className: string): string {
    return classTranslations[className] || className;
  }

  /**
   * Переводит аббревиатуру способности или полное название
   */
  static translateAbility(ability: string): string {
    return abilityTranslations[ability] || ability;
  }

  /**
   * Переводит навык на русский
   */
  static translateSkill(skillName: string): string {
    return skillTranslations[skillName] || skillName;
  }

  /**
   * Переводит объект персонажа (для фронтенда)
   */
  static localizeCharacter(character: any): any {
    return {
      ...character,
      race: this.translateRace(character.race),
      class: this.translateClass(character.class),
    };
  }

  /**
   * Переводит массив рас
   */
  static localizeRaces(races: any[]): any[] {
    return races.map(race => ({
      ...race,
      name: this.translateRace(race.name || race),
    }));
  }

  /**
   * Переводит массив классов
   */
  static localizeClasses(classes: any[]): any[] {
    return classes.map(cls => ({
      ...cls,
      name: this.translateClass(cls.name || cls),
    }));
  }

  /**
   * Получить пару (оригинал => перевод) для всех рас
   */
  static getAllRaceTranslations(): TranslationMap {
    return raceTranslations;
  }

  /**
   * Получить пару (оригинал => перевод) для всех классов
   */
  static getAllClassTranslations(): TranslationMap {
    return classTranslations;
  }
}

export default LocalizationService;
