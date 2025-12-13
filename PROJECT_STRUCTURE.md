# AI D&D Game - Complete Project Structure

## Overview

This is a **production-ready, full-stack D&D 5e game** with:
- **Frontend**: Next.js 14 with React 18, Zustand, Tailwind CSS
- **Backend**: Fastify with TypeScript, OpenAI integration
- **Database**: JSON-based (MVP), expandable to MongoDB
- **Architecture**: Service-oriented with strict separation of concerns

## Directory Tree

```
ai-dnd-game/
├── README.md                  # Project overview
├── QUICKSTART.md              # Fast setup guide
├── INSTALLATION.md            # Detailed installation
├── DEVELOPMENT.md             # Dev guide with examples
├── API.md                     # Complete API documentation
├── PROJECT_STRUCTURE.md       # This file
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Root workspace config
├── tsconfig.json              # Root TypeScript config
├──
├── backend/                   # 🔳 Fastify API Server
├│  ├── .env.example             # Backend env template
├│  ├── .gitignore               # Backend gitignore
├│  ├── package.json             # Dependencies
├│  ├── tsconfig.json             # TypeScript config
├│  ├──
├│  ├── src/
├│  ├│  ├── main.ts                 # Server entry point
├│  ├│  ├── routes/                 # 📚 API endpoints
├│  ├│  ├│  ├── rules.ts               # GET core/merged rules
├│  ├│  ├│  ├── character.ts           # POST create character
├│  ├│  ├│  ├── custom-races.ts        # CRUD custom races
├│  ├│  ├│  ├── custom-classes.ts      # CRUD custom classes
├│  ├│  ├│  ├── custom-feats.ts        # CRUD custom feats
├│  ├│  ├│  ├── game.ts                # Game sessions
├│  ├│  ├│  └── ai.ts                  # AI DM endpoints (future)
├│  ├│  ├──
├│  ├│  ├── services/               # ⚡ Business Logic
├│  ├│  ├│  ├── RulesEngine.ts         # Core D&D rules + merging
├│  ├│  ├│  ├── CustomContentManager.ts # CRUD + validation
├│  ├│  ├│  ├── GameManager.ts         # Session management
├│  ├│  ├│  ├── CharacterService.ts    # Character creation
├│  ├│  ├│  ├── CombatEngine.ts        # Combat system (future)
├│  ├│  ├│  ├── AIService.ts           # OpenAI integration
├│  ├│  ├│  └── StorageService.ts      # Data persistence
├│  ├│  ├──
├│  ├│  ├── types/                  # 💫 TypeScript Interfaces
├│  ├│  ├│  ├── index.ts               # All type exports
├│  ├│  ├│  └── Character.ts, etc.     # Domain types
├│  ├│  ├──
├│  ├│  ├── utils/                  # 🔰 Utilities
├│  ├│  ├│  ├── dice.ts                # Dice rolling functions
├│  ├│  ├│  ├── calculations.ts        # Ability modifiers, AC, HP
├│  ├│  ├│  ├── validation.ts          # Content validation
├│  ├│  ├│  ├── logger.ts              # Logging utilities
├│  ├│  ├│  └── dnd-rules-loader.ts   # Load JSON rules
├│  ├│  ├──
├│  ├│  ├── middleware/             # 💨 Middlewares
├│  ├│  ├│  ├── auth.ts                # Request validation
├│  ├│  ├│  ├── errorHandler.ts        # Error handling
├│  ├│  ├│  └── cors.ts                # CORS configuration
├│  ├│  ├──
├│  ├│  ├── data/                   # 📑 Game Data
├│  ├│  ├│  ├── dnd-5e-rules.json      # Core D&D rules
├│  ├│  ├│  ├── custom-content.json    # User-created content
├│  ├│  ├│  └── custom-content-template.json
├│  ├│  ├──
├│  ├└── dist/                   # Compiled output (generated)
├│
├── frontend/                  # 🌟 Next.js App
├│  ├── .env.local.example       # Frontend env template
├│  ├── .gitignore               # Frontend gitignore
├│  ├── package.json             # Dependencies
├│  ├── tsconfig.json            # TypeScript config
├│  ├── next.config.js           # Next.js config
├│  ├── tailwind.config.ts       # Tailwind CSS config
├│  ├── postcss.config.js        # PostCSS config
├│  ├──
├│  ├── app/                     # 📚 Pages & Layouts
├│  ├│  ├── layout.tsx              # Root layout
├│  ├│  ├── page.tsx                # Home page
├│  ├│  ├── globals.css             # Global styles
├│  ├│  ├──
├│  ├│  ├── world-select/           # World selection
├│  ├│  ├│  └── page.tsx
├│  ├│  ├──
├│  ├│  ├── character-create/       # 3-step character wizard
├│  ├│  ├│  ├── page.tsx               # Main wizard
├│  ├│  ├│  ├── step1-basic.tsx        # Name & gender
├│  ├│  ├│  ├── step2-attributes.tsx   # Race, class, feats
├│  ├│  ├│  └── step3-confirm.tsx      # Review & create
├│  ├│  ├──
├│  ├│  ├── game/                   # 🎲 Game Session
├│  ├│  ├│  ├── page.tsx               # Main game loop
├│  ├│  ├│  ├── chat.tsx               # Game chat
├│  ├│  ├│  ├── character-sheet.tsx    # Character display
├│  ├│  ├│  ├── combat.tsx             # Combat interface
├│  ├│  ├│  └── spell-list.tsx         # Spell management
├│  ├│  ├──
├│  ├│  ├── custom-content/         # 📄 Custom Content Hub
├│  ├│  ├│  ├── page.tsx               # Content hub
├│  ├│  ├│  ├──
├│  ├│  ├│  ├── races/                 # Custom races management
├│  ├│  ├│  ├│  ├── page.tsx               # List races
├│  ├│  ├│  ├│  ├── create/                # Create new race
├│  ├│  ├│  ├│  └── [name]/                # Edit specific race
├│  ├│  ├│  ├──
├│  ├│  ├│  ├── classes/               # Custom classes management
├│  ├│  ├│  ├│  ├── page.tsx
├│  ├│  ├│  ├│  └── create/
├│  ├│  ├│  ├──
├│  ├│  ├│  ├── feats/                 # Custom feats management
├│  ├│  ├│  ├│  ├── page.tsx
├│  ├│  ├│  ├│  └── create/
├│  ├│  ├│  └── [type]/[name]/edit/    # Edit custom content
├│  ├│  ├──
├│  ├── components/             # ⚡ React Components
├│  ├│  ├── GameChat.tsx            # Chat interface
├│  ├│  ├── CharacterStats.tsx      # Character display
├│  ├│  ├── CombatPanel.tsx         # Combat interface
├│  ├│  ├── ActionButtons.tsx       # Action buttons
├│  ├│  ├── WorldCard.tsx           # World display
├│  ├│  ├── CustomRaceForm.tsx      # Race form
├│  ├│  ├── CustomClassForm.tsx     # Class form
├│  ├│  ├── CustomFeatForm.tsx      # Feat form
├│  ├│  ├── RulesPreview.tsx        # Rules preview
├│  ├│  └── SettingsPanel.tsx       # Settings
├│  ├──
├│  ├── lib/                     # 📦 Utilities & Services
├│  ├│  ├── api.ts                 # API client (axios wrapper)
├│  ├│  ├── types.ts               # Shared TypeScript types
├│  ├│  ├── store.ts               # Zustand store
├│  ├│  ├── validation.ts          # Input validation
├│  ├│  ├── customContent.ts       # Custom content logic
├│  ├│  ├── dnd-rules-client.ts    # Client-side rules
├│  ├│  └── utils.ts               # Helper functions
├│  ├──
├│  ├── public/                 # 📄 Static Assets
├│  ├│  ├── dnd-5e-rules.json       # Core D&D rules (immutable)
├│  ├│  └── favicon.ico
├│  ├──
├│  ├── data/                   # 📄 Game Data (frontend)
├│  ├│  └── worlds.json             # Predefined game worlds
├│  ├──
├└── .next/                  # Next.js build output (generated)
```

