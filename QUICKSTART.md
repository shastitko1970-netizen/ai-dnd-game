# Quick Start Guide

## Fastest Way to Run the Game

### 1. Prerequisites

```bash
# Check Node version (need 18+)
node --version

# Check npm
npm --version
```

### 2. Clone & Install

```bash
git clone https://github.com/shastitko1970-netizen/ai-dnd-game.git
cd ai-dnd-game
npm run install:all
```

### 3. Set Environment

**Backend** (`backend/.env`):
```
OPENAI_API_KEY=sk-xxxx....
PORT=3001
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
```

### 4. Run Everything

**Option A: Both terminals**

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd frontend && npm run dev
```

**Option B: One command (from root)
```bash
npm run dev
```

### 5. Play!

Open **http://localhost:3000** in browser

## Common Issues

### "Cannot find module"
```bash
cd backend && npm install
cd ../frontend && npm install
```

### "Port 3000/3001 already in use"
```bash
# Kill process
lsof -i :3000   # Find process
kill -9 <PID>   # Kill it
```

### "CORS error"
- Make sure backend is running on `:3001`
- Check `frontend/.env.local` has correct API URL

## What You Get

✅ Full D&D 5e game with AI Dungeon Master  
✅ Character creation wizard  
✅ Real-time combat system  
✅ Custom content creation  
✅ TypeScript everywhere  
✅ Production-ready code  

## Next Steps

1. **Create a character** in the game
2. **Play an adventure** with AI storytelling
3. **Create custom content** (races, classes, feats)
4. **Explore the code** to understand the architecture

## API Examples

### Get Merged Rules
```bash
curl http://localhost:3001/api/rules/merged
```

### Create Character
```bash
curl -X POST http://localhost:3001/api/character/create \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Aragorn",
    "gender": "Male",
    "race": "Human",
    "class": "Fighter",
    "feats": []
  }'
```

### Create Custom Race
```bash
curl -X POST http://localhost:3001/api/custom-races \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Shadow Elf",
    "description": "Elves touched by shadow magic",
    "size": "Medium",
    "speed": 30,
    "abilityBonus": {"DEX": 2, "INT": 1, "WIS": -1},
    "features": ["Darkvision", "Shadow Resistance"]
  }'
```

## Directory Overview

```
ai-dnd-game/
├── backend/           # API Server (Fastify)
├── frontend/          # Web App (Next.js)
├── INSTALLATION.md    # Full setup guide
├── DEVELOPMENT.md     # Dev guide
├── QUICKSTART.md      # This file
└── README.md          # Project overview
```

## File Your First Issue

Found a bug? Have a feature idea?  
[Create an issue on GitHub](https://github.com/shastitko1970-netizen/ai-dnd-game/issues)

---

**Enjoy your adventure!** 🐉
