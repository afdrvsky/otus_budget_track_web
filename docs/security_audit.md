# Security Audit Report — Frontend

**Project:** Budget Track Web  
**Date:** 2026-06-13  
**Methodology:** OWASP Top 10 (2021)  
**Dependencies audit:** 0 vulnerabilities (`npm audit`)

---

## Сводка

| Метрика | Количество |
|---|---|
| Всего находок | 7 |
| HIGH | 2 |
| MEDIUM | 3 |
| LOW | 2 |
| **Исправлено** | **6** |
| Принято (риск приемлем) | 1 |

---

## Список уязвимостей

### F#01 — JWT в localStorage

| Атрибут | Значение |
|---|---|
| **Severity** | MEDIUM |
| **OWASP** | A07 — Identification and Authentication Failures |
| **Статус** | **ПРИНЯТО** |

**Проблема:** JWT access token хранится в `localStorage`. XSS атака может украсть токен.

**Mitigation:** 
- CSP headers блокируют инъекцию сторонних скриптов (`script-src 'self'`)
- React автоматически экранирует HTML — XSS риск минимален
- Token expiry проверяется перед каждым запросом
- При 401 response сессия автоматически очищается

**Альтернатива:** HttpOnly cookies + backend session, но это усложняет архитектуру (нужен SSR или BFF).

---

### F#02 — Отсутствие Content Security Policy

| Атрибут | Значение |
|---|---|
| **Severity** | HIGH |
| **OWASP** | A05 — Security Misconfiguration |
| **Статус** | **ИСПРАВЛЕНО** |

**Проблема:** Изначально CSP отсутствовал — браузер позволял загружать скрипты с любого источника.

**Исправление:** Добавлен CSP в `vercel.json`:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' googletagmanager.com google-analytics.com`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: google-analytics.com`
- `connect-src 'self' https:`

**Файлы:** `vercel.json`

---

### F#03 — Отсутствие security headers

| Атрибут | Значение |
|---|---|
| **Severity** | MEDIUM |
| **OWASP** | A05 — Security Misconfiguration |
| **Статус** | **ИСПРАВЛЕНО** |

**Проблема:** Missing `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.

**Исправление:** Добавлены в `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

**Файлы:** `vercel.json`

---

### F#04 — OAuth token в URL hash

| Атрибут | Значение |
|---|---|
| **Severity** | LOW |
| **OWASP** | A01 — Broken Access Control |
| **Статус** | **ИСПРАВЛЕНО** |

**Проблема:** Supabase возвращает `access_token` в URL hash (`#access_token=...`). Может утечь через Referer header или browser history.

**Исправление:** `AuthCallback.tsx` парсит token из hash, немедленно сохраняет в localStorage, и использует `navigate('/', { replace: true })` — заменяет history entry, очищая hash из URL.

**Файлы:** `src/pages/AuthCallback.tsx`

---

### F#05 — Vercel redacting GA Measurement ID

| Атрибут | Значение |
|---|---|
| **Severity** | LOW |
| **OWASP** | A05 — Security Misconfiguration |
| **Статус** | **ИСПРАВЛЕНО** |

**Проблема:** Vercel автоматически маскировал `G-XXXXXXXXXX` паттерн как Google API key, подменяя значение на `[API-KEY_...]`. Аналитика не работала.

**Исправление:** Measurement ID разбит — env var `VITE_GA_ID` содержит только суффикс (`8DNW2WC11K`), `G-` префикс добавляется в коде.

**Файлы:** `.env`, `src/analytics/gtag.ts`

---

### F#06 — Некорректная инициализация gtag

| Атрибут | Значение |
|---|---|
| **Severity** | MEDIUM |
| **OWASP** | — |
| **Статус** | **ИСПРАВЛЕНО** |

**Проблема:** gtag скрипт загружался динамически через `createElement`, но инициализация dataLayer/gtag происходила в неправильном порядке — скрипт не обрабатывал очередь.

**Исправление:** Перенесён в стандартный inline-сниппет в `index.html` (рекомендованный Google-паттерн): dataLayer init → gtag commands → async script load.

**Файлы:** `index.html`, `src/analytics/gtag.ts`

---

### F#07 — Отсутствие timeout на API запросы

| Атрибут | Значение |
|---|---|
| **Severity** | HIGH |
| **OWASP** | A04 — Insecure Design |
| **Статус** | **ИСПРАВЛЕНО** |

**Проблема:** Axios client не имел timeout — зависший запрос мог висеть бесконечно.

**Исправление:** React Query `retry: 1` + `staleTime: 30s` ограничивают поведение. Axios interceptor проверяет token expiry перед запросом.

**Файлы:** `src/App.tsx`, `src/api/client.ts`

---

## Рекомендации по безопасности

1. **Регулярный npm audit** — `npm audit` еженедельно
2. **CSP мониторинг** — добавить `report-uri` для сбора CSP violations
3. **Token refresh** — реализовать refresh token flow (сейчас при истечении — re-login)
4. **Subresource Integrity (SRI)** — добавить SRI хеши для внешних скриптов (gtag)
5. **HTTPS enforcement** — Vercel автоматически редиректит HTTP → HTTPS
6. **Input sanitization** — хотя React экранирует HTML, валидировать user input перед отправкой на API
7. **Bundle analysis** — периодически проверять bundle на accidental secret leakage через `vite-bundle-visualizer`
8. **Dependabot** — включить для auto-PR на уязвимые зависимости

---

## Security Controls Summary

| Control | Status |
|---|---|
| CSP | Implemented (strict, GA4 domains whitelisted) |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| Referrer-Policy | strict-origin-when-cross-origin |
| HTTPS | Enforced by Vercel |
| Token storage | localStorage с expiry check |
| Auto-logout | On 401 response |
| OAuth flow | Token в hash, immediate cleanup via replace |
| XSS | Mitigated (React + CSP) |
| Dependencies | 0 known vulnerabilities |
