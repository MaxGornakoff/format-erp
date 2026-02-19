# Format Management - CRM для управления заявками

Веб-приложение для управления заявками (заказами) внутри одной организации с системой ролей и полным RBAC.

**Версия**: 2.0  
**Дата**: 19 февраля 2026  
**Статус**: Активная разработка (Фаза 2)

---

## 📋 Содержание

- [О проекте](#о-проекте)
- [Стек технологий](#стек-технологий)
- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
- [Роли и возможности](#роли-и-возможности)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)

---

## О проекте

**Format Management** - мини-CRM для централизованного управления заявками, отслеживания процесса выполнения, оценки эффективности сотрудников и получения аналитики.

### Основные функции

- ✅ **Аутентификация и авторизация** - Email/пароль + token-based (Sanctum)
- ✅ **CRUD заявок** - Создание, чтение, обновление, удаление с историей
- ✅ **Система ролей** - Worker, Manager, Admin с разными уровнями доступа
- ✅ **Управление пользователями** - Только для админа
- ✅ **Аналитика** - Статистика, графики, экспорт (для Manager/Admin)
- ✅ **Фильтрация и поиск** - По статусу, названию, дате
- ✅ **Пагинация** - 15 заявок на странице
- ✅ **Сортировка** - По любому полю

---

## Стек технологий

### Frontend
- **Vue.js 3** + TypeScript
- **Vite** - Build tool
- **Pinia** - State Management
- **Vue Router** - Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling

### Backend
- **PHP 8.2+**
- **Laravel 11+** - Web Framework
- **Eloquent ORM** - Database ORM
- **Laravel Sanctum** - API Auth
- **MySQL 8.0+** - Database

---

## Структура проекта

```
format-erp/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Http/Requests/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   ├── .env
│   └── README.md
│
├── frontend/                   # Vue 3 Application
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── router/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── .env
│   ├── tailwind.config.js
│   └── README.md
│
├── TZ.md                      # Project Specification
├── DEVELOPER.md               # Developer Documentation
└── README.md                  # This file
```

---

## Установка и запуск

### Backend Setup

```bash
cd backend

# 1. Установить зависимости
composer install

# 2. Создать БД
mysql -u root -e "CREATE DATABASE IF NOT EXISTS format_management;"

# 3. Копировать .env и сгенерировать key
cp .env.example .env
php artisan key:generate

# 4. Запустить миграции
php artisan migrate

# 5. Заполнить БД тестовыми данными
php artisan db:seed

# 6. Запустить dev-сервер
php artisan serve
```

Backend доступен на `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# 1. Установить зависимости
npm install

# 2. Запустить dev-сервер
npm run dev
```

Frontend доступен на `http://localhost:5173`

### Тестовые учетные данные

```
Admin:
Email: admin@example.com
Password: Admin123

Manager:
Email: manager@example.com
Password: Manager123

Worker 1:
Email: worker1@example.com
Password: Worker123

Worker 2:
Email: worker2@example.com
Password: Worker123

Worker 3:
Email: worker3@example.com
Password: Worker123
```

---

## Роли и возможности

### 👷 Worker (Работник)
- Просмотр только своих заявок
- Создание новых заявок
- Редактирование своих заявок (если статус "new" или "in_progress")
- ❌ Без доступа к Admin панели
- ❌ Не может удалять заявки

### 👔 Manager (Менеджер)
- Просмотр всех заявок команды
- Создание заявок
- Редактирование статусов заявок
- Доступ к базовой аналитике
- ❌ Не может удалять заявки

### 👨‍💼 Admin (Администратор)
- ✅ Полный доступ ко всем заявкам
- ✅ Управление пользователями (создание, редактирование, удаление)
- ✅ Изменение ролей пользователей
- ✅ Полная аналитика (график тренда, статистика по ролям)
- ✅ Удаление заявок
- ✅ Доступ к админ-панели

---

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register        # Регистрация
POST /api/auth/login           # Вход
POST /api/auth/logout          # Выход
GET /api/auth/me               # Текущий пользователь
```

### Orders Endpoints

```
GET /api/orders                # Список заявок
GET /api/orders/{id}           # Деталь заявки
POST /api/orders               # Создать заявку
PATCH /api/orders/{id}         # Обновить заявку
DELETE /api/orders/{id}        # Удалить заявку (Admin)
```

### Users Endpoints (Admin only)

```
GET /api/users                 # Список пользователей
GET /api/users/{id}            # Деталь пользователя
POST /api/users                # Создать пользователя
PATCH /api/users/{id}          # Обновить пользователя
DELETE /api/users/{id}         # Удалить пользователя
```

### Analytics Endpoints

```
GET /api/analytics/dashboard   # Статистика (Manager/Admin)
GET /api/analytics/orders-trend      # Тренд заявок (Admin)
GET /api/analytics/role-stats        # Статистика по ролям (Admin)
```

### Статусы заявок

- `new` - Новая
- `in_progress` - В процессе
- `completed` - Завершена
- `cancelled` - Отменена

---

## Development

### Документация разработчика

Полная документация с описанием всех методов, компонентов и примерах кода находится в **[DEVELOPER.md](./DEVELOPER.md)**

**Документация включает:**
- Backend API методы (все 20+ методов)
- Frontend сервисы (authService, orderService, userService)
- Pinia stores (authStore, orderStore)
- Vue компоненты
- Примеры использования
- Flow диаграммы

### Фазы разработки

- [x] **Фаза 1: Backend Setup** - Laravel, Models, Controllers, API Routes
- [x] **Фаза 2: Frontend Setup** - Vue 3, Router, Stores, Services (CURRENT)
- [ ] **Фаза 3: Frontend Development** - Pages, Components, Integration
- [ ] **Фаза 4: Testing & Polish** - Bug fixes, Optimization
- [ ] **Фаза 5: Deployment** - Production setup

### Команды для разработки

**Backend:**
```bash
cd backend

# Dev server
php artisan serve

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Create model + migration
php artisan make:model Name -m

# Create controller
php artisan make:controller Api/NameController --resource

# Create request validation
php artisan make:request NameRequest

# Create policy
php artisan make:policy NamePolicy --model=Name
```

**Frontend:**
```bash
cd frontend

# Dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

---

## Требования к базе данных

### Таблица `users`
- id, name, email, password, role, email_verified_at, created_at, updated_at

### Таблица `orders`
- id, title, description, status, user_id, created_at, updated_at

### Таблица `personal_access_tokens` (Sanctum)
- id, tokenable_id, tokenable_type, name, token, abilities, last_used_at, created_at, updated_at

---

## Non-Functional Requirements

- ✅ **Производительность**: API response time < 200ms
- ✅ **Безопасность**: bcrypt пароли, SQL injection защита, CSRF/XSS защита, HTTPS
- ✅ **Масштабируемость**: Поддержка до 500 пользователей
- ✅ **Надежность**: Версионированные миграции, логирование, обработка ошибок

---

## Contributing

1. Создайте feature branch: `git checkout -b feature/your-feature`
2. Сделайте изменения и коммитьте: `git commit -am 'Add new feature'`
3. Push в branch: `git push origin feature/your-feature`
4. Откройте Pull Request

---

## License

Proprietary - All rights reserved

---

## Контакты

- **Email**: dev@formatmanagement.local
- **Документация**: [DEVELOPER.md](./DEVELOPER.md)
- **Спецификация**: [TZ.md](./TZ.md)

---

**Последние обновления**: 19 февраля 2026  
**Версия**: 2.0  
**Статус**: Активная разработка 🚀
