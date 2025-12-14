# 🚀 Frontend-Backend Integration Guide

## Status: ✅ **FULLY INTEGRATED** (December 14, 2025)

---

## 🔧 What Was Fixed

### ❌ OLD Frontend Issues
```
1. ❌ NO sessionId tracking
   - Session lost between requests
   - 404 errors on /api/game/action

2. ❌ Client-side dice rolling
   - Duplicate logic
   - No backend validation
   - ActionOrchestrator ignored

3. ❌ Wrong API payloads
   - Sent: {action, narrative, character, world, previousActions}
   - Expected: {sessionId, action, language}

4. ❌ Wrong response parsing
   - Expected: data.data.response
   - Actually got: data.data.narrative

5. ❌ No language support
   - Hardcoded Russian UI
   - No language preference sent

6. ❌ Poor error handling
   - No user feedback
   - Silent failures
```

### ✅ NEW Frontend Implementation
```
1. ✅ SessionId Management
   - Stored immediately after game start
   - Transmitted with every action
   - Used for all API calls

2. ✅ Delegated Dice System
   - Backend handles all rolls
   - Frontend displays results
   - ActionOrchestrator analysis shown

3. ✅ Correct API Integration
   - POST /api/game/start: {character, world, language}
   - POST /api/game/action: {sessionId, action, language}
   - Both send language: 'ru'

4. ✅ Proper Response Handling
   - Expects: data.data.narrative
   - Displays: diceRoll, actionIntent, nextActions
   - Full TypeScript types

5. ✅ Bilingual Support
   - Language parameter sent
   - UI strings in Russian
   - Ready for i18n

6. ✅ Comprehensive Error Handling
   - User-friendly error messages
   - Console logging for debugging
   - Proper async/await patterns
```

---

## 🐫 Backend Requirements Met

### POST /api/game/start

**Frontend sends:**
```typescript
{
  character: Character,
  world: World,
  language: 'ru' | 'en'
}
```

**Backend responds:**
```typescript
{
  success: true,
  data: {
    sessionId: string,
    character: Character,
    world: World,
    narrative: string,
    language: string
  }
}
```

**Frontend handles:**
- ✅ Stores sessionId in state
- ✅ Displays initial narrative
- ✅ Shows character info
- ✅ Logs session start

---

### POST /api/game/action

**Frontend sends:**
```typescript
{
  sessionId: string,      // Required!
  action: string,         // Player action
  language: 'ru' | 'en'   // Language preference
}
```

**Backend responds:**
```typescript
{
  success: true,
  data: {
    sessionId: string,
    narrative: string,
    diceRoll: {
      roll: number,
      modifier: number,
      total: number,
      success: boolean,
      criticalHit: boolean,
      criticalMiss: boolean
    } | null,
    actionIntent: {
      type: 'combat' | 'skill_check' | 'dialogue' | 'exploration' | 'freeform',
      skill?: string,
      difficulty?: number,
      requiresRoll: boolean
    },
    nextActions: string[],
    turn: number
  }
}
```

**Frontend handles:**
- ✅ Updates narrative with action + result
- ✅ Displays dice roll if present (with modifier breakdown)
- ✅ Shows action intent analysis (type, skill, DC)
- ✅ Updates action buttons with backend suggestions
- ✅ Increments turn counter
- ✅ Clears user input
- ✅ Shows error on failure

---

## 🏗️ Frontend Architecture

### State Management
```typescript
// Session
sessionId: string        // 🆕 Sent with every action!
language: 'ru' | 'en'   // Language preference
turn: number            // Current turn counter

// Game State
character: Character    // Player character
world: World           // Game world
narrative: string      // Full game narrative

// UI State
isLoading: boolean                  // Request in progress
error: string | null               // Error messages
gameStarted: boolean              // Game initialized

// Last Action Info
lastDiceRoll: DiceRoll | null     // Last roll result
lastActionIntent: ActionIntent | null  // Last action type
currentActions: string[]          // Suggested next actions

// User Input
userInput: string                 // Custom action text
```

