# Быстрый старт

## Всем сразу!

### 1. Проверка

```bash
# Node версия (18+)
node --version

# npm
npm --version
```

### 2. Клонируем и истановляем

```bash
git clone https://github.com/shastitko1970-netizen/ai-dnd-game.git
cd ai-dnd-game
npm run install:all
```

### 3. Конфигурируем

**Бэкенд** (`backend/.env`):
```
OPENAI_API_KEY=sk-xxxx....
PORT=3001
NODE_ENV=development
```

**Фронтенд** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
```

### 4. Запускаем

**Вариант A: Два терминала**

Терминал 1:
```bash
cd backend && npm run dev
```

Терминал 2:
```bash
cd frontend && npm run dev
```

**Вариант B: Одна команда (из root)
```bash
npm run dev
```

### 5. Открываем

Откры в браузере: **http://localhost:3000**

## Что ты говнишь?

✅ Полная D&D 5e игра с AI Мастером Подземелья  
✅ Мастер создания персонажа  
✅ Боевая система в режиме реального времени  
✅ Создание пользовательского контента  
✅ TypeScript везде  
✅ Production-ready код  

## Обычные проблемы

### "Модуль не найден"
```bash
cd backend && npm install
cd ../frontend && npm install
```

### "Порт 3000/3001 уже используется"
```bash
# Найти процесс
lsof -i :3000   
# Киллить
kill -9 <PID>   
```

### "CORS ошибка"
- Проверь что бэкенд работает на `:3001`
- Проверь `frontend/.env.local` на правильный URL API

## API Примеры

### Проверка здоровья
```bash
curl http://localhost:3001/health
```

### Получить мерженные правила
```bash
curl http://localhost:3001/api/rules/merged
```

### Создать собственную расу
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

## Овервью

```
ai-dnd-game/
├── backend/           # API сервер (Fastify)
├── frontend/          # Веб-приложение (Next.js)
├── INSTALLATION.md    # Полная инструкция
├── DEVELOPMENT.md     # Гайд разработки
├── QUICKSTART.md      # Этот файл
└── README.md          # Обзор проекта
```

---

**Наслаждайся априключением!** 🐉
