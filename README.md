# AI Мастер Подземелья - D&D 5e Игра

Полностью готовая к production использованию, full-stack D&D 5e игра с AI Мастером Подземелья, построенная на **Next.js 14**, **Fastify**, и **OpenAI GPT-4**.

## Особенности

✅ **Полная система правил D&D 5e** - 35 рас, 12 классов, динамическое создание персонажей  
✅ **AI Мастер Подземелья** - GPT-4 создаёт динамические сюжеты и встречи  
✅ **Система пользовательского контента** - Создавайте собственные расы, классы и особенности прямо в мастере  
✅ **Реальная боевая система** - Инициатива, атаки, заклинания, урон  
✅ **Листы персонажей** - Подробные характеристики, навыки, владение оружием  
✅ **Production-ready** - TypeScript везде, полная валидация, обработка ошибок  

## Технологический стек

### Фронтенд
- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** для стилей

### Бэкенд
- **Fastify** с TypeScript
- **OpenAI API** (GPT-4) для AI DM
- **JSON-based хранилище** D&D 5e правил

## Структура проекта

```
ai-dnd-game/
├── frontend/
│   ├── app/character-create/        # Мастер создания персонажа
│   ├── public/dnd-5e-rules.json     # 35 рас, спеллы, мастера
│   └── ...
├── backend/
│   └── src/
│       ├── services/RulesEngine.ts   # Загружает JSON, объединяет правила
│       ├── routes/rules.ts           # API для рас/классов/спеллов
│       ├── routes/character.ts       # Создание персонажа
│       ├── data/dnd-5e-rules.json   # Зеркало правил для backend
│       └── ...
└── ...
```

## Быстрый старт

### Требования
- Node.js 18+
- npm или yarn
- API ключ OpenAI

### Установка

```bash
git clone https://github.com/shastitko1970-netizen/ai-dnd-game.git
cd ai-dnd-game
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Конфигурация

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**backend/.env**
```
OPENAI_API_KEY=sk-...
PORT=3001
NODE_ENV=development
```

### Запуск

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Open http://localhost:3000
```

## Поток игры

1. **Главная страница** → выбор мира
2. **Мастер создания персонажа** (3 шага):
   - Шаг 1: Имя, пол
   - Шаг 2: Выбор или создание расы (35+ опций) и класса (12+ опций)
   - Шаг 3: Подтверждение
3. **Игровая сессия** с AI DM

## API Endpoints

### Правила (новое)
- `GET /api/rules/races` — все доступные расы (35+)
- `GET /api/rules/classes` — все доступные классы (12+)
- `GET /api/rules/races/:name` — конкретная раса
- `GET /api/rules/classes/:name` — конкретный класс
- `GET /api/rules/core` — статистика правил

### Персонаж
- `POST /api/character/create` — создание персонажа
- `GET /api/character/:id` — получение персонажа

### Пользовательский контент
- `POST /api/custom-races` — создать расу
- `POST /api/custom-classes` — создать класс
- `POST /api/custom-feats` — создать особенность

## Содержание

### Расы (35)
Классические: Human, Elf, Dwarf, Halfling, Dragonborn, Tiefling, Gnome  
Экзотические: Aarakocra, Aasimar, Bugbear, Centaur, Fairy, Firbolg, Genasi (x4), Gith, Goblin, Goliath, Hadozee, Kenku, Kobold, Leonin, Lizardfolk, Minotaur, Orc, Satyr, Tabaxi, Tortle

### Классы (12)
Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard

## Production-качество

✅ 100% TypeScript  
✅ Полная валидация против D&D 5e правил  
✅ Обработка ошибок  
✅ Работает сразу после установки  

## Лицензия

MIT

---

**Статус**: Production-ready | **Последнее обновление**: 2025-12-14 | **Версия контента**: 35 рас, 12 классов
