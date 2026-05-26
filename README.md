# Budget Track Web

Веб-приложение для учёта личного бюджета. Добавляйте доходы и расходы, категоризируйте их и просматривайте статистику.

## Технологический стек

- **React 18** + TypeScript
- **Vite** — сборка и dev-сервер
- **Tailwind CSS** — стилизация
- **React Router v6** — маршрутизация
- **Jest** + React Testing Library — тестирование
- **ESLint** + Prettier — линтинг и форматирование

## Установка

```bash
npm install
```

## Запуск

```bash
# Dev-сервер (http://localhost:3000)
npm run dev

# Production-сборка
npm run build

# Предпросмотр production-сборки
npm run preview
```

## Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск с отслеживанием изменений
npm test -- --watch
```

## Линтинг и форматирование

```bash
# Проверка кода
npm run lint

# Автоисправление
npm run lint:fix

# Форматирование Prettier
npm run format
```

## Маршруты

| Путь       | Страница              |
|------------|-----------------------|
| `/`        | Главная (Dashboard)   |
| `/add`     | Добавление транзакции |
| `/stats`   | Статистика            |

## Структура проекта

```
/src
  /api
    api.ts              # API-слой с localStorage и mock-данными
  /assets
  /components
    Header.tsx          # Навигация
    TransactionList.tsx  # Список транзакций
    CategorySelect.tsx  # Выбор категории
    AddTransactionForm.tsx  # Форма добавления
    Statistics.tsx      # Круговые диаграммы
  /pages
    Dashboard.tsx       # Главная страница
    AddTransaction.tsx  # Страница добавления
    StatisticsPage.tsx  # Страница статистики
  /utils
    types.ts            # TypeScript типы
    helpers.ts          # Утилиты и хелперы
  App.tsx               # Корневой компонент
  main.tsx              # Точка входа
  routes.tsx            # Конфигурация роутов
```

## Функциональность

- Добавление расходов и доходов с выбором категории
- Просмотр списка операций с фильтрацией по дате, типу и категории
- Удаление транзакций
- Визуализация статистики (круговые диаграммы расходов/доходов по категориям)
- Адаптивный дизайн (десктоп и мобильные)
- Хранение данных в localStorage с mock-данными при первом запуске
