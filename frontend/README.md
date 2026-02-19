# Format Management - Frontend

Vue 3 + TypeScript + Vite приложение для управления заявками.

## Требования

- Node.js 16+
- npm или yarn

## Установка

```bash
cd frontend
npm install
```

## Запуск dev-сервера

```bash
npm run dev
```

Dev сервер будет доступен на `http://localhost:5173`

## Build для production

```bash
npm run build
```

Сгенерирует оптимизированные файлы в папке `dist/`.

## Структура проекта

```
src/
├── components/          # Vue компоненты
│   ├── layout/         # Layout компоненты
│   ├── orders/         # Order компоненты
│   ├── users/          # User компоненты
│   ├── analytics/      # Analytics компоненты
│   └── ui/             # UI компоненты
├── views/              # Page компоненты
├── services/           # API сервисы
├── stores/             # Pinia stores (state management)
├── router/             # Vue Router конфигурация
├── App.vue             # Root component
├── main.ts             # Entry point
└── index.css          # Global styles with Tailwind
```

## Основные библиотеки

- **Vue 3**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Pinia**: State management
- **Vue Router**: Routing
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS

## Документация

Полная документация разработчика с описанием всех методов, компонентов и сервисов доступна в [DEVELOPER.md](../DEVELOPER.md)
