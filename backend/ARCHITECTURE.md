# 🏗️ Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vue)                     │
│                  (Character Creation UI)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Fastify Server                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Game Routes (/api/game/start, /action, etc.)      │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ • Session management                               │   │
│  │ • Request validation                               │   │
│  │ • Response formatting                              │   │
│  └────────────────────────────────────────────────────┘   │
│                          ▲                                  │
│                          │                                  │
│  ┌────────────────────────┴─────────────────────────────┐  │
│  │                  Services Layer                       │  │
│  │                                                      │  │
│  │ ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │ │ AIService    │  │ PromptService│  │GameManager │  │  │
│  │ ├──────────────┤  ├──────────────┤  ├────────────┤  │  │
│  │ │• Sanitize    │  │• Build       │  │• Game      │  │  │
│  │ │• Generate    │  │  prompts     │  │  logic     │  │  │
│  │ │• Fallback    │  │• Context     │  │• Rules     │  │  │
│  │ └──────────────┘  │  mgmt        │  │            │  │  │
│  │        │          │• Bilingual   │  └────────────┘  │  │
│  │        │          └──────────────┘                   │  │
│  │        │                  ▲                          │  │
│  │        │                  │                          │  │
│  │        └──────────────────┴──────────────────────────┘  │
│  │                          ▲                              │
│  │                          │                              │
│  │            ┌─────────────┘                             │
│  │            │                                           │
│  └────────────┼───────────────────────────────────────────┘
│               │
│      ┌────────▼──────────┐
│      │ Types & Interfaces│
│      ├───────────────────┤
│      │• Character        │
│      │• GameSession      │
│      │• World            │
│      │• GameContext      │
│      └───────────────────┘
│
└──────────────────────────────────────────────────────────────┘
                          │
                          │ API calls
                          ▼
                   ┌──────────────┐
                   │ Claude API   │
                   │ (Anthropic)  │
                   └──────────────┘
```

## Service Architecture

### 1. AIService
**File**: `src/services/AIService.ts`

**Responsibilities**:
- Interact with Claude API
- Sanitize input/output
- Manage fallback narratives
- Support bilingual output

**Key Methods**:
```typescript
class AIService {
  static async generateInitialNarrative(
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en'
  ): Promise<string>

  static async generateActionResponse(
    action: string,
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en'
  ): Promise<string>

  static async generateNextActions(
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en'
  ): Promise<string[]>

  private static sanitizeOutput(
    text: string,
    language: 'ru' | 'en'
  ): string
}
```

**Features**:
- Unicode normalization for Russian/English
- Removes AI "refusal" phrases
- Markdown removal
- Graceful fallback
- 30-second timeout

---

### 2. PromptService
**File**: `src/services/PromptService.ts`

**Responsibilities**:
- Manage D&D GM system prompts
- Build context-aware prompts
- Support bilingual templates
- Interpolate game context

**Interface**:
```typescript
interface GameContext {
  narrativeHistory: string;      // Full session narrative
  lastAction: string;            // Player's last action
  emotionalState: string;        // Current mood/state
  npcRelations?: Record<...>;    // Reputation tracking
  sessionDuration: number;       // Minutes played
}

class PromptService {
  static getSystemPrompt(
    character: Character,
    world: World,
    context: GameContext,
    language: 'ru' | 'en'
  ): string

  private static buildPersonality(character): string
  private static getSystemPromptRU(): string
  private static getSystemPromptEN(): string
}
```

**Prompt Structure**:
1. **Identity**: "You are a Dungeon Master"
2. **World Context**: Name, difficulty, era
3. **Character Context**: Name, race, class, personality
4. **Narrative Context**: Previous story, last action, emotions
5. **Rules**: 6 core rules for behavior
6. **Writing Style**: Length, language, tone
7. **Examples**: Good vs bad narratives
8. **Prohibitions**: What NOT to do

---

### 3. GameManager (Future)
**File**: `src/services/GameManager.ts` (planned)

**Planned Responsibilities**:
- Session lifecycle management
- Combat resolution
- Skill check automation
- Spell validation
- Character progression
- World state persistence

---

## Data Flow

### Game Start Flow
```
1. Frontend sends POST /api/game/start
   ├─ Character data
   ├─ World data
   └─ Language preference

2. Route handler receives request
   ├─ Creates GameContext
   └─ Validates input

3. AIService.generateInitialNarrative()
   ├─ PromptService builds system prompt
   │  ├─ Interpolates character data
   │  ├─ Interpolates world data
   │  └─ Adds rules + examples
   ├─ Calls Claude API
   ├─ Receives raw narrative
   ├─ Sanitizes output
   │  ├─ Remove artifacts
   │  ├─ Fix encoding
   │  └─ Validate language
   └─ Returns clean narrative

4. Route creates GameSession
   ├─ Stores in memory (Map)
   ├─ Assigns sessionId
   └─ Returns to frontend

5. Frontend displays narrative
```

### Action Flow
```
1. Frontend sends POST /api/game/action
   ├─ sessionId
   ├─ Player action description
   └─ Language preference

2. Route finds active session
   ├─ Validates session exists
   └─ Updates GameContext

3. AIService.generateActionResponse()
   ├─ PromptService builds context-aware prompt
   │  ├─ Last 1000 chars of narrative history
   │  ├─ Last action
   │  ├─ Emotional state
   │  ├─ Character personality
   │  └─ NPC relations
   ├─ Calls Claude API
   ├─ Receives response
   └─ Sanitizes output

4. AIService.generateNextActions()
   ├─ Generates 3-4 action options
   ├─ Returns as JSON array
   └─ Sanitizes options

