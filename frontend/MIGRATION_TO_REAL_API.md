# ⚠️ ВАЖНО: Миграция с Mock API на реальный backend

Этот файл содержит полный список всех мест в коде, которые нужно изменить при переезде на реальный backend.

## 📋 Места для изменения

### 1. **authService.ts** - Аутентификация

#### 🔴 login() - строка ~42
**Текущее состояние:**
```typescript
async login(payload: LoginPayload): Promise<AuthResponse> {
  // Try mock data first for demo credentials
  const mockData = useMockData()
  const mockUser = mockData.mockUsersList.find(
    u => u.email === payload.email && u.password === payload.password
  )

  if (mockUser) {
    const { password, ...user } = mockUser
    return {
      user,
      token: 'mock-token-' + Date.now()
    }
  }

  // Otherwise try real API
  const response = await api.post('/auth/login', payload)
  return response.data
}
```

**Что изменить:**
- Удалить весь блок проверки mockUsersList (строки с `const mockData` до `if (mockUser)`)
- Оставить только API вызов:
```typescript
const response = await api.post('/auth/login', payload)
return response.data
```

---

#### 🔴 logout() - строка ~69
**Текущее состояние:**
```typescript
async logout(): Promise<void> {
  // For mock auth, just resolve without API call
  // In production with real backend, uncomment the API call:
  // await api.post('/auth/logout')
  return Promise.resolve()
}
```

**Что изменить:**
- Раскомментировать API вызов:
```typescript
async logout(): Promise<void> {
  await api.post('/auth/logout')
}
```

---

#### 🟡 register() - строка ~96
**Текущее состояние:**
```typescript
async register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post('/auth/register', payload)
  return response.data
}
```

**Что изменить:**
- Убедиться, что backend обрабатывает этот endpoint правильно
- Может потребоваться добавить дополнительные проверки

---

### 2. **orderStore.ts** - Управление заявками

#### 🔴 fetchOrders() - строка ~40
**Текущее состояние:**
Использует `orderService.getOrders()` → нужно проверить его

#### 🔴 createOrder() - строка ~60
**Что проверить:**
- Может потребоваться дополнительный `user_id` в запросе
- Backend должен автоматически устанавливать создателя из токена

#### 🔴 updateOrder() - строка ~70
**Что проверить:**
- Какие поля можно обновлять

#### 🔴 deleteOrder() - строка ~80
**Что проверить:**
- Права доступа на delete

---

### 3. **userStore.ts** - Управление пользователями

#### 🔴 fetchUsers() - строка ~40
#### 🔴 createUser() - строка ~60
#### 🔴 updateUser() - строка ~70
#### 🔴 deleteUser() - строка ~80

---

### 4. **orderService.ts** - API для заявок

Все методы в этом файле используют реальный API (правильно).

Проверить эндпоинты:
- `GET /api/orders` - получение списка
- `POST /api/orders` - создание
- `GET /api/orders/:id` - получение одной заявки
- `PUT /api/orders/:id` - обновление
- `DELETE /api/orders/:id` - удаление

---

### 5. **userService.ts** - API для пользователей

Все методы используют реальный API (правильно).

Проверить эндпоинты:
- `GET /api/users` - получение списка
- `POST /api/users` - создание
- `GET /api/users/:id` - получение одного пользователя
- `PUT /api/users/:id` - обновление
- `DELETE /api/users/:id` - удаление

---

### 6. **composables/useMockData.ts** - Mock данные

**Важно:** После переезда на реальный API можно удалить весь файл, так как он больше не будет использоваться.

Перед удалением проверить:
- Перемонтирована ли логика инициализации данных
- Текущий пользователь загружается из реального API

---

## 📝 Чек-лист миграции

- [x] Удалить mock логику из `authService.login()`
- [x] Перевести `authService.logout()` на реальный backend session auth
- [ ] Проверить все эндпоинты в `orderService`
- [ ] Проверить все эндпоинты в `userService`
- [ ] Протестировать login/logout с реальным backend
- [ ] Протестировать CRUD операции для заявок
- [ ] Протестировать CRUD операции для пользователей
- [ ] Удалить `useMockData.ts` после миграции
- [ ] Удалить `MIGRATION_TO_REAL_API.md` (этот файл) после успешной миграции

---

## 🔗 Связанные файлы

```
frontend/src/
├── services/
│   ├── authService.ts        ⚠️ ТРЕБУЕТ ИЗМЕНЕНИЙ (login, logout)
│   ├── orderService.ts       ✅ Уже готов
│   └── userService.ts        ✅ Уже готов
├── stores/
│   ├── authStore.ts          ✅ Должно работать после authService
│   └── orderStore.ts         ✅ Должно работать после orderService
└── composables/
    └── useMockData.ts        ⚠️ МОЖНО УДАЛИТЬ после миграции
```

---

## 🚀 Шаги миграции (пошагово)

1. Убедиться, что backend запущен на `http://localhost:8000`
2. Изменить `authService.login()` согласно инструкции выше
3. Изменить `authService.logout()` согласно инструкции выше
4. Перезагрузить приложение
5. Протестировать login/logout
6. Если все работает - тестировать CRUD операции
7. Удалить `useMockData.ts`
8. Удалить этот файл (MIGRATION_TO_REAL_API.md)

---

**Дата последнего обновления:** 19 февраля 2026
**Статус:** 🔴 Mock API активен, миграция не начата
