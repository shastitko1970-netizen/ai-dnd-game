# Installation & Setup Guide

## Prerequisites

- **Node.js**: Version 18 or higher ([download](https://nodejs.org/))
- **npm** or **yarn**: Comes with Node.js
- **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com/api-keys)
- **Git**: For cloning the repository

## Step 1: Clone the Repository

```bash
git clone https://github.com/shastitko1970-netizen/ai-dnd-game.git
cd ai-dnd-game
```

## Step 2: Install Dependencies

### Option A: Root install (recommended)

```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Option B: Manual install

Frontend:
```bash
cd frontend
npm install
cd ..
```

Backend:
```bash
cd backend
npm install
cd ..
```

## Step 3: Configure Environment Variables

### Backend Configuration

Create `backend/.env`:

```bash
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
NODE_ENV=development
```

Replace `sk-your-api-key-here` with your actual OpenAI API key.

### Frontend Configuration

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
```

## Step 4: Run the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ Server running on http://localhost:3001
📚 Health check: http://localhost:3001/health
🎯 API: http://localhost:3001/api
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
> Local:        http://localhost:3000
```

## Step 5: Open the Game

Open your browser to **http://localhost:3000**

You should see the AI Dungeon Master landing page!

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process (replace PID)
kill -9 <PID>
```

### OpenAI API Key Error

- Make sure `backend/.env` has the correct API key
- API key should start with `sk-`
- Check that your OpenAI account has API credits

### CORS Errors

Make sure:
- Backend is running on `http://localhost:3001`
- Frontend `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Backend CORS is enabled (it is by default)

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Commands

### Backend

```bash
cd backend
npm run dev         # Development with hot reload
npm run build       # Build for production
npm run start       # Run compiled version
npm run type-check  # Check TypeScript types
```

### Frontend

```bash
cd frontend
npm run dev         # Development
npm run build       # Build for production
npm run start       # Run production build
npm run lint        # Lint code
npm run type-check  # Check TypeScript types
```

## Project Structure

```
ai-dnd-game/
├── backend/              # Fastify API server
│   ├── src/
│   │   ├── main.ts      # Entry point
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Helpers
│   │   └── data/        # Game data
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # Next.js app
│   ├── app/             # Pages
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   ├── public/          # Static files
│   ├── package.json
│   └── tsconfig.json
│
├── package.json         # Root config
├── README.md
└── INSTALLATION.md
```

## Next Steps

1. **Play the Game**: Start your adventure!
2. **Create Custom Content**: Make your own races, classes, and feats
3. **Read the README**: For detailed feature documentation
4. **Check API Endpoints**: See `README.md` for full API documentation

## Support

If you encounter issues:

1. Check the error message carefully
2. Review the logs in terminal
3. Check this troubleshooting section
4. Review `.env` files
5. Make sure all dependencies are installed

Enjoy your adventure! 🐉
