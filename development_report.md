# Отчёт о разработке Budget Track Web

## Описание процесса

Проект — frontend-часть full-stack приложения для учёта личных финансов. Разработка велась от прототипа на localStorage к production-версии с реальным backend API, аутентификацией, аналитикой и CI/CD.

**Backend:** https://github.com/afdrvsky/otus_budget_track_backend  
**Production:** https://otus-budget-track-web.vercel.app

---

## Этапы разработки

### 1. Конфигурация проекта

- `package.json` — React 18, Vite, Tailwind CSS, React Router v6, TanStack Query, Axios, Jest
- `vite.config.ts` — dev-сервер, proxy
- `tailwind.config.ts` — палитра цветов (primary, expense, income)
- `tsconfig.json` — strict TypeScript
- `.eslintrc.cjs` + `.prettierrc` — линтинг и форматирование
- `jest.config.cjs` — Jest с ts-jest, moduleNameMapper для `@tanstack/react-query` и analytics-моков
- `.env.example` — шаблон переменных окружения
- `vercel.json` — SPA rewrites, CSP и security headers

### 2. Типы данных

`src/utils/types.ts` — полная типизация в соответствии с backend API:

- `Transaction` — с joined `categories` (name, type, color от backend JOIN)
- `Category` — поля из Supabase (`id`, `user_id`, `is_default`, `created_at`, `updated_at`)
- `AuthUser`, `AuthSession`, `AuthResponse` — типы для аутентификации
- `TransactionFormData`, `FilterState` — UI-типы

### 3. API-слой (Axios + backend)

Архитектура состоит из трёх модулей:

**`src/api/client.ts`** — Axios instance:
- `baseURL` из `VITE_API_URL` (fallback `http://localhost:8080/api` в dev)
- Request interceptor: добавляет `Authorization: Bearer <token>`, проверяет expiry перед запросом
- Response interceptor: при 401 очищает сессию и диспатчит `auth:unauthorized` event (не срабатывает для `/auth/login`, `/auth/register`, `/auth/recover`)
- Session хранится в `localStorage`: `budget_track_token` (JWT), `budget_track_session` (user)

**`src/api/api.ts`** — API-функции (чистые HTTP-вызовы):
- Auth: `login`, `register`, `logout`, `recoverPassword`, `fetchCurrentUser`, `getGoogleLoginUrl`
- Transactions: `fetchTransactions` (с фильтрами), `createTransaction`, `updateTransaction`, `deleteTransaction`
- Categories: `fetchCategories` (опционально `?type=`), `addCategory`, `updateCategory`, `deleteCategory`

**`src/api/hooks.ts`** — React Query обёртки:
- `useTransactions(filters)`, `useCategories(type)` — запросы с кэшированием
- `useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction` — мутации с `invalidateQueries`
- `useAddCategory`, `useUpdateCategory`, `useDeleteCategory` — мутации для категорий
- Все мутации отправляют GA4 events через `GAEvents.*`

### 4. Аутентификация

**`src/auth/AuthContext.tsx`** — глобальный auth state через React Context:
- При инициализации: проверка `session.expired_at` → если истёк, очистка и logout
- При монтировании: `fetchCurrentUser()` для валидации токена на сервере
- Слушатель `auth:unauthorized` → очистка сессии, редирект на `/login`
- Методы: `login`, `register`, `logout`, `loginWithGoogle`, `handleOAuthCallback`, `refreshUser`
- GA4 events: `login` (method: email/google), `sign_up`, `logout`

**Google OAuth flow:**
1. `AuthButton` → `loginWithGoogle()` → `window.location.href = /api/auth/google` (backend)
2. Backend → Supabase → Google consent → Supabase callback
3. Supabase → frontend `/auth/callback#access_token=...&expires_in=...`
4. `AuthCallback.tsx` парсит hash, вызывает `handleOAuthCallback(token, expiresIn)`
5. Token сохраняется, `fetchCurrentUser()` загружает профиль, `navigate('/', { replace: true })` очищает hash

**ProtectedRoute** (`src/routes.tsx`):
- `loading=true` → спиннер «Проверка авторизации...»
- `!isAuthenticated` → `<Navigate to="/login" replace />`
- Защищены: `/`, `/add`, `/stats`, `/categories`, `/profile`

### 5. Компоненты

| Компонент | Назначение |
|---|---|
| `Header.tsx` | Навигация (NavLink), отображение пользователя, logout |
| `AddTransactionForm.tsx` | Форма с валидацией, переключатель расход/доход, загрузка категорий через `useCategories` |
| `TransactionList.tsx` | Список транзакций с цветными индикаторами, кнопки edit/delete |
| `EditTransactionModal.tsx` | Модальное окно редактирования транзакции |
| `Statistics.tsx` | SVG круговые диаграммы доходов/расходов |
| `CategoryCard.tsx` | Карточка категории с edit/delete |
| `CategoryForm.tsx` | Модальная форма добавления/редактирования категории, палитра из 12 цветов |
| `CategorySelect.tsx` | Выпадающий список категорий |
| `AuthButton.tsx` | Кнопка «Sign in with Google» |
| `ConfirmDialog.tsx` | Переиспользуемый диалог подтверждения (нативный `<dialog>`) |

