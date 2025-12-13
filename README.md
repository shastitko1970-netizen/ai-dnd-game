# AI Dungeon Master - D&D 5e Game

A production-ready, full-stack AI-powered D&D 5e game built with **Next.js 14**, **Fastify**, and **OpenAI GPT-4** as the Dungeon Master.

## Features

✅ **Full D&D 5e Rules Engine** - Complete character creation with races, classes, feats  
✅ **AI Dungeon Master** - GPT-4 generates dynamic narratives and encounters  
✅ **Custom Content System** - Create custom races, classes, and feats  
✅ **Real Combat System** - Initiative, attacks, spells, damage rolls  
✅ **Character Sheets** - Detailed ability scores, skills, proficiencies  
✅ **Production Ready** - TypeScript everywhere, full validation, error handling  

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management

### Backend
- **Fastify** with TypeScript
- **OpenAI API** (GPT-4) for AI DM
- **JSON-based storage** (expandable to MongoDB)

## Project Structure

```
ai-dnd-game/
├── frontend/          # Next.js application
│   ├── app/          # Pages and layouts
│   ├── components/   # React components
│   ├── lib/          # Utilities, store, API
│   └── public/       # Static assets + dnd-5e-rules.json
├── backend/          # Fastify server
│   └── src/
│       ├── routes/   # API endpoints
│       ├── services/ # Business logic
│       ├── types/    # TypeScript interfaces
│       ├── utils/    # Helpers
│       └── data/     # Core rules + custom content
└── package.json      # Root workspace
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

```bash
# Clone and install
git clone https://github.com/shastitko1970-netizen/ai-dnd-game.git
cd ai-dnd-game

# Install root dependencies
npm install

# Install frontend
cd frontend && npm install && cd ..

# Install backend
cd backend && npm install && cd ..
```

### Configuration

Create `.env` files:

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
```

**backend/.env**
```
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
NODE_ENV=development
```

### Running

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Open http://localhost:3000 in browser
```

## Game Flow

1. **Landing Page** - Start your adventure
2. **World Selection** - Choose a game world
3. **Character Creation** - 3-step wizard (name, race/class, confirm)
4. **Game Session** - Play with AI DM
5. **Custom Content** - Create custom races, classes, feats

## Core Concepts

### RulesEngine
Merges **core D&D 5e rules** (immutable) with **custom content** (user-generated) to create a unified rules set for gameplay.

### Custom Content System
Players can create:
- **Custom Races**: Ability bonuses, features, speed
- **Custom Classes**: Hit dice, features per level
- **Custom Feats**: Passive or active benefits

All validated before saving, cannot modify official content.

## API Endpoints

### Rules
- `GET /api/rules/core` - Official rules
- `GET /api/rules/merged` - Core + custom
- `GET /api/rules/spell/:name` - Specific spell

### Character
- `POST /api/character/create` - Create character
- `GET /api/character/:id` - Get character

### Custom Content
- `GET /api/custom-races` - List custom races
- `POST /api/custom-races` - Create race
- `PUT /api/custom-races/:name` - Update race
- `DELETE /api/custom-races/:name` - Delete race
- Same for `/custom-classes` and `/custom-feats`

### Game
- `POST /api/game/start` - Start session
- `POST /api/game/action` - Player action
- `POST /api/game/combat/start` - Begin combat
- `GET /api/game/session/:sessionId` - Get session

## Production Quality

✅ 100% TypeScript  
✅ Full validation  
✅ Complete error handling  
✅ No placeholder code  
✅ No TODOs  
✅ Works immediately after `npm install`

## License

MIT

---

**Status**: Production Ready | **Last Updated**: 2025-12-13