5. Update session
   ├─ Append to narrativeHistory
   ├─ Increment turn counter
   ├─ Update emotional state
   └─ Track world changes

6. Route returns response
   ├─ Current narrative
   ├─ Suggested next actions
   ├─ Turn counter
   └─ Session ID
```

---

## Type System

### Character Extended
```typescript
interface Character {
  // Basic D&D 5e
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  gender: string;
  abilities: { STR, DEX, CON, INT, WIS, CHA };
  skills: { [key: string]: { proficient, bonus } };
  feats: string[];
  armor: string;
  hp: { current, max };
  ac: number;
  initiative: number;

  // NEW: AI Context
  alignment?: 'Lawful Good' | 'Neutral Good' | ... // 9 options
  traits?: string[];        // Personal traits
  goal?: string;            // Main objective
  fear?: string;            // Character's fear
  dream?: string;           // Character's dream
  
  backstory?: string;       // Character history
  emotionalState?: string;  // Current mood
  wounds?: string[];        // Current injuries
  npcRelations?: {...};     // Reputation map
  conditions?: string[];    // D&D conditions
  shortTermGoal?: string;   // Current mission
}
```

### GameSession Extended
```typescript
interface GameSession {
  // Basic
  id: string;
  character: Character;
  world: World;
  startTime: Date;
  turn: number;
  combatActive: boolean;
  combatState: CombatState | null;
  actions: GameAction[];

  // NEW: AI Context & History
  narrativeHistory: string;           // Full session text
  lastAction: string;                 // Last player action
  emotionalState: string;             // Current emotion
  npcRelations: Record<...>;          // Reputation scores
  worldChanges: WorldChange[];        // Track world evolution
  sessionDuration: number;            // Minutes played
}
```

---

## API Contracts

### POST /api/game/start
```typescript
Request Body {
  character: Character;
  world: World;
  language?: 'ru' | 'en';  // Defaults to 'ru'
}

Response {
  success: boolean;
  data: {
    sessionId: string;
    narrative: string;  // Initial narrative
    character: Character;
    world: World;
    language: string;
  };
}
```

### POST /api/game/action
```typescript
Request Body {
  sessionId: string;
  action: string;          // Player's action description
  language?: 'ru' | 'en';
}

Response {
  success: boolean;
  data: {
    sessionId: string;
    narrative: string;        // AI GM response
    nextActions: string[];    // 3-4 suggested actions
    turn: number;            // Incremented turn counter
    timestamp: string;       // ISO 8601
  };
}
```

### GET /api/game/session/:id
```typescript
Response {
  success: boolean;
  data: {
    id: string;
    character: Character;
    world: World;
    turn: number;
    narrativeHistory: string;
    npcRelations: Record<...>;
    worldChanges: WorldChange[];
  };
}
```

### DELETE /api/game/session/:id
```typescript
Response {
  success: boolean;
  message: string;  // "Session ended"
}
```

---

## Sanitization Pipeline

### Input Sanitization
```
Raw Action String
    ↓
[Length Check] - Max 200 chars
    ↓
[Character Validation] - Only Russian/English
    ↓
Clean Action
```

### Output Sanitization (Russian)
```
Raw AI Response
    ↓
[Remove English Refusals] - "I cannot", "I apologize"
    ↓
[Remove Russian Refusals] - "извини", "не могу"
    ↓
[Unicode Filter] - Keep only Cyrillic + punctuation
    ↓
[Remove Markdown] - **bold**, __italic__, ```code```
    ↓
[Remove Emoji] - 🔥 → removed
    ↓
[Clean Whitespace] - Multiple spaces → single
    ↓
[Length Cap] - Max 5000 chars
    ↓
Clean Narrative
```

---

## Error Handling

### AI Service Errors
```
AI Call Fails
    ↓
[Check Error Type]
    ├─ Connection Error → Disable AI, use fallback
    ├─ Timeout Error → Retry once, then fallback
    ├─ Invalid Key → Log & continue with fallback
    └─ Other → Log & use fallback
    ↓
Return Fallback Narrative
```

### Fallback Narratives
**Russian**:
```
"Вы просыпаетесь в Великой Фантазии. 
Странные звуки и опасность в воздухе."
```

**English**:
```
"You awaken in the fantasy world.
A sense of danger fills the air."
```

---

## Performance Considerations

### Token Usage
- **Typical Game**:
  - Input: 500-700 tokens (prompt + context)
  - Output: 150-300 tokens (narrative)
  - Per action: ~400-500 tokens total
  - Per session (10 actions): ~4,500 tokens
  - Cost per session: **~$0.005** (half a cent)

### Response Times
- **Initial Narrative**: ~2-3 seconds
- **Action Response**: ~2-3 seconds
- **Timeout**: 30 seconds

### Memory Usage
- **Per Session**: ~100KB (narrative + context)
- **Active Sessions**: Minimal (few MB for 100+ sessions)
- **Note**: Sessions cleared on server restart

---

## Future Enhancements

1. **Database Integration**
   - PostgreSQL for session persistence
   - Character history archiving
   - Player statistics

2. **Advanced NPC Memory**
   - Track NPC interactions
   - Dialogue continuity
   - Relationship evolution

3. **Combat Automation**
   - Dice roll integration
   - Auto-resolve combat
   - Health tracking

4. **Multi-Player Support**
   - Multiple characters per world
   - PvP mechanics
   - Shared narrative history

5. **Web UI**
   - Character creation interface
   - Real-time narrative display
   - Action selection buttons
   - Character sheet visualization

---

**Last Updated**: December 14, 2025
**Version**: 1.0 (Production-Ready)