### 6. Страницы

| Страница | Функциональность |
|---|---|
| `Dashboard.tsx` | Баланс, доходы, расходы; фильтры (тип, категория, дата); пагинация по 20; список транзакций; FAB для мобильных |
| `AddTransaction.tsx` | Обёртка над `AddTransactionForm`, `createTransaction` → navigate `/` |
| `StatisticsPage.tsx` | Обёртка над `Statistics` с loading/error |
| `CategoriesPage.tsx` | CRUD категорий, группировка по типу (расходы/доходы), модальные окна |
| `LoginPage.tsx` | Форма входа email/password + Google OAuth, обработка error banners |
| `RegisterPage.tsx` | Форма регистрации |
| `RecoverPasswordPage.tsx` | Восстановление пароля |
| `AuthCallback.tsx` | Обработка OAuth callback из hash |
| `ProfilePage.tsx` | Профиль пользователя |

### 7. Утилиты (`src/utils/helpers.ts`)

- `formatAmount`, `formatDate` — форматирование через `Intl` (ru-RU, RUB)
- `calculateBalance`, `calculateTotalByType` — расчёт баланса
- `groupByCategory` — группировка транзакций по категориям (использует joined `categories.name/color`)
- `filterTransactions` — фильтрация по типу, категории, дате
- `groupCategoriesByType`, `getCategoryById`, `getCategoryName`, `getCategoryColor`
- `sanitizeApiError` — маппинг backend error codes на русские сообщения (`INVALID_CREDENTIALS`, `USER_EXISTS`, `CATEGORY_IN_USE`, и др.)
- `colorPalette` — 12 цветов для категорий

### 8. Google Analytics 4

**`src/analytics/gtag.ts`:**
- GA ID собирается из `G-` + `VITE_GA_ID` (без `G-` в env — обход Vercel redacting)
- `gaPageView`, `gaEvent` — обёртки над `window.gtag`
- `GAEvents` — типизированные методы: `login`, `register`, `logout`, `transactionCreated/Updated/Deleted`, `categoryCreated/Updated/Deleted`

Inline-сниппет в `index.html` инициализирует dataLayer и async-загружает gtag.js.

`App.tsx` содержит `AnalyticsListener`, который трекает `page_view` при смене маршрута.

---

## Маршруты

| Путь | Страница | Auth |
|---|---|---|
| `/` | Dashboard — баланс, фильтры, список транзакций | Да |
| `/add` | Добавление транзакции | Да |
| `/stats` | Статистика (круговые диаграммы) | Да |
| `/categories` | Управление категориями | Да |
| `/profile` | Профиль | Да |
| `/login` | Вход (email + Google) | Нет |
| `/register` | Регистрация | Нет |
| `/recover` | Восстановление пароля | Нет |
| `/auth/callback` | OAuth callback | Нет |

---

## Архитектура

### Управление состоянием

**Server state** — TanStack Query (React Query):
- `QueryClient` в `App.tsx` с `staleTime: 30s`, `retry: 1`, `refetchOnWindowFocus: false`
- Хуки в `src/api/hooks.ts` инкапсулируют запросы и мутации
- Мутации автоматически инвалидируют кэш (`invalidateQueries`) — UI обновляется без ручного refetch
- Категории и транзакции кэшируются отдельно — нет дублирования загрузок

**Auth state** — React Context (`AuthContext`):
- Глобальный провайдер оборачивает всё приложение
- Сессия в `localStorage` с проверкой expiry
- Auto-logout при 401 от любого API-запроса

**Local UI state** — `useState` в компонентах (фильтры, модальные окна, формы)

### Поток данных

```
User action → Component → useMutation/useQuery hook
  → api.ts (HTTP via Axios client.ts)
  → Backend API (Express + Supabase)
  → Response → React Query cache → Component re-render
  → GA4 event (в onSuccess мутации)
```

### Безопасность

- **CSP** в `vercel.json` — `script-src 'self' 'unsafe-inline' googletagmanager.com google-analytics.com`
- **Security headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- **JWT** — в `localStorage`, проверка expiry перед каждым запросом, auto-logout на 401
- **OAuth token** — парсится из hash, немедленно сохраняется, hash очищается через `navigate('/', { replace: true })`
- **HTTPS** — принудительно Vercel

---

## Тесты

4 набора, 24 теста (все проходят):

