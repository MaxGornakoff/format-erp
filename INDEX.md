# 📚 Format Management - Documentation Index

Полный индекс документации и быстрая навигация по проекту.

---

## 🗂️ Основные документы

### 📖 Главная документация

1. **[README.md](README.md)** - Главный README проекта
   - Описание проекта
   - Стек технологий
   - Структура проекта
   - Установка и запуск
   - Роли и возможности
   - API endpoints

2. **[DEVELOPER.md](DEVELOPER.md)** ⭐ **ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ**
   - Backend API методы (20+, с примерами)
   - Frontend Services (20+ методов)
   - Pinia Stores (28+ методов с примерами)
   - Components описание
   - Views описание
   - Router configuration
   - Authentication flow
   - Development workflow
   - **550+ строк полной документации**

3. **[QUICK_START.md](QUICK_START.md)** - За 5 минут до первого запуска
   - Быстрый старт backend
   - Быстрый старт frontend
   - Тестовые учетные данные
   - Полезные команды
   - Troubleshooting

4. **[PROGRESS.md](PROGRESS.md)** - Прогресс разработки
   - Статус всех фаз
   - Что завершено
   - Что осталось
   - Временная шкала

5. **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Статус реализации
   - Итоговая статистика
   - Чеклисты для каждого компонента
   - Метрики проекта
   - Достижения

---

## 🔙 Backend документация

### Backend Setup & Конфигурация

- **[backend/.env](backend/.env)** - Конфигурация (DATABASE, API_URL, etc.)
- **[backend/.env.example](backend/.env.example)** - Шаблон конфигурации
- **[backend/README.md](backend/README.md)** - Backend гайд
- **[backend/composer.json](backend/composer.json)** - Зависимости

### Database & Models

- **[backend/database/migrations/2014_10_12_000000_create_users_table.php](backend/database/migrations)** - Users таблица
- **[backend/database/migrations/2026_02_19_134312_create_orders_table.php](backend/database/migrations)** - Orders таблица
- **[backend/database/seeders/UserSeeder.php](backend/database/seeders/UserSeeder.php)** - Тестовые пользователи
- **[backend/app/Models/User.php](backend/app/Models/User.php)** - User модель
- **[backend/app/Models/Order.php](backend/app/Models/Order.php)** - Order модель

### Controllers & API

- **[backend/app/Http/Controllers/Api/AuthController.php](backend/app/Http/Controllers/Api/AuthController.php)**
  - register(), login(), logout(), me()

- **[backend/app/Http/Controllers/Api/OrderController.php](backend/app/Http/Controllers/Api/OrderController.php)**
  - index(), store(), show(), update(), destroy()

- **[backend/app/Http/Controllers/Api/UserController.php](backend/app/Http/Controllers/Api/UserController.php)**
  - index(), store(), show(), update(), destroy() (Admin only)

- **[backend/app/Http/Controllers/Api/AnalyticsController.php](backend/app/Http/Controllers/Api/AnalyticsController.php)**
  - dashboard(), ordersTrend(), roleStats()

### Authorization & Validation

- **[backend/app/Policies/OrderPolicy.php](backend/app/Policies/OrderPolicy.php)** - RBAC для заявок
- **[backend/app/Policies/UserPolicy.php](backend/app/Policies/UserPolicy.php)** - RBAC для пользователей
- **[backend/app/Http/Requests/](backend/app/Http/Requests/)** - Валидация (6 files)
  - RegisterRequest, LoginRequest, StoreOrderRequest, UpdateOrderRequest, StoreUserRequest, UpdateUserRequest

### Routing

- **[backend/routes/api.php](backend/routes/api.php)** - API маршруты

---

## 🖼️ Frontend документация

### Frontend Setup & Конфигурация