## Key Files

### Backend Core Files

1. **main.ts** - Fastify server initialization, route registration
2. **RulesEngine.ts** - Core D&D 5e rules interpreter and merging logic
3. **CustomContentManager.ts** - CRUD and validation for custom content
4. **GameManager.ts** - Game session management
5. **CharacterService.ts** - Character creation and calculation

### Frontend Core Files

1. **store.ts** - Zustand state management
2. **api.ts** - Axios API client wrapper
3. **layout.tsx** - Root layout with navigation
4. **page.tsx** (game/page.tsx) - Main game loop
5. **character-create/page.tsx** - 3-step character wizard

## Data Flow

### Character Creation Flow

```
Frontend (character-create) 
  ↓ POST /api/character/create
Backend (routes/character.ts)
  ↓ CharacterService.createCharacter()
RulesEngine.getMergedRules()
  ↓ Core + Custom races/classes
Character object created
  ↓ Stored in session
Frontend receives character
```

### Custom Content Flow

```
Frontend (custom-content/races/create)
  ↓ POST /api/custom-races
Backend (routes/custom-races.ts)
  ↓ CustomContentManager.createRace()
Validation (race name, speed, bonuses)
  ↓ Saved to custom-content.json
Frontend receives success
  ↓ Redirect to list

When game starts:
RulesEngine loads core + custom
  ↓ Merge races, classes, feats
  ↓ Character creation shows both
```

### Game Session Flow

```
Frontend (game/page.tsx)
  ↓ GET /api/game/session/:sessionId
GameManager.getSession()
  ↓ Display narrative and options

Player takes action (attack, dodge, etc)
  ↓ POST /api/game/action
GameManager.processAction()
  ↓ RulesEngine resolves action
  ↓ AI generates narrative
Frontend updates UI
  ↓ Next turn
```

## Technology Stack Summary

### Frontend
- **Next.js 14**: App Router, SSR, API routes (unused here)
- **React 18**: Latest features, hooks
- **TypeScript**: Full type safety
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling
- **Axios**: HTTP client

### Backend
- **Fastify**: High-performance HTTP server
- **TypeScript**: Full type safety
- **OpenAI API**: GPT-4 integration (setup ready)
- **Node.js**: Runtime
- **JSON**: MVP storage (extendable)

### Development Tools
- **npm/pnpm**: Package management
- **TypeScript**: Compile & check
- **Git**: Version control
- **ESM**: Modern module system

## Production Considerations

### Deployment
- Backend: Deploy to Node.js hosting (Render, Railway, Heroku)
- Frontend: Deploy to Vercel, Netlify, or similar
- Database: Migrate to MongoDB or PostgreSQL
- AI: Set up OpenAI API key management

### Performance
- Implement caching for merged rules
- Clean up old game sessions
- Add request queuing for AI API
- Consider CDN for static assets

### Security
- Add authentication system
- Validate all inputs
- Rate limiting
- CORS configuration
- Environment variable management

## Quick Navigation

- **API Docs**: See [API.md](API.md)
- **Installation**: See [INSTALLATION.md](INSTALLATION.md)
- **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)
- **Development**: See [DEVELOPMENT.md](DEVELOPMENT.md)
- **Main README**: See [README.md](README.md)

---

**Status**: Production Ready | **Last Updated**: 2025-12-13
