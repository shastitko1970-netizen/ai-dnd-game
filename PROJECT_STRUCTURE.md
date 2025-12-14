# AI D&D Игра - Полная Структура Проекта

## Обзор

Это **production-ready, full-stack D&D 5e игра** с:
- **Фронтенд**: Next.js 14 с React 18, Zustand, Tailwind CSS
- **Бэкенд**: Fastify с TypeScript, OpenAI интеграция
- **База данных**: JSON-based (MVP), расширяется на MongoDB
- **Архитектура**: Service-oriented с строгим разделением ответственности

## Дерево Директорий

```
ai-dnd-game/
├── README.md                  # Обзор проекта
├── QUICKSTART.md              # Быстрый гайд установки
├── INSTALLATION.md            # Подробная установка
├── DEVELOPMENT.md             # Гайд разработки с примерами
├── API.md                     # Полная документация API
├── PROJECT_STRUCTURE.md       # Этот файл
├── .env.example               # Шаблон окружения
├── .gitignore                 # Git игнор правила
├── package.json               # Root конфиг воркспейса
├── tsconfig.json              # Root TypeScript конфиг
├──
├── backend/                   # 🔌 Fastify API Сервер
├── │ ├── .env.example         # Шаблон бэкенд окружения
├── │ ├── .gitignore           # Бэкенд gitignore
├── │ ├── package.json         # Зависимости
├── │ ├── tsconfig.json        # TypeScript конфиг
├── │ └──
├── │ ├── src/
├── │ ├── │ ├── main.ts        # Точка входа сервера
├── │ ├── │ ├── routes/        # 📚 API endpoints
├── │ ├── │ ├── │ ├── rules.ts
├── │ ├── │ ├── │ ├── character.ts
├── │ ├── │ ├── │ ├── custom-races.ts
├── │ ├── │ ├── │ ├── custom-classes.ts
├── │ ├── │ ├── │ ├── custom-feats.ts
├── │ ├── │ ├── │ ├── game.ts
├── │ ├── │ ├── │ └── ai.ts
├── │ ├── │ ├──
├── │ ├── │ ├── services/      # ⚡ Бизнес-логика
├── │ ├── │ ├── │ ├── RulesEngine.ts
├── │ ├── │ ├── │ ├── CustomContentManager.ts
├── │ ├── │ ├── │ ├── GameManager.ts
├── │ ├── │ ├── │ ├── CharacterService.ts
├── │ ├── │ ├── │ ├── CombatEngine.ts
├── │ ├── │ ├── │ ├── AIService.ts
├── │ ├── │ ├── │ └── StorageService.ts
├── │ ├── │ ├──
├── │ ├── │ ├── types/         # 💬 TypeScript Интерфейсы
├── │ ├── │ ├── │ ├── index.ts
├── │ ├── │ ├── │ └── Character.ts, etc.
├── │ ├── │ ├──
├── │ ├── │ ├── utils/         # 🔧 Утилиты
├── │ ├── │ ├── │ ├── dice.ts
├── │ ├── │ ├── │ ├── calculations.ts
├── │ ├── │ ├── │ ├── validation.ts
├── │ ├── │ ├── │ └── logger.ts
├── │ ├── │ ├──
├── │ ├── │ ├── middleware/    # 👨 Middlewares
├── │ ├── │ ├── │ ├── auth.ts
├── │ ├── │ ├── │ ├── errorHandler.ts
├── │ ├── │ ├── │ └── cors.ts
├── │ ├── │ ├──
├── │ ├── │ └── data/          # 📋 Игровые Данные
├── │ ├── │     ├── dnd-5e-rules.json
├── │ ├── │     └── custom-content.json
├── │ └──
├── │ └── dist/                # Скомпилированный вывод
├──
├── frontend/                  # 🌟 Next.js Приложение
├── │ ├── .env.local.example   # Шаблон фронтенд окружения
├── │ ├── .gitignore           # Фронтенд gitignore
├── │ ├── package.json         # Зависимости
├── │ ├── tsconfig.json        # TypeScript конфиг
├── │ ├── next.config.js       # Next.js конфиг
├── │ ├── tailwind.config.ts   # Tailwind CSS конфиг
├── │ ├── postcss.config.js    # PostCSS конфиг
├── │ ├──
├── │ ├── app/                 # 📖 Страницы & Макеты
├── │ ├── │ ├── layout.tsx      # Root макет
├── │ ├── │ ├── page.tsx        # Главная страница
├── │ ├── │ ├── globals.css     # Глобальные стили
├── │ ├── │ ├──
├── │ ├── │ ├── world-select/   # Выбор мира
├── │ ├── │ ├── character-create/ # 3-шаговый мастер
├── │ ├── │ ├── game/           # 🎲 Игровая сессия
├── │ ├── │ └── custom-content/ # 📄 Хаб кастомного контента
├── │ ├──
├── │ ├── components/          # ⚡ React Компоненты
├── │ ├── │ ├── GameChat.tsx
├── │ ├── │ ├── CharacterStats.tsx
├── │ ├── │ ├── CombatPanel.tsx
├── │ ├── │ ├── ActionButtons.tsx
├── │ ├── │ ├── WorldCard.tsx
├── │ ├── │ ├── CustomRaceForm.tsx
├── │ ├── │ ├── CustomClassForm.tsx
├── │ ├── │ ├── CustomFeatForm.tsx
├── │ ├── │ ├── RulesPreview.tsx
├── │ ├── │ └── SettingsPanel.tsx
├── │ ├──
├── │ ├── lib/                 # 📦 Утилиты & Сервисы
├── │ ├── │ ├── api.ts         # API клиент
├── │ ├── │ ├── types.ts       # Общие TypeScript типы
├── │ ├── │ ├── store.ts       # Zustand хранилище
├── │ ├── │ ├── validation.ts  # Валидация входа
├── │ ├── │ ├── customContent.ts
├── │ ├── │ ├── dnd-rules-client.ts
├── │ ├── │ └── utils.ts       # Помощники
├── │ ├──
├── │ ├── public/              # 📄 Статические Ассеты
├── │ ├── │ ├── dnd-5e-rules.json
├── │ ├── │ └── favicon.ico
├── │ ├──
├── │ └── .next/               # Next.js вывод сборки
```