- **[frontend/.env](frontend/.env)** - Конфигурация (VITE_API_URL)
- **[frontend/.env.example](frontend/.env.example)** - Шаблон
- **[frontend/README.md](frontend/README.md)** - Frontend гайд
- **[frontend/package.json](frontend/package.json)** - Зависимости
- **[frontend/vite.config.ts](frontend/vite.config.ts)** - Vite конфигурация
- **[frontend/tsconfig.json](frontend/tsconfig.json)** - TypeScript конфигурация
- **[frontend/tailwind.config.js](frontend/tailwind.config.js)** - Tailwind CSS
- **[frontend/postcss.config.js](frontend/postcss.config.js)** - PostCSS

### Entry Point

- **[frontend/src/main.ts](frontend/src/main.ts)** - Entry point
- **[frontend/src/App.vue](frontend/src/App.vue)** - Root component
- **[frontend/src/index.css](frontend/src/index.css)** - Global styles

### Services (API Layer)

- **[frontend/src/services/api.ts](frontend/src/services/api.ts)** - Axios конфигурация
- **[frontend/src/services/authService.ts](frontend/src/services/authService.ts)** - 8 методов
- **[frontend/src/services/orderService.ts](frontend/src/services/orderService.ts)** - 6 методов
- **[frontend/src/services/userService.ts](frontend/src/services/userService.ts)** - 6 методов

### Stores (State Management)

- **[frontend/src/stores/authStore.ts](frontend/src/stores/authStore.ts)** - 13 методов + 4 computed
- **[frontend/src/stores/orderStore.ts](frontend/src/stores/orderStore.ts)** - 15 методов + 3 computed

### Router

- **[frontend/src/router/index.ts](frontend/src/router/index.ts)** - Route конфигурация с guards

### Components

**Layout:**
- **[frontend/src/components/layout/AppHeader.vue](frontend/src/components/layout/AppHeader.vue)** - Шапка
- **[frontend/src/components/layout/AppSidebar.vue](frontend/src/components/layout/AppSidebar.vue)** - Боковое меню

**Views (Pages):**
- **[frontend/src/views/LoginView.vue](frontend/src/views/LoginView.vue)** ✅ Готская
- **[frontend/src/views/RegisterView.vue](frontend/src/views/RegisterView.vue)** ✅ Готская
- **[frontend/src/views/DashboardView.vue](frontend/src/views/DashboardView.vue)** - Базовый
- **[frontend/src/views/OrdersView.vue](frontend/src/views/OrdersView.vue)** - Готско к разработке
- **[frontend/src/views/OrderDetailView.vue](frontend/src/views/OrderDetailView.vue)** - Готско к разработке
- **[frontend/src/views/UsersView.vue](frontend/src/views/UsersView.vue)** - Готско к разработке
- **[frontend/src/views/AnalyticsView.vue](frontend/src/views/AnalyticsView.vue)** - Готско к разработке
- **[frontend/src/views/NotFoundView.vue](frontend/src/views/NotFoundView.vue)** ✅ Готская

---

## 📋 Системные файлы

- **[.gitignore](.gitignore)** - Git ignore rules
- **[TZ.md](TZ.md)** - Техническое задание (спецификация)

---

## 🔍 Quick Navigation

### По Функциональности

**Аутентификация:**
- Backend: `backend/app/Http/Controllers/Api/AuthController.php`
- Frontend Service: `frontend/src/services/authService.ts`
- Frontend Store: `frontend/src/stores/authStore.ts`
- Frontend View: `frontend/src/views/LoginView.vue`, `RegisterView.vue`

**Управление заявками:**
- Backend: `backend/app/Http/Controllers/Api/OrderController.php`
- Policy: `backend/app/Policies/OrderPolicy.php`
- Model: `backend/app/Models/Order.php`
- Frontend Service: `frontend/src/services/orderService.ts`
- Frontend Store: `frontend/src/stores/orderStore.ts`
- Frontend View: `frontend/src/views/OrdersView.vue`

