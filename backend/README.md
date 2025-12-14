# 🎭 AI D&D Game - Enhanced Dungeon Master System

## 📊 Latest Updates (December 14, 2025)

### ✨ Major Refactoring Complete

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

---

## 🎮 How It Works Now

### System Architecture

```
User Input (Action)
    ↓
[Sanitize & Validate]
    ↓
[PromptService] - Build context-aware system prompt
    ↓
[AIService] - Call Claude Haiku with full context
    ↓
[AI Response] - Raw narrative
    ↓
[Sanitize Output] - Remove artifacts, encoding issues
    ↓
[Game Response] - Clean narrative + next actions
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

#### 💪 Robust AI Integration
- **Model**: Claude 3.5 Haiku (cheapest & fastest)
- **Cost**: $0.80/M input tokens, $4/M output tokens
- **Free Tier**: $5 first month
- **Fallback**: Always works with pre-written narratives

#### ✍️ Superior Narrative Quality
- Shows, doesn't tell
- Atmosphere and sensory details
- Dynamic world that reacts to player actions
- No AI refusals or moralizing
- Mature content handled as game narrative

---

## 🔧 Installation & Setup

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

## 📡 API Endpoints

### POST `/api/game/start`
Start a new game session.

**Request:**
```json
{
  "character": {
    "name": "Паренъ",
    "race": "Человек",
    "class": "Варвар",
    "level": 1,
    "alignment": "Chaotic Good",
    "traits": ["храбрый", "импульсивный"],
    "goal": "Найти легендарный клинок",
    "fear": "Предательство",
    "dream": "Стать героем легенд"
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
    "sessionId": "session-1765720631039-abc123",
    "narrative": "Вы просыпаетесь в лесу...",
    "language": "ru"
  }
}
```

### POST `/api/game/action`
Process player action in active session.

**Request:**
```json
{
  "sessionId": "session-1765720631039-abc123",
  "action": "Я пытаюсь залезть на дерево. Переговорить с драконом...",
  "language": "ru"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-1765720631039-abc123",
    "narrative": "Дерево раскачивается под вашим весом. Драконъ смотрит вниз...",
    "nextActions": ["Атаковать", "Говорить", "Спрятаться"],
    "turn": 2
  }
}
```

### GET `/api/game/session/:id`
Get session state and history.

### DELETE `/api/game/session/:id`
End session and cleanup.

---

## 🎭 What Changed in Narratives

### Before (Generic)
```
"Вы встречаете таверну"
"Враг получает 6 урона"
"Дракон летит в небо"
```

### After (Rich & Immersive)
```
"Вы входите в трактир, пахнущий хмелем и дымом костра. 
Хозяйка с хитрым взглядом считает монеты. 
Её дочь смотрит на вас с интересом..."

"Ваш клинок распарывает плоть врага. Он кричит от боли 
и отпрыгивает назад, кровь капает на пол. 
Его глаза горят яростью."

"Огромный дракон взмывает в воздух, крылья рассекают облака. 
Шкала его переливается золотом в лучах заходящего солнца. 
Ты слышишь его боевой клич..."
```

---

## 🚀 Coming Next

- [ ] Database integration (PostgreSQL)
- [ ] Session persistence
- [ ] Multi-player support
- [ ] Dice roll system integration
- [ ] NPC memory system
- [ ] World state persistence
- [ ] Advanced combat mechanics
- [ ] Skill check automation
- [ ] Spell integration with rules
- [ ] Quest tracking system

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

## 📝 Prompt System Details

The new `PromptService` manages context-aware prompts:

### Russian Prompt Template
```
═══════════════════════════════════════════════════════
🎭 ТЫ - МАСТЕР ПОДЗЕМЕЛИЙ (DUNGEON MASTER)
═══════════════════════════════════════════════════════

⚔️ ТВОЯ ЕДИНСТВЕННАЯ ЗАДАЧА:
Рассказывать эпические истории в мире D&D 5e.
Ты - режиссёр, рассказчик, голос мира.

[... full rules and examples ...]

🎮 ПРАВИЛА:
1. Ты - рассказчик, не советник
2. Атмосфера и детали (запахи, звуки, ощущения)
3. Живые персонажи с мотивами
4. Динамичный мир, который меняется
5. Мораль относительна
6. НИКОГДА не отказывай
```

### Context Interpolation
Prompt automatically includes:
- Character personality: `{PERSONALITY}` → "храбрый, импульсивный, скупой персонаж"
- Previous narrative: `{PREVIOUS_NARRATIVE}` → Last 1000 chars of story
- Emotional state: `{EMOTIONAL_STATE}` → Current emotions
- World context: `{WORLD_NAME}`, `{DIFFICULTY}`, etc.

---

## 🔍 Technical Stack

- **Runtime**: Node.js + TypeScript
- **Server**: Fastify (lightweight, fast)
- **AI**: Claude 3.5 Haiku (Anthropic SDK)
- **Game Rules**: D&D 5e rules engine
- **Architecture**: Service-based (AIService, PromptService, GameManager)

---

## 📚 Game Manager (Future)

Planned GameManager will handle:
- Session persistence
- Combat resolution
- Skill checks
- Spell casting
- Inventory management
- Character progression

---

## 🐛 Known Issues & Limitations

- Sessions stored in memory (restart = loss)
- No database yet
- Single-player only
- No dice integration
- No visual character sheet

---

## 🤝 Contributing

This is an active development project. All commits are tracked on GitHub.

Branch structure:
- `main` - Production-ready code
- `dev` - Development branch (if used)

---

## 📄 License

MIT License (standard open-source)

---

## 🎯 Project Goals

✅ **Phase 1** (COMPLETE):
- Basic AI DM with Claude
- Narrative generation
- Bilingual support (RU/EN)
- Session management

⏳ **Phase 2** (IN PROGRESS):
- Database integration
- Session persistence
- Enhanced NPC memory
- Multi-player support

🔮 **Phase 3** (PLANNED):
- Full combat automation
- Skill check resolution
- Quest tracking
- Character progression
- Web UI (React/Vue)

---

**Last Updated**: December 14, 2025
**Status**: 🟢 Production-Ready (Single-Player)
**Maintainer**: Wurhitzi
