# Format Management - Developer Documentation

Полная документация для разработчиков по структуре проекта, методам и компонентам.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Backend API Methods](#backend-api-methods)
3. [Frontend Services](#frontend-services)
4. [Frontend Stores (Pinia)](#frontend-stores-pinia)
5. [Frontend Components](#frontend-components)
6. [Frontend Views](#frontend-views)
7. [Routing & Navigation](#routing--navigation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Development Workflow](#development-workflow)

---

## Project Structure

```
format-erp/
├── backend/                  # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── OrderController.php
│   │   │   ├── UserController.php
│   │   │   └── AnalyticsController.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   └── Order.php
│   │   ├── Policies/
│   │   │   ├── OrderPolicy.php
│   │   │   └── UserPolicy.php
│   │   └── Http/Requests/
│   │       ├── LoginRequest.php
│   │       ├── RegisterRequest.php
│   │       ├── StoreOrderRequest.php
│   │       ├── UpdateOrderRequest.php
│   │       ├── StoreUserRequest.php
│   │       └── UpdateUserRequest.php
│   ├── routes/api.php
│   ├── database/migrations/
│   ├── database/seeders/
│   └── .env
│
├── frontend/                 # Vue 3 + TypeScript
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── orderService.ts
│   │   │   └── userService.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   └── orderStore.ts
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   └── AppSidebar.vue
│   │   │   ├── orders/
│   │   │   ├── users/
│   │   │   ├── analytics/
│   │   │   └── ui/
│   │   ├── views/
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── OrdersView.vue
│   │   │   ├── OrderDetailView.vue
│   │   │   ├── UsersView.vue
│   │   │   ├── AnalyticsView.vue
│   │   │   └── NotFoundView.vue
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── index.css
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
└── TZ.md                     # Project specification
```

---

## Backend API Methods

### AuthController

**File**: `backend/app/Http/Controllers/Api/AuthController.php`

#### `register(RegisterRequest $request): JsonResponse`
Регистрация нового пользователя.

**Parameters:**
- `name` (string, required): Имя пользователя
- `email` (string, required): Email
- `password` (string, required): Пароль (min 8 символов, буквы и цифры)

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker",
    "created_at": "2026-02-19T10:00:00Z"
  },
  "token": "auth_token_here"
}
```

#### `login(LoginRequest $request): JsonResponse`
Вход пользователя.

**Parameters:**
- `email` (string, required): Email
- `password` (string, required): Пароль

**Response (200):**
```json
{
  "user": { ... },
  "token": "auth_token_here"
}
```

#### `logout(Request $request): JsonResponse`
Выход пользователя (требует авторизации).

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

#### `me(Request $request): JsonResponse`
Получить данные текущего пользователя (требует авторизации).

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "worker",
  "created_at": "2026-02-19T10:00:00Z"
}
```

---

### OrderController

**File**: `backend/app/Http/Controllers/Api/OrderController.php`

#### `index(Request $request): JsonResponse`
Получить список заявок с фильтрацией и пагинацией.

**Query Parameters:**
- `page` (int, optional): Номер страницы (default: 1)
- `per_page` (int, optional): Количество элементов (default: 15)
- `status` (string, optional): Фильтр по статусу (new, in_progress, completed, cancelled)
- `search` (string, optional): Поиск по названию/описанию
- `sort` (string, optional): Поле для сортировки (default: created_at)
- `direction` (string, optional): Направление сортировки (asc/desc, default: desc)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Order title",
      "description": "Order description",
      "status": "new",
      "user_id": 1,
      "user": { "id": 1, "name": "John Doe" },
      "created_at": "2026-02-19T10:00:00Z",
      "updated_at": "2026-02-19T10:00:00Z"
    }
  ],
  "current_page": 1,
  "from": 1,
  "to": 15,
  "total": 100,
  "per_page": 15,
  "last_page": 7
}
```

#### `store(StoreOrderRequest $request): JsonResponse`
Создать новую заявку (требует авторизации).

**Body Parameters:**
- `title` (string, required, max 255): Название заявки
- `description` (string, optional, max 2000): Описание
- `status` (string, optional): Статус (default: new)

**Response (201):**
```json
{
  "id": 1,
  "title": "...",
  "description": "...",
  "status": "new",
  "user_id": 1,
  "user": { "id": 1, "name": "John Doe" },
  "created_at": "2026-02-19T10:00:00Z",
  "updated_at": "2026-02-19T10:00:00Z"
}
```

#### `show(Order $order): JsonResponse`
Получить деталь заявки (требует авторизации).

**Response (200):**
Same as `store` response

#### `update(UpdateOrderRequest $request, Order $order): JsonResponse`
Обновить заявку (требует авторизации + проверка доступа).

**Body Parameters:**
- `title` (string, optional, max 255): Название
- `description` (string, optional, max 2000): Описание
- `status` (string, optional): Статус

**Response (200):**
Same as `show` response

#### `destroy(Order $order): JsonResponse`
Удалить заявку (требует авторизации + только Admin).

**Response (200):**
```json
{
  "message": "Order deleted successfully"
}
```

---

### UserController

**File**: `backend/app/Http/Controllers/Api/UserController.php`

#### `index(Request $request): JsonResponse`
Получить список пользователей (только Admin).

**Query Parameters:**
- `page` (int, optional): Номер страницы
- `per_page` (int, optional): Количество элементов
- `role` (string, optional): Фильтр по роли
- `search` (string, optional): Поиск по имени/email
- `sort` (string, optional): Поле для сортировки
- `direction` (string, optional): Направление сортировки

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "worker",
      "created_at": "2026-02-19T10:00:00Z",
      "updated_at": "2026-02-19T10:00:00Z"
    }
  ],
  "current_page": 1,
  "total": 25,
  "per_page": 15,
  "last_page": 2
}
```

#### `store(StoreUserRequest $request): JsonResponse`
Создать пользователя (только Admin).

**Body Parameters:**
- `name` (string, required): Имя
- `email` (string, required): Email
- `password` (string, required): Пароль
- `role` (string, required): Роль (worker, manager, admin)

**Response (201):**
Same as `index` data item

#### `show(User $user): JsonResponse`
Получить пользователя (только Admin).

**Response (200):**
Same as `index` data item

#### `update(UpdateUserRequest $request, User $user): JsonResponse`
Обновить пользователя (только Admin).

**Body Parameters:**
- `name` (string, optional): Имя
- `email` (string, optional): Email
- `role` (string, optional): Роль

**Response (200):**
Same as `show` response

#### `destroy(User $user): JsonResponse`
Удалить пользователя (только Admin).

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### AnalyticsController

**File**: `backend/app/Http/Controllers/Api/AnalyticsController.php`

#### `dashboard(Request $request): JsonResponse`
Получить статистику (Manager & Admin).

**Response (200):**
```json
{
  "orders_by_status": {
    "new": 10,
    "in_progress": 5,
    "completed": 20,
    "cancelled": 2
  },
  "total_orders": 37,
  "top_workers": [
    {
      "id": 1,
      "name": "John Doe",
      "orders_count": 15
    }
  ]
}
```

#### `ordersTrend(Request $request): JsonResponse`
Получить тренд заявок за последние 30 дней (только Admin).

**Response (200):**
```json
{
  "data": [
    {
      "date": "2026-01-20",
      "count": 5
    },
    {
      "date": "2026-01-21",
      "count": 8
    }
  ],
  "period": "last_30_days"
}
```

#### `roleStats(Request $request): JsonResponse`
Получить статистику по ролям (только Admin).

**Response (200):**
```json
{
  "workers": 10,
  "managers": 2,
  "admins": 1
}
```

---

## Frontend Services

### api.ts (Axios Instance)

**File**: `frontend/src/services/api.ts`

Axios instance с предустановками и перехватчиками:
- Base URL: `http://localhost:8000/api`
- Authorization header auto-injection
- 401 error handling (redirect to login)

**Usage:**
```typescript
import api from '@/services/api'

// GET request
const response = await api.get('/orders')

// POST request
const response = await api.post('/orders', payload)

// With parameters
const response = await api.get('/orders', {
  params: { page: 1, status: 'new' }
})
```

---

### authService.ts

**File**: `frontend/src/services/authService.ts`

#### `register(payload: RegisterPayload): Promise<AuthResponse>`
Регистрация пользователя.

**Parameters:**
```typescript
interface RegisterPayload {
  name: string
  email: string
  password: string
}
```

**Returns:**
```typescript
interface AuthResponse {
  user: User
  token: string
}
```

#### `login(payload: LoginPayload): Promise<AuthResponse>`
Вход пользователя.

**Parameters:**
```typescript
interface LoginPayload {
  email: string
  password: string
}
```

**Returns:** Same as `register`

#### `logout(): Promise<void>`
Выход пользователя.

#### `getCurrentUser(): Promise<User>`
Получить текущего пользователя.

**Returns:**
```typescript
interface User {
  id: number
  name: string
  email: string
  role: 'worker' | 'manager' | 'admin'
  created_at: string
}
```

#### `setToken(token: string): void`
Сохранить токен в localStorage.

#### `getToken(): string | null`
Получить токен из localStorage.

#### `removeToken(): void`
Удалить токен из localStorage.

---

### orderService.ts

**File**: `frontend/src/services/orderService.ts`

#### `getOrders(page?, perPage?, status?, search?, sort?, direction?): Promise<OrdersResponse>`
Получить список заявок.

**Parameters:**
- `page` (number, optional): Номер страницы
- `perPage` (number, optional): Элементов на странице
- `status` (string, optional): Фильтр статуса
- `search` (string, optional): Поиск
- `sort` (string, optional): Поле сортировки
- `direction` (string, optional): Направление

**Returns:**
```typescript
interface OrdersResponse {
  data: Order[]
  current_page: number
  from: number
  to: number
  total: number
  per_page: number
  last_page: number
}

interface Order {
  id: number
  title: string
  description?: string
  status: 'new' | 'in_progress' | 'completed' | 'cancelled'
  user_id: number
  user: { id: number; name: string }
  created_at: string
  updated_at: string
}
```

#### `getOrder(id: number): Promise<Order>`
Получить одну заявку.

#### `createOrder(payload: CreateOrderPayload): Promise<Order>`
Создать заявку.

**Parameters:**
```typescript
interface CreateOrderPayload {
  title: string
  description?: string
  status?: 'new' | 'in_progress' | 'completed' | 'cancelled'
}
```

#### `updateOrder(id: number, payload: UpdateOrderPayload): Promise<Order>`
Обновить заявку.

**Parameters:**
```typescript
interface UpdateOrderPayload {
  title?: string
  description?: string
  status?: 'new' | 'in_progress' | 'completed' | 'cancelled'
}
```

#### `deleteOrder(id: number): Promise<void>`
Удалить заявку.

---

### userService.ts

**File**: `frontend/src/services/userService.ts`

Аналогично `orderService`, но для пользователей (Admin only):

#### `getUsers(page?, perPage?, role?, search?, sort?, direction?): Promise<UsersResponse>`
#### `getUser(id: number): Promise<User>`
#### `createUser(payload: CreateUserPayload): Promise<User>`
#### `updateUser(id: number, payload: UpdateUserPayload): Promise<User>`
#### `deleteUser(id: number): Promise<void>`

---

## Frontend Stores (Pinia)

### authStore.ts

**File**: `frontend/src/stores/authStore.ts`

State:
- `user` (User | null): Текущий пользователь
- `token` (string | null): Auth токен
- `isLoading` (boolean): Флаг загрузки
- `error` (string | null): Сообщение об ошибке

Computed Properties:
- `isAuthenticated`: Проверка авторизации
- `isWorker`: Проверка роли worker
- `isManager`: Проверка роли manager
- `isAdmin`: Проверка роли admin

Methods:
- `initAuth()`: Инициализировать состояние от localStorage
- `login(payload)`: Вход
- `register(payload)`: Регистрация
- `logout()`: Выход
- `clearError()`: Очистить ошибку

**Usage:**
```typescript
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

// Login
await authStore.login({ email: 'user@example.com', password: 'pass123' })

// Check if user is admin
if (authStore.isAdmin) {
  // Admin operations
}
```

---

### orderStore.ts

**File**: `frontend/src/stores/orderStore.ts`

State:
- `orders` (Order[]): Список заявок
- `currentOrder` (Order | null): Текущая заявка
- `isLoading` (boolean): Флаг загрузки
- `error` (string | null): Ошибка
- `currentPage` (number): Текущая страница
- `perPage` (number): Элементов на странице
- `total` (number): Всего элементов
- `lastPage` (number): Последняя страница
- `statusFilter` (string | undefined): Фильтр статуса
- `searchQuery` (string): Поисковый запрос
- `sortField` (string): Поле сортировки
- `sortDirection` ('asc' | 'desc'): Направление сортировки

Computed Properties:
- `totalPages`: Всего страниц
- `hasNextPage`: Есть ли следующая страница
- `hasPrevPage`: Есть ли предыдущая страница

Methods:
- `fetchOrders()`: Получить заявки
- `fetchOrder(id)`: Получить одну заявку
- `createOrder(payload)`: Создать заявку
- `updateOrder(id, payload)`: Обновить заявку
- `deleteOrder(id)`: Удалить заявку
- `setStatusFilter(status)`: Установить фильтр статуса
- `setSearchQuery(query)`: Установить поиск
- `setSorting(field, direction)`: Установить сортировку
- `goToPage(page)`: Перейти на страницу
- `clearError()`: Очистить ошибку
- `resetFilters()`: Сбросить фильтры

**Usage:**
```typescript
import { useOrderStore } from '@/stores/orderStore'

const orderStore = useOrderStore()

// Fetch orders
await orderStore.fetchOrders()

// Create order
const newOrder = await orderStore.createOrder({
  title: 'New order',
  description: 'Description'
})

// Filter
orderStore.setStatusFilter('new')
await orderStore.fetchOrders()
```

---

## Frontend Components

### Layout Components

#### AppHeader.vue
Шапка приложения с логотипом, именем пользователя и кнопкой logout.

#### AppSidebar.vue
Боковая навигация с ссылками на:
- Dashboard
- Orders
- Analytics (Manager & Admin)
- Users (Admin только)

Показывает текущую роль пользователя.

---

### (Coming Soon)
- **orders/OrdersTable.vue** - Таблица заявок
- **orders/OrderForm.vue** - Форма создания/редактирования
- **orders/OrderDetail.vue** - Детальный просмотр
- **users/UsersTable.vue** - Таблица пользователей
- **analytics/StatsPanel.vue** - Панель статистики
- **analytics/Charts.vue** - Графики
- **ui/Button.vue** - Button компонент
- **ui/Input.vue** - Input компонент
- **ui/Modal.vue** - Modal компонент
- **ui/Table.vue** - Table компонент

---

## Frontend Views

### LoginView.vue
Страница входа с формой email/пароль. Показывает демо учетные данные.

**Route**: `/login`

### RegisterView.vue
Страница регистрации с формой name/email/password.

**Route**: `/register`

### DashboardView.vue
Главная страница с приветствием.

**Route**: `/`

### OrdersView.vue (Coming Soon)
Список заявок с таблицей, фильтрами, поиском и пагинацией.

**Route**: `/orders`

### OrderDetailView.vue (Coming Soon)
Детальный просмотр заявки.

**Route**: `/orders/:id`

### UsersView.vue (Coming Soon)
Управление пользователями (только Admin).

**Route**: `/users`

### AnalyticsView.vue (Coming Soon)
Аналитика и статистика (Manager & Admin).

**Route**: `/analytics`

### NotFoundView.vue
404 страница.

**Route**: `/:pathMatch(.*)*`

---

## Routing & Navigation

**File**: `frontend/src/router/index.ts`

### Route Guards

1. **Authentication Guard**: Проверка авторизации на защищенных маршрутах
2. **Role Guard**: Проверка роли (Admin, Manager) для специфичных страниц
3. **Redirect Guard**: Перенаправление авторизованных пользователей с login/register на dashboard

### Route Metadata

- `requiresAuth`: true/false - требует ли авторизация
- `requiresAdmin`: true/false - требует ли Admin роль
- `requiresManager`: true/false - требует ли Manager или Admin роль

---

## Authentication & Authorization

### Flow

1. **Registration**: User → RegisterView → authService.register() → Backend → authStore.register()
2. **Login**: User → LoginView → authService.login() → Backend → authStore.login()
3. **Set Token**: Token сохраняется в localStorage и используется в Axios
4. **Protected Routes**: Router guard проверяет `authStore.isAuthenticated`
5. **Logout**: authService.logout() → Backend → authStore.logout()

### Roles

- **Worker**: Видит только свои заявки, может создавать
- **Manager**: Видит заявки команды, может менять статусы, видит analytics
- **Admin**: Полный доступ, управляет пользователями

---

## Development Workflow

### Backend Development

1. Create migration: `php artisan make:migration`
2. Create model: `php artisan make:model Model -m`
3. Create controller: `php artisan make:controller Api/ControllerName --resource`
4. Create request: `php artisan make:request MyRequest`
5. Create policy: `php artisan make:policy ModelPolicy --model=Model`
6. Run migrations: `php artisan migrate`
7. Run server: `php artisan serve`

### Frontend Development

1. Create component: Add `.vue` file in appropriate folder
2. Use composition API with script setup
3. Use Pinia stores for state management
4. Use services for API calls
5. Use router for navigation
6. Run dev server: `npm run dev`

### Testing

- Backend: Use Postman/Insomnia for API testing
- Frontend: Test in browser devtools, check console for errors

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-19  
**Maintained By**: Development Team
