# 🎭 AI D&D Game - Enhanced Dungeon Master System

## 🎯 Latest Updates (December 14, 2025 - Evening)

### ✨ **ActionOrchestrator Implementation**

#### NOW LIVE: Intelligent Action Processing ✅
- 🧠 **AI Analysis**: Player actions are analyzed by Claude to determine intent
- 🎲 **Smart Dice System**: Rolls are performed ONLY when needed
- 📖 **Context-Aware Narratives**: AI generates responses based on dice results
- 🎭 **5 Action Types**:
  - `combat` - Battle actions, attacks (requires roll)
  - `skill_check` - Athletics, Stealth, Perception, Persuasion, etc. (requires roll)
  - `dialogue` - Conversations, negotiations (NO roll needed)
  - `exploration` - Examining areas, searching (may require roll)
  - `freeform` - Pure roleplay, no mechanics (NO roll needed)

#### How It Works Now
```
Player Input: "Я атакую дракона мечом"
    ↓
[ActionOrchestrator Step 1] AI analyzes → type: "combat"
    ↓
[ActionOrchestrator Step 2] Rolls d20 + STR/DEX mod → 15+5 = 20
    ↓
[ActionOrchestrator Step 3] Generates narrative with context
    ↓
Response: Narrative + Dice Results + Suggested Actions
```

---

## 📊 Earlier Updates (December 14, 2025 - Afternoon)

### ✨ Major Refactoring Complete (See ARCHITECTURE.md)

#### 1. **PromptService** - Bilingual D&D GM Prompts
- 🇷🇺 Full Russian language support with cultural nuances
- 🇬🇧 Full English language support
- Context-aware system prompts that adapt to:
  - Character personality and alignment
  - World difficulty and atmosphere
  - Narrative history and emotional state
  - NPC relationships and reputation

#### 2. **AIService Improvements**
- ✅ Advanced Unicode sanitization (RU/EN specific)
- ✅ Removes AI "refusal" phrases automatically
- ✅ Eliminates character encoding issues
- ✅ Language-aware filtering
- ✅ Graceful fallback system
- ✅ NEW: analyzeAction() method for ActionOrchestrator

#### 3. **Extended Type System**
- Character now includes:
  - Personality traits and alignment
  - Personal goals, fears, dreams
  - Emotional state tracking
  - NPC relationship management
  - Wound/condition tracking
- GameSession includes:
  - Narrative history for context
  - World changes tracking
  - NPC reputation system
  - Emotional state evolution

#### 4. **Improved Game Routes**
- Session-based gameplay (not stateless)
- Full narrative history tracking
- Bilingual support (RU/EN)
- Better error handling
- Session management (create/retrieve/delete)
- **NEW**: ActionOrchestrator integration

---

## 🎮 How It Works Now

### System Architecture

```
User Input (Action)
    ↓
[Validate & Sanitize]
    ↓
[ActionOrchestrator.processAction()]
    ├─ Step 1: analyzeIntent() → AI determines action type
    ├─ Step 2: rollDice() → d20 + modifiers (if needed)
    └─ Step 3: generateNarrative() → AI creates response
    ↓
[AI Response] - Raw narrative
    ↓
[Sanitize Output] - Remove artifacts, encoding issues
    ↓
[Game Response] - Clean narrative + dice results + next actions
    ↓
Update Session (history, NPC relations, emotional state)
```

### Key Features

#### 🎯 Rich Context
- **Character Context**: Personality, alignment, goals, fears, dreams
- **Session Context**: Full narrative history, last action, emotional state
- **World Context**: Difficulty, description, factions, NPCs, locations
- **Relationship Context**: NPC reputation tracking

#### 🌐 Bilingual Support
- Prompts available in Russian and English
- Language-specific sanitization rules
- UTF-8 Unicode handling for both languages

