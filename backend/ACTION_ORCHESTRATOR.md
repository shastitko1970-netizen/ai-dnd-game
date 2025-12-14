# 🎲 ActionOrchestrator Guide

## Overview

**ActionOrchestrator** - это сердце игровой логики. Это умный оркестратор, который:

1. **Анализирует** намерение игрока через AI
2. **Определяет** нужна ли проверка (бросок кубика)
3. **Выполняет** бросок d20 с модификаторами
4. **Генерирует** нарратив с учётом результата
5. **Предлагает** следующие действия

---

## 📊 Three-Step Process

```
Player Action Input
      ↓
[STEP 1: analyzeIntent]
  AI определяет тип действия
  ├─ combat (атака, боевой манёвр)
  ├─ skill_check (проверка навыка)
  ├─ dialogue (диалог, переговоры)
  ├─ exploration (исследование окружения)
  └─ freeform (свободное действие)
      ↓
[STEP 2: rollDice] (если requiresRoll === true)
  Бросок d20 + модификатор
  ├─ roll (1-20)
  ├─ modifier (из навыков персонажа)
  ├─ total (roll + modifier)
  ├─ success (total >= DC)
  ├─ margin (total - DC)
  ├─ criticalHit (roll === 20)
  └─ criticalMiss (roll === 1)
      ↓
[STEP 3: generateNarrative]
  AI создаёт нарратив с контекстом броска
  ├─ Если успех → позитивный исход
  ├─ Если провал → негативный исход
  ├─ Если крит → драматический момент
  └─ Иначе → свободный нарратив
      ↓
Response with Narrative + Dice Results
```

---

## 🎯 ActionIntent Types

### 1. **Combat** ⚔️
```
Input: "Я атакую дракона мечом"
     ↓
ActionIntent {
  type: "combat",
  skill: undefined,
  difficulty: undefined (равна AC врага),
  requiresRoll: true
}
     ↓
DiceRoll {
  roll: 15,
  modifier: 5, // STR или DEX
  total: 20,
  success: true, // 20 >= AC18
  criticalHit: false
}
     ↓
Narrative: "Ваш меч пронзает чешую дракона..."
```

### 2. **Skill Check** 📋
```
Input: "Я пытаюсь залезть на обрывистый утёс"
     ↓
ActionIntent {
  type: "skill_check",
  skill: "Athletics",
  difficulty: 15, // DC 15
  requiresRoll: true
}
     ↓
DiceRoll {
  roll: 12,
  modifier: 2, // Athletics bonus
  total: 14,
  success: false, // 14 < 15
  margin: -1 // Не дотянули на 1
}
     ↓
Narrative: "Вы почти доехали, но камень обваливается..."
```

### 3. **Dialogue** 💬
```
Input: "Я спрашиваю торговца о боевых приключениях"
     ↓
ActionIntent {
  type: "dialogue",
  skill: "Persuasion",
  requiresRoll: false // Диалог не требует броска
}
     ↓
No DiceRoll
     ↓
Narrative: "Торговец улыбается и начинает рассказ..."
```

### 4. **Exploration** 🔍
```
Input: "Я осматриваю комнату в поиске ловушек"
     ↓
ActionIntent {
  type: "exploration",
  skill: "Perception",
  difficulty: 12,
  requiresRoll: true
}
     ↓
DiceRoll {
  roll: 18,
  modifier: 3,
  total: 21,
  success: true,
  margin: 9 // Успех с большим преимуществом
}
     ↓
Narrative: "Вы замечаете тонкую леску между плитами..."
```

### 5. **Freeform** 🎭
```
Input: "Я танцую у костра под луной"
     ↓
ActionIntent {
  type: "freeform",
  requiresRoll: false // Чистое описание
}
     ↓
No DiceRoll
     ↓
Narrative: "Пламя танцует в ритме ваших движений..."
```

---

## 🎲 Dice System

### D20 Roll
```typescript
roll = Math.floor(Math.random() * 20) + 1; // 1-20
```

### Modifiers
- **Combat**: STR или DEX (максимум)
- **Skill**: Character.skills[skillName].bonus
- **Strength/Dexterity Mod**: (ability - 10) / 2, rounded down

### Success Calculation
```
total >= difficulty → success
margin = total - difficulty

margin >= 0 → SUCCESS
margin < 0 → FAILURE
```

### Critical Results
```
roll === 20 → CRITICAL HIT (автоматический успех, эффект усилен)
roll === 1  → CRITICAL MISS (автоматический провал, плохие последствия)
```

---

## 💻 API Response

### POST /api/game/action

