# Development Guide

## Architecture Overview

### Frontend (Next.js 14)
- **App Router**: Modern routing with `/app` directory
- **React 18**: Latest React features
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety

### Backend (Fastify)
- **Fastify**: High-performance HTTP server
- **TypeScript**: Full type safety
- **Modular Services**: Clean business logic separation
- **JSON Storage**: MVP implementation (expandable to MongoDB)
- **OpenAI API**: GPT-4 integration for AI DM

## Key Services

### RulesEngine
**Location**: `backend/src/services/RulesEngine.ts`

Responsible for:
- Loading core D&D 5e rules
- Merging with custom content
- Calculating modifiers, AC, HP
- Resolving attacks and spell casts

```typescript
const rulesEngine = new RulesEngine(customContent);
const mergedRules = rulesEngine.getMergedRules();
const ac = rulesEngine.calculateAC(character);
```

### CustomContentManager
**Location**: `backend/src/services/CustomContentManager.ts`

Responsible for:
- Creating custom races, classes, feats
- Validating custom content
- Persisting to file/database
- CRUD operations

```typescript
const manager = new CustomContentManager();
const race = await manager.createRace(raceData);
```

### GameManager
**Location**: `backend/src/services/GameManager.ts`

Responsible for:
- Managing game sessions
- Processing player actions
- Coordinating with AI service
- Tracking game state

```typescript
const gameManager = new GameManager(rulesEngine);
const session = gameManager.createSession(sessionId, character, world);
const result = await gameManager.processAction(sessionId, action);
```

## Custom Content System

### Flow

1. **User creates custom race**
   - Frontend sends POST to `/api/custom-races`
   - Backend validates in `CustomContentManager`
   - Saved to `backend/src/data/custom-content.json`

2. **Game starts**
   - `RulesEngine` loads core rules
   - `CustomContentManager` loads custom content
   - Engine merges them

3. **Character creation**
   - Player can select official or custom race
   - Character receives bonuses from chosen race
   - Character is fully playable

### Validation Rules

**Races**
- Name: 2-50 characters, unique
- Speed: 20-40 feet
- Ability bonuses: -2 to +2 each, max +6 total
- Features: 0-3

**Classes**
- Name: 2-50 characters, unique
- Hit die: 6-12
- Max 10 features

**Feats**
- Name: 2-50 characters
- Description: 10+ characters

## API Endpoints Reference

### Rules
```
GET  /api/rules/core        Get official rules
GET  /api/rules/merged      Get core + custom rules
GET  /api/rules/race/:name  Get specific race
```

### Character
```
POST /api/character/create  Create new character
GET  /api/character/:id     Get character details
```

### Custom Content
```
GET    /api/custom-races           List custom races
POST   /api/custom-races           Create custom race
PUT    /api/custom-races/:name     Update race
DELETE /api/custom-races/:name     Delete race

Same for:
- /api/custom-classes
- /api/custom-feats
```

### Game
```
POST /api/game/start              Start new session
POST /api/game/action             Process player action
GET  /api/game/session/:sessionId Get session state
```

## Adding New Features

### Add a New Custom Content Type

1. **Add types** in `backend/src/types/index.ts`
   ```typescript
   export interface CustomItem { ... }
   ```

2. **Add to CustomContent interface**
   ```typescript
   export interface CustomContent {
     items?: { [key: string]: CustomItem };
   }
   ```

3. **Add methods to CustomContentManager**
   ```typescript
   async createItem(item: CustomItem) { ... }
   async updateItem(name: string, updates: Partial<CustomItem>) { ... }
   async deleteItem(name: string) { ... }
   ```

4. **Add route** in `backend/src/routes/custom-items.ts`
   ```typescript
   export async function customItemsRoutes(fastify: FastifyInstance) { ... }
   ```

5. **Register in main.ts**
   ```typescript
   await fastify.register(customItemsRoutes, { prefix: '/api/custom-items' });
   ```

6. **Add frontend pages** for management

### Add a New Game Action

1. **Add action type** in types
   ```typescript
   type: 'attack' | 'dodge' | 'hide' | 'newAction'
   ```

2. **Add handler in GameManager**
   ```typescript
   if (action.type === 'newAction') {
     result = await this.handleNewAction(...);
   }
   ```

3. **Test in frontend**

## Testing

### Manual Testing

1. **Start game**: Create character, begin adventure
2. **Custom content**: Create and use custom races
3. **Combat**: Test attacks and rolls
4. **Navigation**: Test all pages and flows

### API Testing

Use curl or Postman:

```bash
# Health check
curl http://localhost:3001/health

# Get merged rules
curl http://localhost:3001/api/rules/merged

# Create custom race
curl -X POST http://localhost:3001/api/custom-races \
  -H 'Content-Type: application/json' \
  -d '{"name": "Test Race", "description": "...", ...}'
```

## Performance Considerations

- **Rules caching**: Consider caching merged rules in memory
- **Session management**: Clean up old sessions periodically
- **Database**: Migrate from JSON to MongoDB for scale
- **AI API**: Implement request queuing for high volume

## Type Safety

- **100% TypeScript**: All code is strictly typed
- **Shared types**: `backend/src/types/` and `frontend/lib/types.ts`
- **Runtime validation**: Check custom content before saving
- **Error handling**: All errors are typed and handled

## Code Style

- **ESM modules**: Using `import` syntax
- **Functional components**: React components are functions
- **Async/await**: Used throughout
- **Error handling**: Try/catch in async functions
- **Type annotations**: All function parameters and returns typed

## Next Steps for Enhancement

1. **Database Integration**: Replace JSON with MongoDB
2. **Authentication**: Add user accounts and login
3. **Multiplayer**: Real-time game sessions
4. **More AI**: Expanded narrative generation
5. **Mobile Support**: Responsive design improvements
6. **Testing**: Jest/Vitest unit and integration tests

Enjoy developing! 🚀
