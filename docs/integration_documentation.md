# Integration Documentation — Frontend

## 1. CI/CD

### Pipeline

```
push/PR to master
    │
    ▼
┌─────────────────┐
│ Lint & Format   │  eslint → prettier:check
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────────┐ ┌───────┐
│ TypeCheck│ │  Test │  jest --coverage
└────┬─────┘ └───┬───┘
     └────┬──────┘
          ▼
    ┌───────────┐
    │   Build   │  vite build
    └───────────┘
```

Файл конфигурации: `.github/workflows/ci.yml`

### Triggers

- **Push to `master`**
- **Pull request to `master`**

Concurrency: одна активная pipeline per branch (cancel-in-progress).

### Jobs

| Job | Что делает |
|---|---|
| `lint-and-format` | ESLint, Prettier check |
| `typecheck` | `tsc --noEmit` |
| `test` | Jest с coverage, загрузка артефакта |
| `build` | Vite production build, загрузка dist/ |

### Деплой на Vercel

Vercel автоматически деплоит при push to `master` через GitHub integration.

---

## 2. Интеграции сервисов

### Backend API (Axios)

Конфигурация: `src/api/client.ts`

```typescript
const client = axios.create({
  baseURL: getApiUrl(), // VITE_API_URL
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});
```

- **Request interceptor:** добавляет `Authorization: Bearer <token>` из localStorage
- **Response interceptor:** при 401 очищает сессию и диспатчит `auth:unauthorized` event
- **Token expiry:** проверяет `expires_at` перед каждым запросом

### React Query (TanStack Query)

Конфигурация: `src/App.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});
```

Хуки: `useTransactions`, `useCreateTransaction`, `useUpdateTransaction`, `useDeleteTransaction`, `useCategories`, `useAddCategory`, `useUpdateCategory`, `useDeleteCategory`.

### Supabase Auth (OAuth)

Google OAuth flow:

1. Frontend → `window.location.href = getGoogleLoginUrl()` → `/api/auth/google`
2. Backend → Supabase OAuth URL redirect
3. Supabase → Google consent screen
4. Google → Supabase callback
5. Supabase → Frontend `/auth/callback#access_token=...`
6. `AuthCallback.tsx` парсит token из hash → `handleOAuthCallback()` в `AuthContext`
7. `AuthContext` сохраняет session + user → redirect на `/`

### Google Analytics 4

Конфигурация: `src/analytics/gtag.ts` + `index.html`

Инициализация через inline-сниппет в `index.html` (стандартный Google-паттерн). События через `GAEvents` utility — вызываются из `AuthContext` и React Query hooks.

Подробности: [ANALYTICS.md](ANALYTICS.md)

---

## 3. Мониторинг

### Vercel Analytics

Встроенный dashboard: Visitors, Page Views, Top Pages. Доступен в Vercel Dashboard.

### Google Analytics 4

- **Realtime** — активные пользователи, события в реальном времени
- **Reports** — Engagement, Demographics, Tech
- **Events** — кастомные события (login, transaction_created, etc.)

Проверка работы:
1. DevTools → Network → фильтр `collect` — POST запросы к `analytics.google.com/g/collect`
2. GA4 → Reports → Realtime — данные через 1-2 минуты

### Vercel Logs

Dashboard → Functions → Logs (для serverless функций при необходимости).

---

## 4. Примеры конфигураций

### `.env` (локальная разработка)

```env
VITE_API_URL=http://localhost:8080/api
VITE_GA_ID=XXXXXXXXXX
```

### Vercel Environment Variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://otusbudgettrackbackend-production.up.railway.app/api` |
| `VITE_GA_ID` | `8DNW2WC11K` (без `G-`!) |

### `vercel.json` (headers & security)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https: http://localhost:8080; font-src 'self'"
        }
      ]
    }
  ]
}
```

### gtag inline-сниппет (`index.html`)

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-%VITE_GA_ID%', { send_page_view: false });
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-%VITE_GA_ID%"></script>
```