| Файл | Тестов | Что проверяет |
|---|---|---|
| `AddTransactionForm.test.tsx` | 3 | Отправка формы расхода, валидация пустой суммы, переключение на доход |
| `TransactionList.test.tsx` | 4 | Отображение транзакций, категорий и дат, пустое состояние, кнопки удаления |
| `ApiError.test.tsx` | 1 | Обработка ошибки при загрузке данных в Dashboard |
| `CategoryManagement.test.tsx` | 16 | Полный CRUD категорий (см. ниже) |

### Покрытие CategoryManagement.test.tsx (16 тестов)

**Отображение (2):**
- Список категорий загружается и отображается
- Группировка по типу (расходы / доходы)

**Дефолтные категории (2):**
- Кнопка «Удалить» скрыта для `is_default` категорий
- Метка «По умолчанию» отображается для дефолтных категорий

**Добавление (3):**
- Форма открывается при клике «Добавить»
- `addCategory` вызывается с корректными данными (name, type, color)
- Валидация пустого названия — форма не отправляется

**Редактирование (2):**
- Форма открывается с предзаполненными данными
- `updateCategory` вызывается с новым названием

**Удаление без транзакций (3):**
- Диалог подтверждения открывается, показывает «не содержит транзакций»
- `deleteCategory` вызывается при подтверждении
- Диалог закрывается при отмене, API не вызывается

**Удаление с транзакциями (4):**
- Диалог предлагает выбор: «Перенести в другую категорию» или «Удалить вместе с транзакциями»
- `deleteCategory` без `reassign_to` — при выборе «удалить вместе»
- `deleteCategory` с `reassign_to` — при выборе переноса в другую категорию
- Для переноса предлагаются только категории того же типа

Тесты используют React Testing Library + `userEvent`. Все mock'и возвращают данные в формате backend API (`Category`, `Transaction`).

---

## CI/CD

GitHub Actions pipeline: lint → typecheck → test → build → deploy (Vercel).

Подробности: [docs/integration_documentation.md](docs/integration_documentation.md)

---

## Адаптивность

- Tailwind responsive: `sm:` breakpoints
- Grid: `grid-cols-1 sm:grid-cols-2` (категории), `grid-cols-1 sm:grid-cols-3` (баланс), `grid-cols-2 sm:grid-cols-4` (фильтры)
- FAB-кнопка добавления видна только на мобильных (`sm:hidden`)
- Скрытие/отображение текста: `hidden sm:inline`, `sm:hidden`

---

## Проблемы и решения

| Проблема | Решение |
|---|---|
| ESLint не читал `.eslintrc.js` из-за `"type": "module"` | Переименован в `.eslintrc.cjs` |
| `@testing-library/jest-dom` матчеры не распознавались TypeScript | `import '@testing-library/jest-dom'` в каждом тесте |
| Vercel маскировал `G-XXXXXXXXXX` как API key | `VITE_GA_ID` хранится без `G-` префикса, добавляется в коде |
| gtag не инициализировался (race condition при динамической загрузке) | Перенесён в inline-сниппет в `index.html` по рекомендованному Google паттерну |
| OAuth callback не обновлял auth state | `handleOAuthCallback()` в `AuthContext` вместо прямой работы с localStorage |
| Backend endpoint `GET /api/user` отсутствовал | Добавлен на бэкенде, фронтенд использует `fetchCurrentUser()` |
| Сессия не очищалась при истёкшем токене | Проверка `expires_at` в request interceptor + auto-clear на 401 |
| Тесты падали из-за `import.meta` в gtag.ts | Создан `src/__mocks__/gtag.ts`, добавлен `moduleNameMapper` в jest.config |

---

## Выводы

### Достигнуто

- **Full-stack интеграция** — фронтенд работает с реальным backend API, не mock-данные
- **Server state management** — TanStack Query устраняет дублирование загрузок, автоматическое кэширование и инвалидация
- **Аутентификация** — email/password + Google OAuth через Supabase, защищённые маршруты, auto-logout
- **Аналитика** — GA4 с типизированными событиями для всех ключевых действий
- **Безопасность** — CSP, security headers, token expiry checks, hash cleanup
- **CI/CD** — автоматический deploy на Vercel при push
- **Адаптивность** — работает на мобильных и десктопе
- **Тесты** — 24 теста покрывают транзакции, категории (полный CRUD + перенос) и обработку ошибок

### Что можно улучшить

1. **Тестовое покрытие** — добавить тесты для AuthContext, helpers, OAuth callback, error handling в формах
2. **A11y** — `aria-label` для SVG-диаграмм, skip-nav, ловушки фокуса в модальных окнах
3. **Refresh token** — реализовать silent refresh вместо принудительного re-login
4. **Toast-уведомления** — единый механизм feedback вместо inline error баннеров
5. **Code splitting** — lazy loading страниц для уменьшения initial bundle
6. **404 маршрут** — catch-all `*` с понятной страницей
