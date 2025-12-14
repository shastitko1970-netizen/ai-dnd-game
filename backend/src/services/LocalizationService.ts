/**
 * Система локализации D&D содержимого
 * Переводит расы, классы, способности на русский
 * + Терминология игры (Бросок, Проверка, итого вместо total, etc)
 */

interface TranslationMap {
  [key: string]: string;
}

interface ActionDescriptions {
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
  'Aarakocra': 'Ааракокра',
  'Vampire': 'Вампир',
  'Werewolf': 'Оборотень',
};

// Common aliases for user input flexibility
const raceAliases: TranslationMap = {
  'Гномик': 'Gnome',
  'гномик': 'Gnome',
  'гном': 'Gnome',
  'Гном': 'Gnome',
  'Гне': 'Gnome',
  'Вампир': 'Vampire',
  'вампир': 'Vampire',
  'Оборотень': 'Werewolf',
  'оборотень': 'Werewolf',
  'Человечек': 'Halfling',
  'человечек': 'Halfling',
  'Полурослик': 'Halfling',
  'полурослик': 'Halfling',
  'Эльф': 'Elf',
  'эльф': 'Elf',
  'Эльф': 'Elf',
  'Орк': 'Orc',
  'орк': 'Orc',
  'Дворф': 'Dwarf',
  'дворф': 'Dwarf',
  'Гоблин': 'Goblin',
  'гоблин': 'Goblin',
  'Тифлинг': 'Tiefling',
  'тифлинг': 'Tiefling',
  'Драконорожденный': 'Dragonborn',
  'драконорожденный': 'Dragonborn',
  'Полуэльф': 'Half-Elf',
  'полуэльф': 'Half-Elf',
  'Полуорк': 'Half-Orc',
  'полуорк': 'Half-Orc',
  'Человек': 'Human',
  'человек': 'Human',
  'Убер': 'Orc',
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

// Common aliases for class input
const classAliases: TranslationMap = {
  'Варвар': 'Barbarian',
  'варвар': 'Barbarian',
  'Бард': 'Bard',
  'бард': 'Bard',
  'Клирик': 'Cleric',
  'клирик': 'Cleric',
  'Друид': 'Druid',
  'друид': 'Druid',
  'Боец': 'Fighter',
  'боец': 'Fighter',
  'Монах': 'Monk',
  'монах': 'Monk',
  'Паладин': 'Paladin',
  'паладин': 'Paladin',
  'Рейнджер': 'Ranger',
  'рейнджер': 'Ranger',
  'Плут': 'Rogue',
  'плут': 'Rogue',
  'Чародей': 'Sorcerer',
  'чародей': 'Sorcerer',
  'Волшебник': 'Warlock',
  'волшебник': 'Warlock',
  'Маг': 'Wizard',
  'маг': 'Wizard',
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

// НОВОЕ: Терминология D&D на русском
const gameTerms: TranslationMap = {
  'Roll': 'Бросок',
  'roll': 'бросок',
  'd20': 'к20',
  'Check': 'Проверка',
  'check': 'проверка',
  'Attack Roll': 'Бросок атаки',
  'Saving Throw': 'Спасбросок',
  'Skill Check': 'Проверка умения',
  'Hit': 'Попадание',
  'Miss': 'Промах',
  'Critical Hit': 'Крит',
  'Natural 20': 'Натуральная 20',
  'Natural 1': 'Натуральная 1',
  'Damage': 'Урон',
  'Healing': 'Исцеление',
  'modifier': 'модификатор',
  'mod': 'мод',
  'total': 'итого',
  'Success': 'Успех',
  'Failure': 'Неудача',
  'Advantage': 'Преимущество',
  'Disadvantage': 'Помеха',
  'Turn': 'Ход',
  'Round': 'Раунд',
  'Initiative': 'Инициатива',
  'Action': 'Действие',
  'Bonus Action': 'Бонусное действие',
  'Reaction': 'Реакция',
};

// НОВОЕ: Описания действий игрока (без личных местоимений)
const actionDescriptions: ActionDescriptions = {
  'осмотреть': 'внимательно осматриваешь окрестности',
  'проверить': 'тщательно проверяешь этот предмет',
  'подготовить': 'готовишь своё оружие и броню',
  'настроить': 'настраиваешь боевое снаряжение',
  'приблизиться': 'осторожно приближаешься ближе',
  'отступить': 'быстро отступаешь назад',
  'атаковать': 'переходишь в наступление',
  'защищаться': 'принимаешь боевую позицию',
  'спрятаться': 'ищешь место для укрытия',
  'выжидать': 'занимаешь удобную позицию и ждёшь',
  'прислушиваться': 'напрягаешь слух, пытаясь уловить звуки',
  'понюхать': 'вдыхаешь запахи воздуха',
  'почувствовать': 'обращаешь внимание на ощущения',
  'попробовать': 'тестируешь это на себе',
  'обойти': 'обходишь препятствие',
  'пролезть': 'сжимаешься и протискиваешься сквозь щель',
  'прыгнуть': 'набираешь разбег и совершаешь прыжок',
  'карабкаться': 'начинаешь карабкаться вверх',
  'говорить': 'обращаешься с речью',
  'крикнуть': 'кричишь изо всех сил',
  'помогать': 'приходишь на помощь',
  'помешать': 'стараешься помешать или остановить',
  'торговаться': 'вступаешь в переговоры о цене',
  'клясться': 'даёшь клятву или обещание',
};

// НОВОЕ: Исправление частых ошибок AI перевода
const translationFixes: TranslationMap = {
  'осколождение': 'ледяной щит',
  'осколож': 'лёд',
  'шелдаст': 'пыль развалин',
  'расщепление': 'расщепление',
};

// НОВОЕ: Исправления для неправильного перевода
const wrongToCorrect: TranslationMap = {
  'кидок': 'бросок',
  'кидать': 'бросать',
  'кинуть': 'бросить',
  'go': 'старт',
  'ok': 'хорошо',
  'hp': 'гп',
  'ac': 'ко',
  'damage': 'урон',
  'heal': 'исцелить',
  'roll': 'бросок',
};

export class LocalizationService {
  /**
   * Переводит название расы на русский
   */
  static translateRace(raceName: string): string {
    return raceTranslations[raceName] || raceName;
  }

  /**
   * Обратный перевод: русское имя расы → английское
   * Проверяет алиасы, потом обратный перевод
   */
  static reverseTranslateRace(raceName: string): string {
    // Сначала проверяем алиасы
    if (raceAliases[raceName]) {
      return raceAliases[raceName];
    }

    // Потом ищем в словаре переводов (обратная проверка)
    for (const [english, russian] of Object.entries(raceTranslations)) {
      if (russian === raceName || russian.toLowerCase() === raceName.toLowerCase()) {
        return english;
      }
    }

    // Если ничего не нашли, возвращаем как есть
    return raceName;
  }

  /**
   * Переводит название класса на русский
   */
  static translateClass(className: string): string {
    return classTranslations[className] || className;
  }

  /**
   * Обратный перевод: русское имя класса → английское
   */
  static reverseTranslateClass(className: string): string {
    // Сначала проверяем алиасы
    if (classAliases[className]) {
      return classAliases[className];
    }

    // Потом ищем в словаре переводов
    for (const [english, russian] of Object.entries(classTranslations)) {
      if (russian === className || russian.toLowerCase() === className.toLowerCase()) {
        return english;
      }
    }

    return className;
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
   * НОВОЕ: Переводит игровые термины
   */
  static translateTerm(term: string): string {
    return gameTerms[term] || term;
  }

  /**
   * НОВОЕ: Форматирует описание действия игрока
   * Вход: "осмотреть", "атаковать"
   * Выход: "ты внимательно осматриваешь окрестности"
   */
  static formatActionDescription(actionInput: string): string {
    const lower = actionInput.toLowerCase().trim();

    // Ищем в словаре
    for (const [verb, description] of Object.entries(actionDescriptions)) {
      if (lower.includes(verb)) {
        return `Ты ${description}`; // Формат: "Ты делаешь X"
      }
    }

    // Fallback: просто "ты делаешь X"
    return `Ты ${lower}`;
  }

  /**
   * НОВОЕ: Исправляет частые ошибки перевода AI
   */
  static fixMalformedTranslations(text: string): string {
    let result = text;

    // Исправляем известные ошибки
    for (const [wrong, correct] of Object.entries(translationFixes)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      result = result.replace(regex, correct);
    }

    return result;
  }

  /**
   * НОВОЕ: Исправляет англицизмы и неправильный перевод
   */
  static fixEnglicisms(text: string): string {
    let result = text;

    for (const [wrong, correct] of Object.entries(wrongToCorrect)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      result = result.replace(regex, correct);
    }

    return result;
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

  /**
   * НОВОЕ: Получить все описания действий
   */
  static getAllActionDescriptions(): ActionDescriptions {
    return actionDescriptions;
  }
}

export default LocalizationService;