**Request:**
```json
{
  "sessionId": "session-1765721762432-0i5uoasi5",
  "action": "Я атакую дракона мечом",
  "language": "ru"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1765721762432-0i5uoasi5",
    "narrative": "Ваш меч пронзает чешую дракона с ужасающим звуком...",
    "diceRoll": {
      "roll": 15,
      "modifier": 5,
      "total": 20,
      "success": true,
      "criticalHit": false,
      "criticalMiss": false
    },
    "actionIntent": {
      "type": "combat",
      "skill": null,
      "difficulty": null,
      "requiresRoll": true
    },
    "nextActions": [
      "Огромный удар клинком",
      "Быстрый рывок в сторону",
      "Попробовать пробить слабое место",
      "Отойти и переоценить ситуацию"
    ],
    "turn": 2,
    "timestamp": "2025-12-14T14:33:44.000Z"
  }
}
```

---

## 🧠 AI Analysis Prompt

ActionOrchestrator использует AI для анализа:

### Russian Prompt
```
Ты - анализатор действий игрока в D&D 5e.

Анализируй действие и верни ТОЛЬКО JSON:
{
  "type": "combat" | "skill_check" | "dialogue" | "exploration" | "freeform",
  "skill": null | "Athletics" | "Stealth" | "Perception" | "Persuasion" | ...,
  "difficulty": null | 10 | 12 | 15 | 18 | 20 | 25,
  "requiresRoll": true | false,
  "reasoning": "Краткое объяснение"
}

Персонаж: Парень (Варвар), Уровень: 1
Действие: "Я атакую дракона мечом"
```

### English Prompt
```
You are a D&D 5e action analyzer.

Analyze the action and return ONLY JSON:
{
  "type": "combat" | "skill_check" | "dialogue" | "exploration" | "freeform",
  "skill": null | "Athletics" | "Stealth" | "Perception" | "Persuasion" | ...,
  "difficulty": null | 10 | 15 | 20,
  "requiresRoll": true | false,
  "reasoning": "Brief explanation"
}

Character: Darius (Barbarian), Level: 1
Action: "I attack the dragon with my sword"
```

---

## 🔧 Implementation Details

### analyzeIntent()
```typescript
private static async analyzeIntent(
  action: string,
  character: Character,
  language: 'ru' | 'en'
): Promise<ActionIntent>
```

- Отправляет действие на анализ Claude
- Парсит JSON ответ
- Возвращает ActionIntent с типом, навыком, DC, нужен ли бросок

### rollDice()
```typescript
private static rollDice(
  character: Character,
  intent: ActionIntent
): DiceResult
```

- Выполняет бросок d20
- Берёт модификатор из навыков персонажа
- Рассчитывает успех/провал
- Определяет крит/фейл

### generateNarrative()
```typescript
private static async generateNarrative(
  action: string,
  character: Character,
  world: World,
  context: GameContext,
  intent: ActionIntent,
  diceResult?: DiceResult,
  language: 'ru' | 'en'
): Promise<string>
```

- Добавляет информацию о броске в контекст
- Отправляет улучшенный prompt на AI
- Возвращает нарратив с учётом результата

---

## ⚙️ Configuration

### Skill Difficulties (DC)
```
Easy (DC 10)      - Очень простая задача
Moderate (DC 15)  - Средняя сложность
Hard (DC 20)      - Сложная задача
VeryHard (DC 25)  - Очень сложная
```

### Ability Modifiers
```
Ability 3  → -4 modifier
Ability 4  → -3 modifier
Ability 5  → -2 modifier
Ability 6  → -1 modifier
Ability 7  → -2 modifier
Ability 8  → -1 modifier
Ability 9  → -1 modifier
Ability 10 → +0 modifier (neutral)
Ability 11 → +0 modifier (neutral)
Ability 12 → +1 modifier
Ability 13 → +1 modifier
Ability 14 → +2 modifier
Ability 15 → +2 modifier
Ability 16 → +3 modifier
Ability 17 → +3 modifier
Ability 18 → +4 modifier
Ability 19 → +4 modifier
Ability 20 → +5 modifier
```

---

## 🔮 Future Enhancements

- [ ] Advantage/Disadvantage system
- [ ] Skill proficiency tracking
- [ ] NPC reaction based on rolls
- [ ] Experience gain from successful checks
- [ ] Status effects (poisoned, frightened, etc.)
- [ ] Multi-step skill challenges
- [ ] Reaction economy for combat
- [ ] Opportunity attacks

---

**Last Updated**: December 14, 2025
**Status**: ✅ Production Ready
