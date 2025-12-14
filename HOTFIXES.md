# 🔧 HOTFIXES v0.0.1 → v0.0.2

## ✅ BACKEND FIXES (3 проблемы)

### 1️⃣ АНГЛИЙСКИЕ СЛОВА В РУССКОЙ ВЕРСИИ

**Проблема:** Расы, умения и действия иногда остаются на английском ("Damphir", "Necromancer" skill)

**Корень:** 
- `nextActions` генерируются AI без явного форматирования языка
- LocalizationService есть, но используется не везде
- ActionOrchestrator не применяет локализацию к выводам

**РЕШЕНИЕ:**

```typescript
// backend/src/services/ActionOrchestrator.ts - ДОБАВИТЬ

private sanitizeForLanguage(text: string, language: string): string {
  // Гарантирует что весь текст на нужном языке
  const translations: {[key: string]: {[key: string]: string}} = {
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
      // Расы
      'Elf': 'Эльф',
      'Human': 'Человек',
      'Dwarf': 'Гном',
      'Halfling': 'Полурослик',
      'Dragonborn': 'Драконорожденный',
      'Half-Elf': 'Полуэльф',
      'Half-Orc': 'Полуорк',
      'Tiefling': 'Тифлинг',
      // Умения
      'Acrobatics': 'Акробатика',
      'Animal Handling': 'Работа с животными',
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
      'Survival': 'Выживание'
    },
    en: {} // English - нет замен
  };

  let result = text;
  const langMap = translations[language] || {};

  Object.entries(langMap).forEach(([en, translated]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, translated);
  });

  return result;
}

// В методе processAction():
const sanitizedActions = gameData.nextActions.map(action => 
  this.sanitizeForLanguage(action, language)
);
```

**Тест:**
```bash
# Попробуй создать персонажа-Дампира и проверить
# Должно быть "Дампир", а не "Damphir"
```

---

### 2️⃣ КНОПКИ БЕЗ ПРОБЕЛОВ

**Проблема:** "войтиВТаверну" вместо "войти В таверну"

**Корень:**
- AI генерирует действия слитно без пробелов
- Нет валидации/санитизации формата

**РЕШЕНИЕ:**

```typescript
// backend/src/services/ActionOrchestrator.ts - ДОБАВИТЬ

private formatActionText(action: string): string {
  // Формирует действие с правильными пробелами

  // 1. Убираем двойные пробелы
  let formatted = action.replace(/\s+/g, ' ').trim();

  // 2. Проверяем что есть пробелы между словами
  // AI часто объединяет: "войтиВТаверну"
  if (formatted.length > 0 && !formatted.includes(' ')) {
    // Если одно слово - ОК
    return formatted;
  }

  // 3. Убеждаемся что есть пробел после первого слова
  const words = formatted.split(/\s+/);
  if (words.length > 1) {
    // Правильное форматирование уже есть
    return formatted;
  }

  // 4. Если слова слиплись (camelCase), разделяем
  // "войтиВТаверну" -> "войти в таверну"
  const camelCaseSplit = formatted
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();

  return camelCaseSplit;
}

// В методе processAction():
const formattedActions = gameData.nextActions.map(action => 
  this.formatActionText(action)
);
```

**Тест:**
```bash
# После действия проверь кнопки - должны быть пробелы
# "войти В таверну", "осмотреться Вокруг"
```

**ДОПОЛНИТЕЛЬНО - Улучши промпт PromptService:**

```typescript
// backend/src/services/PromptService.ts

// В методе generateActionOrchestrationPrompt() добавь:

""""IMPORTANT: Format nextActions correctly
- Each action MUST start with a lowercase verb
- Use SPACES between all words
- Examples: "войти в таверну", "осмотреться вокруг", "подойти к кому-то"
- DO NOT use camelCase or combined words like "войтиВТаверну"
- Each action should be 2-5 words maximum"""
```

---

### 3️⃣ БОКОВАЯ МЕНЮШКА СЪЕЗЖАЕТ ПРИ СКРОЛЛЕ

