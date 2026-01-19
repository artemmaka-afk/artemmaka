# Artemmaka Portfolio

AI-арт портфолио с калькулятором стоимости и админ-панелью.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: TanStack Query

## Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/artemmaka-portfolio.git
cd artemmaka-portfolio
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните значениями из вашего Supabase проекта:

```bash
cp .env.example .env
```

Откройте `.env` и заполните:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

### 4. Настройка Supabase

#### Создание таблиц

Выполните миграции из папки `supabase/migrations/` в вашем Supabase проекте.

#### Edge Functions

Деплой Edge Functions:

```bash
supabase functions deploy assign-first-admin
supabase functions deploy check-admin
supabase functions deploy send-telegram-notification
```

#### Secrets для Edge Functions

Настройте следующие секреты в Supabase:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN="your-bot-token"
supabase secrets set TELEGRAM_CHAT_ID="your-chat-id"
```

### 5. Запуск

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:8080`

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── admin/          # Компоненты админ-панели
│   └── ui/             # Shadcn UI компоненты
├── hooks/              # Кастомные хуки
├── integrations/       # Интеграции (Supabase)
├── lib/                # Утилиты
├── pages/              # Страницы приложения
└── test/               # Тесты

supabase/
├── functions/          # Edge Functions
└── migrations/         # SQL миграции
```

## Функциональность

- 📁 **Портфолио** — галерея проектов с фильтрацией по тегам
- 💰 **Калькулятор** — расчёт стоимости проекта
- 🔐 **Админ-панель** — управление контентом и проектами
- 📱 **Telegram уведомления** — заявки приходят в Telegram
- 🎨 **Динамическая типографика** — настройка шрифтов из админки

## Деплой

### Lovable

Откройте [Lovable](https://lovable.dev/projects/ee659bad-b377-4c45-b955-896cf3065fc9) и нажмите Share → Publish.

### Другие платформы

Проект можно развернуть на Vercel, Netlify или любой другой платформе, поддерживающей Vite:

```bash
npm run build
```

Статические файлы будут в папке `dist/`.

## Лицензия

MIT
