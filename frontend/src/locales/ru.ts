export const ru = {
  common: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    update: 'Обновить',
    close: 'Закрыть',
    back: 'Назад',
    search: 'Поиск',
    filter: 'Фильтр',
    refresh: 'Обновить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    warning: 'Предупреждение',
    info: 'Информация',
    noData: 'Нет данных',
    total: 'Всего',
    page: 'Страница',
    of: 'из',
    previous: 'Предыдущая',
    next: 'Следующая',
    actions: 'Действия'
  },

  auth: {
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Выход',
    email: 'Email',
    password: 'Пароль',
    name: 'Имя',
    confirmPassword: 'Подтвердить пароль',
    forgotPassword: 'Забыли пароль?',
    dontHaveAccount: 'Нет учетной записи?',
    alreadyHaveAccount: 'Уже есть учетная запись?',
    loginDemo: 'Демо учетные данные',
    passwordRequirements: 'Минимум 8 символов, буквы и цифры',
    invalidEmail: 'Некорректный email',
    passwordMismatch: 'Пароли не совпадают'
  },

  navigation: {
    dashboard: 'Панель управления',
    orders: 'Заявки',
    users: 'Пользователи',
    analytics: 'Аналитика',
    profile: 'Профиль',
    settings: 'Настройки'
  },

  dashboard: {
    title: 'Панель управления',
    welcome: 'Добро пожаловать, {name}! 👋',
    description: 'Эффективно управляйте своими задачами и отслеживайте прогресс',
    yourRole: 'Ваша роль',
    memberSince: 'Участник с',
    status: 'Статус',
    active: 'Активен',
    ordersManagement: 'Управление заявками',
    ordersDescription: 'Просмотр и управление всеми заявками',
    goToOrders: 'Перейти к заявкам',
    analytics: 'Аналитика',
    analyticsDescription: 'Просмотр детальной статистики и отчетов',
    viewAnalytics: 'Просмотр аналитики',
    usersManagement: 'Управление пользователями',
    usersDescription: 'Управление системными пользователями и их ролями',
    manageUsers: 'Управление пользователями',
    gettingStarted: 'Начало работы',
    startByCreating: 'Начните с создания новой заявки',
    checkProfile: 'Узнайте свой профиль в меню сверху справа',
    monitorTeam: 'Отслеживайте производительность команды в Аналитике',
    manageUsersAdmin: 'Управляйте пользователями и назначайте роли'
  },

  orders: {
    title: 'Управление заявками',
    formTitle: 'Тема',
    formTitlePlaceholder: 'Введите тему заявки',
    formDescription: 'Описание',
    formDescriptionPlaceholder: 'Введите описание заказа',
    note: 'Примечание',
    notePlaceholder: 'Введите дополнительное примечание',
    packageCost: 'Стоимость пакета',
    packageCostPlaceholder: 'Введите стоимость пакета',
    orderCost: 'Стоимость заказа',
    orderCostPlaceholder: 'Введите стоимость заказа',
    priority: 'Срочность',
    executor: 'Исполнитель',
    selectExecutor: 'Выберите исполнителя',
    autoAssignedWorker: 'Исполнитель назначается автоматически',
    date: 'Дата',
    orderNumberShort: '№ Заказа',
    description: 'Просмотр и управление всеми заявками',
    newOrder: '+ Новая заявка',
    createOrder: 'Создать заявку',
    editOrder: 'Редактировать заявку',
    orderDetails: 'Детали заявки',
    orderNumber: 'Заказ #',
    createdBy: 'Исполнитель',
    createdAt: 'Дата создания',
    updatedAt: 'Обновлено',
    viewOrder: 'Просмотр',
    deleteOrder: 'Удалить',
    confirmDelete: 'Вы уверены, что хотите удалить эту заявку?',
    status: 'Статус',
    changeStatus: 'Изменить статус',

    priorities: {
      low: 'Низкая',
      medium: 'Средняя',
      high: 'Высокая'
    },

    statuses: {
      new: 'Новая',
      in_progress: 'В процессе',
      completed: 'Выполнена',
      cancelled: 'Отменена'
    },

    filters: {
      searchPlaceholder: 'Поиск по № заказа, описанию или примечанию...',
      allStatuses: 'Все статусы'
    }
  },

  users: {
    title: 'Управление пользователями',
    description: 'Управление системными пользователями и их ролями',
    newUser: '+ Новый пользователь',
    createUser: 'Создать пользователя',
    editUser: 'Редактировать пользователя',
    id: 'ID',
    name: 'Имя',
    email: 'Email',
    role: 'Роль',
    created: 'Создано',
    confirmDelete: 'Вы уверены, что хотите удалить этого пользователя?',
    
    roles: {
      worker: 'Работник',
      manager: 'Менеджер',
      admin: 'Администратор'
    },

    filters: {
      searchPlaceholder: 'Поиск по имени или email...',
      allRoles: 'Все роли'
    }
  },

  analytics: {
    title: 'Панель аналитики',
    description: 'Полный обзор заявок и статистики пользователей',
    totalOrders: 'Всего заявок',
    newOrders: 'Новые заявки',
    inProgress: 'В процессе',
    completed: 'Завершено',
    topWorkers: 'Лучшие работники',
    completedCount: 'завершено',
    ordersTrend: 'Заявки созданы (последние 30 дней)',
    usersByRole: 'Пользователи по ролям',
    refreshData: 'Обновить данные',
    noWorkerData: 'Нет данных о работниках',
    noData: 'Нет доступных данных'
  },

  validation: {
    required: 'Это поле обязательно',
    invalidEmail: 'Некорректный формат email',
    passwordTooShort: 'Пароль должен быть минимум 8 символов',
    passwordRequirements: 'Пароль должен содержать буквы и цифры',
    titleRequired: 'Название обязательно',
    descriptionRequired: 'Описание обязательно',
    executorRequired: 'Выберите исполнителя',
    nonNegativeNumber: 'Значение должно быть числом не меньше 0',
    nameRequired: 'Имя обязательно',
    emailRequired: 'Email обязательно'
  },

  messages: {
    loadingOrders: 'Загрузка заявок...',
    loadingUsers: 'Загрузка пользователей...',
    loadingStatistics: 'Загрузка статистики...',
    loadingChartData: 'Загрузка данных графика...',
    loadingOrderDetails: 'Загрузка деталей заявки...',
    failedToLoadOrders: 'Не удалось загрузить заявки',
    failedToLoadUsers: 'Не удалось загрузить пользователей',
    failedToLoadOrder: 'Не удалось загрузить заявку',
    failedToSaveOrder: 'Не удалось сохранить заявку',
    failedToDeleteOrder: 'Не удалось удалить заявку',
    failedToSaveUser: 'Не удалось сохранить пользователя',
    failedToDeleteUser: 'Не удалось удалить пользователя',
    orderNotFound: 'Заявка не найдена'
  }
}