**Проблема:** При скролле вниз Character Info и Session Info исчезают/смещаются

**РЕШЕНИЕ (FRONTEND):**

```tsx
// frontend/app/game/page.tsx

// В правой колонке найди блок Character Info и Session:

// ❌ БЫЛО:
<div className="space-y-4">
  <div className="card bg-gradient-to-br...">
    {/* Character info */}
  </div>
  <div className="card bg-gradient-to-br...">
    {/* Session info */}
  </div>
</div>

// ✅ ИСПРАВЬ НА:
<div className="space-y-4 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
  <div className="card bg-gradient-to-br...">
    {/* Character info */}
  </div>
  <div className="card bg-gradient-to-br...">
    {/* Session info */}
  </div>
</div>
```

**Объяснение CSS:**
- `sticky` - привязываем к верхней части
- `top-4` - отступ сверху 16px
- `h-fit max-h-[calc(100vh-2rem)]` - занимает макс доступное место
- `overflow-y-auto` - если много текста, скролл внутри блока

**Результат:**
- ✅ Боковая панель остается видна при скролле
- ✅ При скролле вниз панель не исчезает
- ✅ Если контент боковой панели больше, скролл внутри неё

---

## 📊 ИТОГОВЫЙ ЧЕКЛИСТ

### BACKEND (backend/src/services/)

- [ ] **ActionOrchestrator.ts** - Добавить методы:
  - `sanitizeForLanguage(text, language)` - переводит английское на нужный язык
  - `formatActionText(action)` - добавляет пробелы между словами
  - Применить оба метода в `processAction()`

- [ ] **PromptService.ts** - Обновить промпт:
  - Добавить требование о ПРАВИЛЬНЫХ ПРОБЕЛАХ
  - Добавить примеры формата действий

- [ ] **Тесты:**
  - Создать персонажа-Дампира - должен видеть "Дампир", не "Damphir"
  - После действия - все кнопки должны иметь пробелы
  - Проверить на русском и английском языках

### FRONTEND (frontend/app/game/page.tsx)

- [ ] **Sticky боковая панель:**
  - Найти контейнер с Character Info и Session Info
  - Добавить класс `sticky top-4 h-fit`
  - Добавить `max-h-[calc(100vh-2rem)] overflow-y-auto`
  - Протестировать скролл

---

## 🚀 ПОРЯДОК ВНЕСЕНИЯ

### Шаг 1: BACKEND (более критично, влияет на весь фронт)

```bash
# Отредактируй backend/src/services/ActionOrchestrator.ts
# Добавь две функции и примени их в processAction()

# Отредактируй backend/src/services/PromptService.ts  
# Улучши промпт для правильного форматирования

npm run dev  # Перезагрузится автоматически
```

### Шаг 2: FRONTEND (косметика, но заметная)

```bash
# Отредактируй frontend/app/game/page.tsx
# Найди правую боковую панель, добавь sticky

npm run dev  # Перезагрузится
```

### Шаг 3: ТЕСТИРОВАНИЕ

```bash
# 1. Создай персонажа-Дампира
# 2. Выполни 2-3 действия
# 3. Проверь:
#    ✅ "Дампир", не "Damphir"
#    ✅ Кнопки с пробелами: "войти в таверну"
#    ✅ Боковая панель не съезжает при скролле
#    ✅ Session ID видна
#    ✅ HP, AC обновляются
```

---

## 📝 ТРИ КОММИТА

```
Commit 1: backend - ActionOrchestrator: Add localization & formatting
  - sanitizeForLanguage() метод
  - formatActionText() метод  
  - Apply в processAction()

Commit 2: backend - PromptService: Improve action formatting requirements
  - Better prompt for proper spacing
  - Examples in Russian

Commit 3: frontend - Fix sticky sidebar for Character & Session info
  - Position: sticky
  - Proper overflow handling
```

---

**Status:** 🟢 READY FOR IMPLEMENTATION  
**Estimated Time:** 30-45 min total  
**Difficulty:** ⭐⭐ (Easy-Medium)  
**Impact:** High - Fixes all 3 reported issues