#### 🎲 Intelligent Dice System
- **Model**: Claude 3.5 Haiku
- **D20 Rolls**: Only when action type requires
- **Modifiers**: From character skills and abilities
- **Critical Mechanics**: Automatic success/failure on 20/1
- **Success Calculation**: roll + modifier >= DC (Difficulty Class)

#### 🚀 Superior Narrative Quality
- Shows, doesn't tell
- Atmosphere and sensory details
- Dynamic world that reacts to player actions
- No AI refusals or moralizing
- Mature content handled as game narrative

---

## 🏗️ Project Structure

```
backend/src/
├── services/
│   ├── AIService.ts              ← Claude API integration
│   ├── PromptService.ts          ← System prompts (RU/EN)
│   ├── ActionOrchestrator.ts     ← NEW! Smart action processing
│   └── GameManager.ts            ← Game logic (future)
├── routes/
│   ├── game.ts                   ← Game endpoints + Orchestrator
│   ├── character.ts              ← Character creation
│   └── ...
├── types/
│   └── index.ts                  ← All TypeScript interfaces
├── data/
│   └── dnd-5e-rules.json        ← D&D 5e core rules
└── main.ts                       ← Server entry point
```

---

## 🚀 Installation & Setup

### Prerequisites
```bash
node >= 18
npm >= 9
Anthropics API key
```

### Install Dependencies
```bash
cd backend
npm install
```

### Environment Setup
```bash
# .env
ANTHROPIC_API_KEY=sk-ant-v7_xxxxx
PORT=3001
NODE_ENV=development
```

### Run Server
```bash
npm run dev
```

Server starts at `http://localhost:3001`

---

## 💡 API Endpoints

### POST `/api/game/start`
Start a new game session.

**Request:**
```json
{
  "character": {
    "name": "Парень",
    "race": "Человек",
    "class": "Варвар",
    "level": 1,
    "alignment": "Chaotic Good",
    "traits": ["храбрый", "импульсивный"],
    "goal": "Найти легендарный клинок",
    "fear": "Предательство",
    "dream": "Стать героем легенда"
  },
  "world": {
    "name": "Великая Фантазия",
    "description": "Мир магии и приключений",
    "difficulty": "Medium"
  },
  "language": "ru"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1765721631039-abc123",
    "narrative": "Вы просыпаетесь в лесу...",
    "language": "ru"
  }
}
```

### POST `/api/game/action`
Process player action in active session. **NOW WITH ORCHESTRATOR!**

**Request:**
```json
{
  "sessionId": "session-1765721631039-abc123",
  "action": "Я пытаюсь залезть на дерево. Перегворить с драконом...",
  "language": "ru"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1765721631039-abc123",
    "narrative": "Дерево раскачивается под вашим весом...",
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
      "skill": "Athletics",
      "difficulty": 15,
      "requiresRoll": true
    },
    "nextActions": [
      "Посмотреть вниз",
      "Прыгнуть на врага",
      "Спрятаться в листве"
    ],
    "turn": 2
  }
}
```

### GET `/api/game/session/:id`
Get session state and history.

### DELETE `/api/game/session/:id`
End session and cleanup.

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and technical details
- **[ACTION_ORCHESTRATOR.md](./ACTION_ORCHESTRATOR.md)** - Detailed Orchestrator guide
- **[README.md](./README.md)** - Original comprehensive guide

---

## 💰 Cost Breakdown

**Using Claude 3.5 Haiku:**

| Usage | Price | Games |
|-------|-------|-------|
| 1M tokens | $0.80 input, $4 output | ~6000 games |
| $5 free tier | - | ~30,000 games |
| $10 paid | - | ~60,000 games |

**Per Game Estimate:**
- ~500 input tokens (prompt + context)
- ~200 output tokens (response)
- Cost per game: **$0.0001** (0.1 cents)

---

## 🎯 Development Progress

### ✅ Phase 1 (COMPLETE)
- ✅ Basic AI DM with Claude
- ✅ Narrative generation
- ✅ Bilingual support (RU/EN)
- ✅ Session management
- ✅ PromptService with context awareness
- ✅ AIService with sanitization
- ✅ Extended type system
- ✅ **ActionOrchestrator with dice system**

