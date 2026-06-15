# Budget Track Web

Веб-приложение для учёта личных финансов: доходы, расходы, категории, аналитика.

**Production:** https://otus-budget-track-web.vercel.app

**Backend:** https://github.com/afdrvsky/otus_budget_track_backend

---

## Технологии

- **React 18** + TypeScript
- **Vite** — сборка и dev-сервер
- **Tailwind CSS** — стили
- **React Router v6** — маршрутизация
- **TanStack Query** — server state
- **Axios** — HTTP-клиент
- **Google Analytics 4** — аналитика
- **Jest** + React Testing Library — тесты

---

## Быстрый старт (вместе с бэкендом)

Фронтенд требует запущенный backend API. Ниже — инструкция, как поднять оба проекта локально и проверить работу.

### 1. Клонировать оба репозитория

```bash
git clone https://github.com/afdrvsky/otus_budget_track_backend.git
git clone https://github.com/afdrvsky/otus_budget_track_web.git
```

### 2. Поднять бэкенд

```bash
cd otus_budget_track_backend
npm install
cp .env.example .env
```

Заполнить `.env` (см. [README бэкенда](https://github.com/afdrvsky/otus_budget_track_backend#настройка) — нужны Supabase project, Google OAuth credentials).

```bash
npm run dev    # стартует на http://localhost:8080
```

### 3. Поднять фронтенд

```bash
cd ../otus_budget_track_web
npm install
cp .env.example .env
```

В `.env` проверить `VITE_API_URL=http://localhost:8080/api`.

```bash
npm run dev    # стартует на http://localhost:5173
```

### 4. Проверить

Открыть http://localhost:5173:
1. **Регистрация** — создаёт аккаунт, сразу даёт 13 дефолтных категорий
2. **Вход** — email/password или Google OAuth
3. **Добавить транзакцию** — `/add`
4. **Список операций** — `/` (Dashboard)
5. **Статистика** — `/stats` (круговые диаграммы)
6. **Категории** — `/categories` (создание, редактирование, удаление)

---

## Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_URL` | URL backend API | `http://localhost:8080/api` |
| `VITE_GA_ID` | Google Analytics 4 ID **без** `G-` префикса (например `8DNW2WC11K`) | — |

> **Почему без `G-`?** Vercel автоматически маскирует полные `G-XXXXXXXXXX` паттерны как API-ключи. Префикс добавляется в коде (`src/analytics/gtag.ts`).

---

## Команды

```bash
npm run dev      # Dev-сервер (http://localhost:5173)
npm run build    # Production-сборка
npm run preview  # Предпросмотр production-сборки
npm test         # Тесты
npm run lint     # ESLint
```

---

## Маршруты

| Путь | Страница | Auth |
|---|---|---|
| `/` | Dashboard — баланс, список транзакций | Да |
| `/add` | Добавление транзакции | Да |
| `/stats` | Статистика (диаграммы доходов/расходов) | Да |
| `/categories` | Управление категориями | Да |
| `/profile` | Профиль | Да |
| `/login` | Вход (email + Google) | Нет |
| `/register` | Регистрация | Нет |
| `/recover` | Восстановление пароля | Нет |
| `/auth/callback` | OAuth callback (Google) | Нет |

---

## Структура проекта

```
src/
  api/            — Axios client, API-функции, React Query хуки
  analytics/      — Google Analytics 4 (gtag)
  auth/           — AuthContext (login, register, OAuth, logout)
  components/     — UI-компоненты (Header, TransactionList, Statistics, и др.)
  pages/          — Страницы (Dashboard, Login, Register, и др.)
  utils/          — TypeScript типы, хелперы
  App.tsx         — Корневой компонент (Router, GA4, QueryClient)
  main.tsx        — Точка входа
  routes.tsx      — Конфигурация роутов + ProtectedRoute
```

---

## Аутентификация

### Email / Password
- Регистрация → `POST /api/auth/register`
- Вход → `POST /api/auth/login`
- JWT хранится в `localStorage`

### Google OAuth
1. Клик «Sign in with Google» → `GET /api/auth/google` (backend)
2. Backend редиректит на Supabase OAuth URL
3. Supabase → Google consent screen
4. Google → Supabase callback
5. Supabase → `/auth/callback#access_token=...` (frontend)
6. Frontend парсит token, сохраняет, редиректит на `/`

---

## CI/CD

GitHub Actions: lint → typecheck → test → build → deploy (Vercel).

Подробности: [docs/integration_documentation.md](docs/integration_documentation.md)

## Безопасность

Подробности: [docs/security_audit.md](docs/security_audit.md)
