# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Health Check

### Check if server is running

```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-13T17:00:00.000Z"
}
```

---

## Rules Endpoints

### Get Core Rules (Official)

```bash
GET /api/rules/core
```

**Response:**
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

### Get Merged Rules (Core + Custom)

```bash
GET /api/rules/merged
```

**Response:**
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

### Get Specific Race

```bash
GET /api/rules/race/:name
```

**Example:**
```bash
curl http://localhost:3001/api/rules/race/Human
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Human",
    "size": "Medium",
    "speed": 30,
    "abilityBonus": { "STR": 0, ... },
    "features": [...]
  }
}
```

---

## Character Endpoints

### Create Character

```bash
POST /api/character/create
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Aragorn",
  "gender": "Male",
  "race": "Human",
  "class": "Fighter",
  "feats": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "char-1702442400000",
    "name": "Aragorn",
    "level": 1,
    "race": "Human",
    "class": "Fighter",
    "gender": "Male",
    "abilities": {
      "STR": 10,
      "DEX": 10,
      "CON": 10,
      "INT": 10,
      "WIS": 10,
      "CHA": 10
    },
    "hp": { "current": 10, "max": 10 },
    "ac": 10,
    "initiative": 0
  }
}
```

### Get Character

```bash
GET /api/character/:id
```

**Response:**
```json
{
  "success": true,
  "data": { /* character object */ }
}
```

---

## Custom Content Endpoints

### Custom Races

#### List Custom Races
```bash
GET /api/custom-races
```

#### Create Custom Race
```bash
POST /api/custom-races
Content-Type: application/json
```

**Request Body:**
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

**Validation Rules:**
- `name`: 2-50 characters, unique
- `speed`: 20-40 feet
- `abilityBonus` each: -2 to +2
- `abilityBonus` total: max +6
- `features`: 0-3 items

#### Update Custom Race
```bash
PUT /api/custom-races/:name
Content-Type: application/json
```

#### Delete Custom Race
```bash
DELETE /api/custom-races/:name
```

### Custom Classes

#### List
```bash
GET /api/custom-classes
```

#### Create
```bash
POST /api/custom-classes
```

**Request Body:**
```json
{
  "name": "Spellblade",
  "description": "A warrior who weaves magic",
  "hitDice": 8,
  "primaryAbility": "INT",
  "customFeatures": []
}
```

#### Update
```bash
PUT /api/custom-classes/:name
```

#### Delete
```bash
DELETE /api/custom-classes/:name
```

### Custom Feats

#### List
```bash
GET /api/custom-feats
```

#### Create
```bash
POST /api/custom-feats
```

**Request Body:**
```json
{
  "name": "Arcane Resilience",
  "description": "You gain +1 to saving throws against magic",
  "prerequisite": "INT 13 or higher"
}
```

#### Update
```bash
PUT /api/custom-feats/:name
```

#### Delete
```bash
DELETE /api/custom-feats/:name
```

---

## Game Endpoints

### Start Game Session

```bash
POST /api/game/start
Content-Type: application/json
```

**Request Body:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1702442400000",
    "session": { /* session object */ }
  }
}
```

### Player Action

```bash
POST /api/game/action
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "session-1702442400000",
  "action": {
    "type": "attack",
    "weapon": "sword",
    "target": "goblin",
    "timestamp": "2025-12-13T17:00:00Z"
  }
}
```

**Action Types:**
- `attack` - Attack an enemy
- `spell` - Cast a spell
- `dodge` - Take defensive stance
- `disengage` - Leave combat
- `hide` - Hide from enemies
- `help` - Help an ally

**Response:**
```json
{
  "success": true,
  "data": {
    "actionResult": {
      "success": true,
      "text": "You attack with your sword!",
      "damage": 8
    },
    "narrative": "The goblin staggers back...",
    "session": { /* updated session */ }
  }
}
```

### Get Session

```bash
GET /api/game/session/:sessionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": { /* session object */ }
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Race name must be 2-50 characters"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Session not found"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Testing with cURL

### Health Check
```bash
curl http://localhost:3001/health
```

### Get Merged Rules
```bash
curl http://localhost:3001/api/rules/merged | jq
```

### Create Custom Race
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

**All endpoints require JSON Content-Type header for POST/PUT requests**

For more examples, see `QUICKSTART.md`