### 🚧 Phase 2 (IN PROGRESS)
- ⏳ Database integration (PostgreSQL)
- ⏳ Session persistence
- ⏳ Enhanced NPC memory
- ⏳ Multi-player support

### 📅 Phase 3 (PLANNED)
- 🔮 Full combat automation
- 🔮 Skill check resolution
- 🔮 Quest tracking
- 🔮 Character progression
- 🔮 Web UI (React/Vue)

---

## 🎲 Example Game Flow

### Session Start
```
Frontend → POST /api/game/start
├─ Character: Парень (Barbarian Lv1)
├─ World: Великая Фантазия
└─ Language: RU

Backend Response:
├─ SessionID: session-1765721631039-abc123
├─ Narrative: "Вы просыпаетесь в странном лесу..."
└─ Ready for action
```

### Action: Combat
```
Player Input: "Я атакую дракона мечом"

[ActionOrchestrator]
├─ analyzeIntent() → {type: "combat", requiresRoll: true}
├─ rollDice() → d20+5 = 18 (SUCCESS!)
└─ generateNarrative() → "Ваш меч пронзает чешую..."

Response:
├─ Narrative: "Ваш меч пронзает чешую дракона..."
├─ Dice Roll: {roll: 13, modifier: 5, total: 18, success: true}
├─ Intent: {type: "combat", requiresRoll: true}
└─ Next Actions: ["Огромный удар", "Рывок в сторону", ...]
```

### Action: Freeform
```
Player Input: "Я танцую у костра под луной"

[ActionOrchestrator]
├─ analyzeIntent() → {type: "freeform", requiresRoll: false}
├─ NO diceRoll()
└─ generateNarrative() → "Пламя танцует в ритме..."

Response:
├─ Narrative: "Пламя танцует в ритме ваших движений..."
├─ Dice Roll: null (not needed)
├─ Intent: {type: "freeform", requiresRoll: false}
└─ Next Actions: ["Продолжить танец", "Сесть у костра", ...]
```

---

## 🔧 Configuration

### ActionOrchestrator Skills
```
Athletics      - Physical strength tasks (climbing, swimming)
Acrobatics     - Balance, flexibility tasks
Stealth        - Hiding, sneaking
Perception     - Noticing details, tracking
Insight        - Reading people, detecting lies
Persuasion     - Convincing, negotiating
Deception      - Lying, disguise
Arcana         - Magic knowledge
Nature         - Natural world knowledge
Medicine       - Healing, diagnosis
Investigation  - Research, analysis
```

### Difficulty Classes (DC)
```
Very Easy   (5)   - Trivial for anyone
Easy        (10)  - Simple task
Moderate    (15)  - Fair challenge
Hard        (20)  - Challenging
Very Hard   (25)  - Very difficult
Near Impossible (30) - Nearly impossible
```

---

## 🎬 What's Next

**Right Now:**
- ✅ ActionOrchestrator LIVE in production
- ✅ All dice mechanics working
- ✅ AI action analysis complete

**Next (Backend):**
1. Database integration
2. Session persistence
3. NPC memory system
4. Advanced combat rules

**Then (Frontend):**
1. Update UI to send sessionId
2. Display dice rolls
3. Show action analysis
4. Better narrative display

---

## 📝 Niderlandisch Learning

**Het ActionOrchestrator systeem is nu actief!**

Het (ət — артикль)  
systeem (sɪˈsteːm — система)  
is (ɪs — есть)  
nederlands (ˈneːdərlɑnts — нидерландский)  
nu (nʏ — теперь)  
actief (ɑkˈtiːf — активный)  

---

**Last Updated**: December 14, 2025 (Evening - Post-Orchestrator)
**Status**: ✅ **PRODUCTION READY** - Dice System Live!
**Maintainer**: Wurhitzi