## Ключевые Файлы

### Бэкенд Основные Файлы

1. **main.ts** - Инициализация Fastify сервера, регистрация маршрутов
2. **RulesEngine.ts** - Интерпретатор основных правил D&D 5e и логика мерджинга
3. **CustomContentManager.ts** - CRUD и валидация для пользовательского контента
4. **GameManager.ts** - Управление игровыми сессиями
5. **CharacterService.ts** - Создание персонажей и расчёты

### Фронтенд Основные Файлы

1. **store.ts** - Zustand управление состоянием
2. **api.ts** - Axios API клиент wrapper
3. **layout.tsx** - Root макет с навигацией
4. **page.tsx** (game/page.tsx) - Основной игровой цикл
5. **character-create/page.tsx** - 3-шаговый мастер создания персонажа

## Поток Данных

### Поток Создания Персонажа

```
Фронтенд (character-create) 
  ↓ POST /api/character/create
Бэкенд (routes/character.ts)
  ↓ CharacterService.createCharacter()
RulesEngine.getMergedRules()
  ↓ Основные + Кастомные расы/классы
Объект персонажа создан
  ↓ Сохранён в сессию
Фронтенд получает персонажа
```

### Поток Пользовательского Контента

```
Фронтенд (custom-content/races/create)
  ↓ POST /api/custom-races
Бэкенд (routes/custom-races.ts)
  ↓ CustomContentManager.createRace()
Валидация (имя расы, скорость, бонусы)
  ↓ Сохранено в custom-content.json
Фронтенд получает успех
  ↓ Редирект на список

Когда игра начинается:
RulesEngine загружает основные + кастомные
  ↓ Мержит расы, классы, особенности
  ↓ Создатель персонажа показывает оба
```

### Поток Игровой Сессии

```
Фронтенд (game/page.tsx)
  ↓ GET /api/game/session/:sessionId
GameManager.getSession()
  ↓ Показывает нарратив и опции

Игрок берёт действие (атаку, уклон, и т.д.)
  ↓ POST /api/game/action
GameManager.processAction()
  ↓ RulesEngine разрешает действие
  ↓ AI генерирует нарратив
Фронтенд обновляет UI
  ↓ Следующий ход
```

## Технологический Стек Резюме

### Фронтенд
- **Next.js 14**: App Router, SSR
- **React 18**: Последние возможности, хуки
- **TypeScript**: Полная безопасность типов
- **Zustand**: Лёгкое управление состоянием
- **Tailwind CSS**: Полезный-first стилей
- **Axios**: HTTP клиент

### Бэкенд
- **Fastify**: Высокопроизводительный HTTP сервер
- **TypeScript**: Полная безопасность типов
- **OpenAI API**: GPT-4 интеграция (готов)
- **Node.js**: Рантайм
- **JSON**: MVP хранилище (расширяется)

### Инструменты Разработки
- **npm/pnpm**: Управление пакетами
- **TypeScript**: Компиляция & проверка
- **Git**: Контроль версий
- **ESM**: Современная модульная система

## Рассмотрение Production

### Развёртывание
- Бэкенд: Развёртывание на Node.js хостинг (Render, Railway, Heroku)
- Фронтенд: Развёртывание на Vercel, Netlify или подобном
- База данных: Миграция на MongoDB или PostgreSQL
- AI: Настройка управления ключом OpenAI API

### Производительность
- Реализуйте кеширование для мёржа правил
- Очистите старые игровые сессии
- Добавьте очереди запросов для AI API
- Рассмотрите CDN для статических ассетов

### Безопасность
- Добавьте систему аутентификации
- Валидируйте все входы
- Ограничение частоты запросов
- Конфигурация CORS
- Управление переменными окружения

## Быстрая Навигация

- **API Документация**: Смотри [API.md](API.md)
- **Установка**: Смотри [INSTALLATION.md](INSTALLATION.md)
- **Быстрый Старт**: Смотри [QUICKSTART.md](QUICKSTART.md)
- **Разработка**: Смотри [DEVELOPMENT.md](DEVELOPMENT.md)
- **Главное README**: Смотри [README.md](README.md)

---

**Статус**: Production Ready | **Последнее обновление**: 2025-12-14
