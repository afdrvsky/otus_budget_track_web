# Budget Track Web

Веб-приложение для учёта личного бюджета. Добавляйте доходы и расходы, категоризируйте их и просматривайте статистику.

## Технологический стек

- **React 18** + TypeScript
- **Vite** — сборка и dev-сервер
- **Tailwind CSS** — стилизация
- **React Router v6** — маршрутизация
- **TanStack Query (React Query)** — server state
- **Axios** — HTTP клиент
- **Google Analytics 4** — продуктовая аналитика
- **Jest** + React Testing Library — тестирование
- **ESLint** + Prettier — линтинг и форматирование

## Установка

```bash
npm install
```

## Настройка

```bash
cp .env.example .env
```

| Переменная | Описание |
|---|---|
| `VITE_API_URL` | URL backend API (например `http://localhost:8080/api`) |
| `VITE_GA_ID` | Google Analytics 4 ID **без** `G-` префикса (например `8DNW2WC11K`) |

> **Важно:** `VITE_GA_ID` указывается без `G-` префикса. Префикс добавляется в коде.
> Это обход redacting в Vercel — он маскирует полные `G-XXXXXXXXXX` паттерны как ключи API.

## Запуск

```bash
npm run dev      # Dev-сервер
npm run build    # Production-сборка
npm run preview  # Предпросмотр production-сборки
```

## Тестирование

```bash
npm test              # Запуск всех тестов
npm test -- --watch   # Watch mode
npm test -- --coverage # С покрытием
```

## Линтинг и форматирование

```bash
npm run lint          # ESLint
npm run lint:fix      # ESLint с автоисправлением
npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"  # Проверка
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"  # Форматирование
```

## Маршруты

| Путь | Страница | Auth |
|---|---|---|
| `/` | Dashboard (баланс, список транзакций) | Да |
| `/add` | Добавление транзакции | Да |
| `/stats` | Статистика | Да |
| `/categories` | Управление категориями | Да |
| `/profile` | Профиль | Да |
| `/login` | Вход (email + Google) | Нет |
| `/register` | Регистрация | Нет |
| `/recover` | Восстановление пароля | Нет |
| `/auth/callback` | OAuth callback (Google) | Нет |

## Структура проекта

```
/src
  /api
    api.ts              # API-функции (auth, transactions, categories)
    client.ts           # Axios instance, interceptors, localStorage
    hooks.ts            # React Query хуки (useTransactions, useCategories, etc.)
  /analytics
    gtag.ts             # Google Analytics 4 утилита
  /auth
    AuthContext.tsx     # Auth state (login, register, OAuth, logout)
  /components
    Header.tsx          # Навигация
    TransactionList.tsx # Список транзакций
    AddTransactionForm.tsx
    EditTransactionModal.tsx
    CategoryCard.tsx
    CategoryForm.tsx
    CategorySelect.tsx
    Statistics.tsx      # Круговые диаграммы
    AuthButton.tsx      # Google OAuth кнопка
    ConfirmDialog.tsx
  /pages
    Dashboard.tsx       # Главная страница
    AddTransaction.tsx
    StatisticsPage.tsx
    CategoriesPage.tsx
    ProfilePage.tsx
    LoginPage.tsx
    RegisterPage.tsx
    RecoverPasswordPage.tsx
    AuthCallback.tsx    # OAuth callback handler
  /utils
    types.ts            # TypeScript типы
    helpers.ts          # Утилиты
  App.tsx               # Корневой компонент (BrowserRouter, GA4)
  main.tsx              # Точка входа
  routes.tsx            # Конфигурация роутов + ProtectedRoute
```

## Аутентификация

### Email/Password
- Регистрация через `POST /api/auth/register`
- Вход через `POST /api/auth/login`
- JWT хранится в `localStorage` (`budget_track_token`)
- Пользователь в `localStorage` (`budget_track_session`)

### Google OAuth
1. Frontend → `GET /api/auth/google` (backend)
2. Backend → Supabase OAuth URL redirect
3. Supabase → Google consent screen
4. Google → Supabase callback
5. Supabase → Frontend `/auth/callback#access_token=...`
6. Frontend парсит token из hash, сохраняет, перенаправляет на `/`

## Аналитика (Google Analytics 4)

Отслеживаемые события:
- `page_view` — при смене маршрута
- `login` — вход (method: email/google)
- `sign_up` — регистрация
- `logout` — выход
- `transaction_created/updated/deleted`
- `category_created/updated/deleted`

Подробности: [docs/security_audit.md](docs/security_audit.md)

## CI/CD

GitHub Actions pipeline: lint → typecheck → test → build. Deploy через Vercel.

Подробности: [docs/integration_documentation.md](docs/integration_documentation.md)