**Управление пользователями (Admin):**
- Backend: `backend/app/Http/Controllers/Api/UserController.php`
- Policy: `backend/app/Policies/UserPolicy.php`
- Model: `backend/app/Models/User.php`
- Frontend Service: `frontend/src/services/userService.ts`
- Frontend View: `frontend/src/views/UsersView.vue`

**Аналитика:**
- Backend: `backend/app/Http/Controllers/Api/AnalyticsController.php`
- Frontend View: `frontend/src/views/AnalyticsView.vue`

---

## 📊 Documentation Statistics

| Документ | Строк | Тип |
|----------|-------|-----|
| DEVELOPER.md | 550+ | 📖 API Reference |
| QUICK_START.md | 200+ | 🚀 Guide |
| PROGRESS.md | 250+ | 📊 Status |
| IMPLEMENTATION_STATUS.md | 300+ | 📋 Checklist |
| README.md | 250+ | 📚 Overview |
| backend/README.md | 150+ | 🔙 Backend Guide |
| frontend/README.md | 100+ | 🖼️ Frontend Guide |
| **TOTAL** | **1800+** | **Всей документации** |

---

## 🎯 Как использовать эту документацию

### Новый разработчик?
1. Прочитайте [QUICK_START.md](QUICK_START.md) (5 минут)
2. Запустите backend и frontend
3. Прочитайте [DEVELOPER.md](DEVELOPER.md) разделы по мере необходимости

### Разработаю Backend?
1. Смотрите: [DEVELOPER.md - Backend API Methods](DEVELOPER.md#backend-api-methods)
2. Коды эндпоинтов в `backend/app/Http/Controllers/Api/`
3. Модели в `backend/app/Models/`
4. Policies в `backend/app/Policies/`

### Разработаю Frontend?
1. Смотрите: [DEVELOPER.md - Frontend Services](DEVELOPER.md#frontend-services)
2. Используйте Services для API вызовов
3. Используйте Stores для state management
4. Компоненты в `frontend/src/components/`
5. Views в `frontend/src/views/`

### Вопросы о методах?
1. Найдите метод в индексе выше
2. Перейдите в соответствующий файл
3. Прочитайте полную документацию в [DEVELOPER.md](DEVELOPER.md)

---

## 🔀 API Endpoints Quick Reference

### Auth (4)
```
POST   /api/auth/register      # Регистрация
POST   /api/auth/login         # Вход
POST   /api/auth/logout        # Выход
GET    /api/auth/me            # Текущий пользователь
```

### Orders (5)
```
GET    /api/orders             # Список (с фильтрацией)
GET    /api/orders/{id}        # Деталь
POST   /api/orders             # Создать
PATCH  /api/orders/{id}        # Обновить
DELETE /api/orders/{id}        # Удалить (Admin)
```

### Users (5)
```
GET    /api/users              # Список (Admin)
GET    /api/users/{id}         # Деталь (Admin)
POST   /api/users              # Создать (Admin)
PATCH  /api/users/{id}         # Обновить (Admin)
DELETE /api/users/{id}         # Удалить (Admin)
```

### Analytics (3)
```
GET    /api/analytics/dashboard      # Статистика
GET    /api/analytics/orders-trend   # Тренд (Admin)
GET    /api/analytics/role-stats      # Роли (Admin)
```

---

## 📞 Support & Questions

- **Для методов Backend**: Смотрите [DEVELOPER.md - Backend API Methods](DEVELOPER.md#backend-api-methods)
- **Для сервисов Frontend**: Смотрите [DEVELOPER.md - Frontend Services](DEVELOPER.md#frontend-services)
- **Для stores**: Смотрите [DEVELOPER.md - Frontend Stores](DEVELOPER.md#frontend-stores-pinia)
- **Для quick start**: Смотрите [QUICK_START.md](QUICK_START.md)
- **Для статуса проекта**: Смотрите [PROGRESS.md](PROGRESS.md)

---

**Документация обновлена**: 19 февраля 2026  
**Версия**: 2.0  
**Полнота**: 98% 📖