### API Flow

```
1. GAME INITIALIZATION
   startNewGame(character, world)
   ├─ POST /api/game/start {character, world, language: 'ru'}
   ├─ Response: {sessionId, narrative}
   ├─ Save sessionId to state!
   └─ Display narrative

2. PLAYER ACTION
   handleAction(action_string)
   ├─ POST /api/game/action {sessionId, action, language: 'ru'}
   ├─ Response: {narrative, diceRoll, actionIntent, nextActions}
   ├─ Update narrative
   ├─ Display dice roll (if exists)
   ├─ Show action intent analysis
   ├─ Update action buttons
   └─ Increment turn

3. ERROR HANDLING
   If request fails:
   ├─ Display error message
   ├─ Log to console
   └─ Keep game state intact
```

---

## 📋 TypeScript Interfaces

```typescript
// Dice Roll Result
interface DiceRoll {
  roll: number;              // d20 result (1-20)
  modifier: number;          // Skill/ability modifier
  total: number;             // roll + modifier
  success: boolean;          // total >= difficulty
  criticalHit: boolean;      // roll === 20
  criticalMiss: boolean;     // roll === 1
}

// Action Analysis
interface ActionIntent {
  type: 'combat' | 'skill_check' | 'dialogue' | 'exploration' | 'freeform';
  skill?: string;            // Athletics, Stealth, etc.
  difficulty?: number;       // DC (if applicable)
  requiresRoll: boolean;     // Was a roll made?
}

// Backend Response
interface GameResponse {
  sessionId: string;         // Continue using this!
  narrative: string;         // AI narration
  diceRoll: DiceRoll | null; // Roll result (if any)
  actionIntent: ActionIntent; // Action analysis
  nextActions: string[];     // Suggested actions
  turn: number;              // Current turn
}
```

---

## 💪 Key Implementation Details

### 1. SessionId Preservation
```typescript
// CRITICAL: Save sessionId immediately after start
const data = await response.json();
if (!data.data.sessionId) throw new Error('No sessionId');
setSessionId(data.data.sessionId);  // 🆕 MUST DO THIS!
```

### 2. Dice Roll Display
```typescript
// Show breakdown of dice calculation
if (gameData.diceRoll) {
  const { roll, modifier, total, success } = gameData.diceRoll;
  // Display: "d20[15] + 5 = 20 [✅ Success]"
}
```

### 3. Action Intent Analysis
```typescript
// Show what backend detected
ActionIntent: {type: "combat", requiresRoll: true}
// Display: "🎯 Type: combat • Requires roll: Yes"
```

### 4. Narrative Assembly
```typescript
// Build narrative with all context
const narrative = previousNarrative
  + `\n\n[${character.name}]: ${action}`           // Player action
  + diceInfo                                    // Dice roll if exists
  + actionTypeInfo                              // Action intent
  + `\n[GM]: ${gameData.narrative}`            // AI narration
```

### 5. Error Handling
```typescript
// Comprehensive error messages
if (!response.ok) {
  throw new Error(`Backend error: ${response.status}`);
}
if (!data.data.sessionId) {
  throw new Error('Invalid response structure');
}
```

---

## 🚀 Testing Checklist

### Backend Running
```bash
cd backend
npm run dev
# Output: Server listening at http://localhost:3001
```

### Frontend Environment
```bash
# Create frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Frontend Running
```bash
cd frontend
npm run dev
# Output: ✓ ready - started server on 0.0.0.0:3000
```

### Test Flow
```
1. ✅ Go to http://localhost:3000
2. ✅ Create character
3. ✅ Select world
4. ✅ Check console: "Session started: session-..."
5. ✅ Click action button
6. ✅ See dice roll + action intent displayed
7. ✅ See AI narrative from ActionOrchestrator
8. ✅ Action buttons update with backend suggestions
```

---

## 📄 Frontend Request/Response Examples

### Start Game
```javascript
// REQUEST
POST /api/game/start
{
  "character": {
    "name": "Парень",
    "race": "Человек",
    "class": "Варвар",
    "level": 1,
    "hp": {"current": 10, "max": 10},
    "ac": 12
  },
  "world": {
    "name": "Великая Фантазия",
    "difficulty": "Medium"
  },
  "language": "ru"
}

