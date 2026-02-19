# 🚀 Format Management - Quick Start Guide

Быстрый старт для локальной разработки.

---

## ⚡ За 5 минут до первого запуска

### 1️⃣ Backend (Терминал 1)

```bash
# Перейде в папку backend
cd backend

# Установить зависимости
composer install

# Создать БД (убедитесь что MySQL запущен)
mysql -u root -e "CREATE DATABASE format_management;"

# Сгенерировать .env и APP_KEY
cp .env.example .env
php artisan key:generate

# Запустить миграции
php artisan migrate

# Заполнить БД тестовыми данными
php artisan db:seed

# Запустить сервер (должен работать на http://localhost:8000)
php artisan serve
```

**Результат:**
```
Local:   http://localhost:8000
API:     http://localhost:8000/api
```

### 2️⃣ Frontend (Терминал 2)

```bash
# Перейди в папку frontend
cd frontend

# Установить зависимости
npm install

# Запустить dev сервер (должен работать на http://localhost:5173)
npm run dev
```

**Результат:**
```
➜  Local:   http://localhost:5173/
```

---

## 🔐 Логин с тестовыми учетными данными

### Admin
```
Email: admin@example.com
Password: Admin123
```

### Manager
```
Email: manager@example.com
Password: Manager123
```

### Worker
```
Email: worker1@example.com
Password: Worker123
```

---

## 📂 Основные файлы для разработки

### Backend

| Файл | Назначение |
|------|-----------|
| `backend/app/Models/User.php` | User модель |
| `backend/app/Models/Order.php` | Order модель |
| `backend/app/Http/Controllers/Api/AuthController.php` | Аутентификация |
| `backend/app/Http/Controllers/Api/OrderController.php` | CRUD заявок |
| `backend/app/Policies/OrderPolicy.php` | RBAC для заявок |
| `backend/routes/api.php` | API маршруты |
| `backend/.env` | Конфигурация |

### Frontend

| Файл | Назначение |
|------|-----------|
| `frontend/src/services/api.ts` | Axios конфигурация |
| `frontend/src/services/authService.ts` | Auth API сервис |
| `frontend/src/services/orderService.ts` | Order API сервис |
| `frontend/src/stores/authStore.ts` | Auth state management |
| `frontend/src/stores/orderStore.ts` | Order state management |
| `frontend/src/router/index.ts` | Маршруты |
| `frontend/src/views/LoginView.vue` | Страница входа |
| `frontend/src/components/layout/AppHeader.vue` | Шапка |
| `frontend/src/components/layout/AppSidebar.vue` | Боковое меню |

---

## 🛠️ Полезные команды

### Backend

```bash
cd backend

# Создать новую миграцию
php artisan make:migration create_table_name

# Создать модель с миграцией
php artisan make:model ModelName -m

# Создать controller с методами CRUD
php artisan make:controller Api/ControllerName --resource

# Создать request валидацию
php artisan make:request NameRequest

# Создать policy
php artisan make:policy NamePolicy --model=Name

# Запустить миграции
php artisan migrate

# Откатить последнюю миграцию
php artisan migrate:rollback

# Залить тестовые данные
php artisan db:seed

# Сбросить БД и применить миграции + seed
php artisan migrate:fresh --seed

# Тестировать API (с Postman/Insomnia)
# Base URL: http://localhost:8000/api
# Headers: Authorization: Bearer <token>
```

### Frontend

```bash
cd frontend

# Запустить dev сервер
npm run dev

# Build для production
npm run build

# Preview production build
npm run preview

# Установить новый пакет
npm install package-name
```

---

## 🔍 Где что находится

### Backend API Endpoints

**Public (без авторизации):**
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

**Protected (требует token):**
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Текущий пользователь
- `GET /api/orders` - Список заявок
- `POST /api/orders` - Создать заявку
- `GET /api/users` - Список пользователей (Admin only)
- `GET /api/analytics/dashboard` - Статистика (Manager/Admin)

### Frontend Routes

- `/login` - Вход
- `/register` - Регистрация
- `/` - Dashboard
- `/orders` - Список заявок
- `/orders/:id` - Деталь заявки
- `/users` - Управление пользователями (Admin)
- `/analytics` - Аналитика (Manager/Admin)

---

## 📖 Документация

- **[DEVELOPER.md](DEVELOPER.md)** - Полная документация (все методы, сервисы, компоненты)
- **[backend/README.md](backend/README.md)** - Backend гайд
- **[frontend/README.md](frontend/README.md)** - Frontend гайд
- **[TZ.md](TZ.md)** - Спецификация проекта
- **[PROGRESS.md](PROGRESS.md)** - Прогресс разработки

---

## ✅ Checklist перед началом разработки

- [ ] MySQL запущен и работает
- [ ] `backend/.env` создан и конфигурирован
- [ ] `php artisan migrate` выполнен успешно
- [ ] `php artisan db:seed` выполнен успешно
- [ ] `php artisan serve` запущен (localhost:8000)
- [ ] `npm install` выполнен в frontend
- [ ] `npm run dev` запущен (localhost:5173)
- [ ] Можешь залогиниться с тестовыми данными
- [ ] Прочитал DEVELOPER.md

---

## 🐛 Troubleshooting

### Backend не запускается
```bash
# Проверить PHP версию (нужна 8.2+)
php --version

# Очистить кэш
php artisan cache:clear
php artisan config:clear

# Переустановить зависимости
rm composer.lock && composer install
```

### Frontend не компилируется
```bash
# Очистить node_modules и переустановить
rm -rf node_modules && npm install

# Проверить версию Node (нужна 16+)
node --version
```

### БД ошибка при миграции
```bash
# Проверить credentials в .env
# Убедиться что MySQL запущен

# Сбросить БД
php artisan migrate:fresh --seed
```

---

## 🎯 Next Steps

1. ✅ Запустить Backend и Frontend
2. ✅ Залогиниться с тестовыми данными
3. 📖 Прочитать DEVELOPER.md для полного понимания архитектуры
4. 📝 Начать разработку согласно Фазе 3 (Frontend Components)

---

**Готов начинать разработку?** 🚀

Если все работает - ты готов к Фазе 3! Переходи к созданию компонентов в DEVELOPER.md.

---

**Last updated**: 19 февраля 2026
