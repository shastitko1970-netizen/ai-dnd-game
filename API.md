# ПОЛНАЯ НА НАДО API

## Базовый URL

```
http://localhost:3001/api
```

## Проверка здоровья

### Проверить если сервер работает

```bash
GET /health
```

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-14T05:45:00.000Z"
}
```

---

## Эндпоинты Правилы

### Получить Основные Правила (Официальные)

```bash
GET /api/rules/core
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "races": { ... },
    "classes": { ... },
    "feats": { ... }
  }
}
```

### Получить Мерженные Правила (Основные + Пользовательские)

```bash
GET /api/rules/merged
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "races": { "Human": {...}, "Custom Race": {...} },
    "classes": { ... },
    "feats": { ... }
  }
}
```

### Получить Конкретную Расу

```bash
GET /api/rules/race/:name
```

**Пример:**
```bash
curl http://localhost:3001/api/rules/race/Human
```

---

## Население Эндпоинты

### На Персонажа

```bash
POST /api/character/create
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "name": "Aragorn",
  "gender": "Male",
  "race": "Human",
  "class": "Fighter",
  "feats": []
}
```

### Получить Персонаж

```bash
GET /api/character/:id
```

---

## Пользовательского Контента Эндпоинты

### Собственные Расы

#### Срси
```bash
GET /api/custom-races
```

#### На расу
```bash
POST /api/custom-races
```

**Тело запроса:**
```json
{
  "name": "Shadow Elf",
  "description": "Elves touched by shadow magic",
  "size": "Medium",
  "speed": 30,
  "abilityBonus": {
    "STR": 0,
    "DEX": 2,
    "CON": 0,
    "INT": 1,
    "WIS": -1,
    "CHA": 0
  },
  "features": [
    "Darkvision 120 feet",
    "Shadow Resistance"
  ]
}
```

**На Пользователя Расы**
```bash
PUT /api/custom-races/:name
Content-Type: application/json
```

**Удалить Пользователя Расы**
```bash
DELETE /api/custom-races/:name
```

### Собственные Классы

#### Срси
```bash
GET /api/custom-classes
```

#### На Класс
```bash
POST /api/custom-classes
```

#### Обновить
```bash
PUT /api/custom-classes/:name
```

#### Удалить
```bash
DELETE /api/custom-classes/:name
```

---

## Игровые Эндпоинты

### На Новую Сессию

```bash
POST /api/game/start
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "character": { /* character object */ },
  "world": {
    "id": "1",
    "name": "Great Fantasy",
    "description": "A world of magic and wonder",
    "difficulty": "Medium",
    "playerCount": 5
  }
}
```

### Действие Организетора

```bash
POST /api/game/action
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "sessionId": "session-123",
  "action": {
    "type": "attack",
    "weapon": "sword",
    "target": "goblin",
    "timestamp": "2025-12-14T05:45:00Z"
  }
}
```

**Типы действий:**
- `attack` - Атаковать врага
- `spell` - Кастовать стрелу
- `dodge` - Оронительная стойка
- `disengage` - Отойдите из боя
- `hide` - Прячьтесь от врагов
- `help` - Оказать помощь

---

## Ответы На Ошибки

### 400 - Ошибка Результата
```json
{
  "success": false,
  "error": "Race name must be 2-50 characters"
}
```

### 404 - Не Найдено
```json
{
  "success": false,
  "error": "Session not found"
}
```

### 500 - Ошибка На Сервере
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Примеры тестирования

### Проверка Здоровья
```bash
curl http://localhost:3001/health
```

### Получить Мерженные Правила
```bash
curl http://localhost:3001/api/rules/merged | jq
```

### На Новую Расу
```bash
curl -X POST http://localhost:3001/api/custom-races \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Race",
    "description": "A test race",
    "size": "Medium",
    "speed": 30,
    "abilityBonus": {"DEX": 2},
    "features": []
  }' | jq
```

---

**Все POST/PUT эндпоинты требуют JSON Content-Type заголовка**

Для дополнительных примеров, см. `QUICKSTART.md`