// RESPONSE
{
  "success": true,
  "data": {
    "sessionId": "session-1765721762432-0i5uoasi5",
    "narrative": "Вы просыпаетесь...",
    "language": "ru"
  }
}
```

### Action with Dice
```javascript
// REQUEST
POST /api/game/action
{
  "sessionId": "session-1765721762432-0i5uoasi5",
  "action": "Я атакую дракона мечом",
  "language": "ru"
}

// RESPONSE
{
  "success": true,
  "data": {
    "sessionId": "session-1765721762432-0i5uoasi5",
    "narrative": "Ваш меч пронзает чешую дракона...",
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
      "Отойти и переоценить"
    ],
    "turn": 1
  }
}
```

### Skill Check (No Dice)
```javascript
// REQUEST
POST /api/game/action
{
  "sessionId": "session-1765721762432-0i5uoasi5",
  "action": "Я осматриваю комнату",
  "language": "ru"
}

// RESPONSE (with skill check)
{
  "diceRoll": {
    "roll": 12,
    "modifier": 3,
    "total": 15,
    "success": true,
    "criticalHit": false,
    "criticalMiss": false
  },
  "actionIntent": {
    "type": "skill_check",
    "skill": "Perception",
    "difficulty": 15,
    "requiresRoll": true
  }
}
```

### Freeform Action (No Dice)
```javascript
// REQUEST
POST /api/game/action
{
  "sessionId": "session-1765721762432-0i5uoasi5",
  "action": "Я танцую у костра",
  "language": "ru"
}

// RESPONSE (no dice)
{
  "diceRoll": null,  // ✅ No dice for freeform!
  "actionIntent": {
    "type": "freeform",
    "requiresRoll": false
  }
}
```

---

## 🔮 Troubleshooting

### Issue: 404 on /api/game/action
**Cause:** sessionId not being sent
**Fix:** Check that sessionId state is being set after /api/game/start
```typescript
if (!data.data || !data.data.sessionId) {
  throw new Error('No sessionId from start endpoint');
}
setSessionId(data.data.sessionId); // 🆕 CRITICAL
```

### Issue: Empty dice roll
**Cause:** Action doesn't require roll (freeform)
**Fix:** Check actionIntent.requiresRoll before expecting diceRoll
```typescript
if (gameData.diceRoll) {
  // Display dice
} else if (gameData.actionIntent.requiresRoll) {
  // Something wrong - expected dice!
} else {
  // No dice needed for this action (OK)
}
```

### Issue: Narrative not updating
**Cause:** Response parsing failed
**Fix:** Check console for errors, verify response structure
```typescript
if (!data.data.narrative) {
  console.error('Invalid response:', data);
  throw new Error('No narrative in response');
}
```

### Issue: Backend returns 500
**Cause:** Character data missing required fields
**Fix:** Ensure character has all required fields:
```typescript
character: {
  name: string,
  race: string,
  class: string,
  level: number,
  hp: {current, max},
  ac: number,
  abilities: {STR, DEX, CON, INT, WIS, CHA},
  skills: {skillName: {proficient, bonus}}
}
```

---

## 🔛 Console Debugging

Frontend logs:
```javascript
// Session start
console.log(`✅ Session started: ${sessionId}`)

// Action send
console.log(`📤 Sending action:`, { sessionId, action })

// Action response
console.log(`✅ Action processed:`, gameData)

// Errors
console.error('Action error:', err)
```

Backend logs:
```
📊 Обработка действия...
📊 Тип действия: combat
🎲 КРИТ УСПЕХ! | Roll: 20 + 5 = 25
✅ Действие успешно обработано
```

---

**Last Updated:** December 14, 2025 (Post-Refactor)
**Status:** ✅ **PRODUCTION READY**
**Frontend-Backend Sync:** 📄 **100% Complete**
