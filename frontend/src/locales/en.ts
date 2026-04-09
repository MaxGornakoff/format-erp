export const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    close: 'Close',
    back: 'Back',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    exportExcel: 'Export to Excel',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    noData: 'No data',
    total: 'Total',
    page: 'Page',
    of: 'of',
    previous: 'Previous',
    next: 'Next',
    actions: 'Actions',
    resetColumns: 'Reset column order',
    resetFilters: 'Reset filters'
  },

  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    loginDemo: 'Demo Credentials',
    passwordRequirements: 'Minimum 8 characters, letters and numbers',
    invalidEmail: 'Invalid email format',
    passwordMismatch: 'Passwords do not match'
  },

  navigation: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    users: 'Users',
    analytics: 'Analytics',
    history: 'History',
    profile: 'Profile',
    settings: 'Settings'
  },

  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome, {name}! 👋',
    description: 'Efficiently manage your tasks and track progress',
    yourRole: 'Your Role',
    memberSince: 'Member since',
    status: 'Status',
    active: 'Active',
    ordersManagement: 'Order Management',
    ordersDescription: 'View and manage all orders',
    goToOrders: 'Go to Orders',
    analytics: 'Analytics',
    analyticsDescription: 'View detailed statistics and reports',
    viewAnalytics: 'View Analytics',
    usersManagement: 'User Management',
    usersDescription: 'Manage system users and their roles',
    manageUsers: 'Manage Users',
    historyManagement: 'Activity History',
    historyDescription: 'Review user actions and system event logs',
    viewHistory: 'Open History',
    gettingStarted: 'Getting Started',
    startByCreating: 'Start by creating a new order',
    checkProfile: 'Check your profile in the top right menu',
    monitorTeam: 'Monitor team performance in Analytics',
    manageUsersAdmin: 'Manage users and assign roles',
    reviewHistoryAdmin: 'Review user and system activity history'
  },

  orders: {
    title: 'Order Management',
    description: 'View and manage all orders',
    formTitle: 'Title',
    formTitlePlaceholder: 'Enter order title',
    formDescription: 'Description',
    formDescriptionPlaceholder: 'Enter order description',
    note: 'Note',
    notePlaceholder: 'Enter additional note',
    packageCost: 'Layout Cost',
    packageCostPlaceholder: 'Enter layout cost',
    orderCost: 'Order Cost',
    orderCostPlaceholder: 'Enter order cost',
    priority: 'Priority',
    executor: 'Responsible',
    selectExecutor: 'Select or type a responsible person',
    autoAssignedWorker: 'Responsible is assigned automatically',
    date: 'Date',
    orderNumberShort: 'Order #',
    newOrder: '+ New Order',
    createOrder: 'Create Order',
    editOrder: 'Edit Order',
    orderDetails: 'Order Details',
    orderNumber: 'Order #',
    createdBy: 'Responsible',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    viewOrder: 'View',
    deleteOrder: 'Delete',
    confirmDelete: 'Are you sure you want to delete this order?',
    status: 'Status',
    changeStatus: 'Change Status',
    totals: {
      orderCost: 'Total order amount',
      packageCost: 'Total layout amount'
    },

    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    },

    statuses: {
      new: 'New',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    },

    filters: {
      searchPlaceholder: 'Search by order #, description, or note...',
      allStatuses: 'All Statuses',
      allExecutors: 'All responsible users'
    }
  },

  users: {
    title: 'User Management',
    description: 'Manage system users and their roles',
    newUser: '+ New User',
    createUser: 'Create User',
    editUser: 'Edit User',
    id: 'ID',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    tracking: 'Tracking',
    trackActivity: 'Track user activity',
    tracked: 'Tracked',
    notTracked: 'Not tracked',
    created: 'Created',
    confirmDelete: 'Are you sure you want to delete this user?',
    
    roles: {
      worker: 'Worker',
      manager: 'Manager',
      admin: 'Administrator'
    },

    filters: {
      searchPlaceholder: 'Search by name or email...',
      allRoles: 'All Roles'
    }
  },

  history: {
    title: 'Activity History',
    description: 'Log of key actions performed by tracked users: sign-ins, sign-outs, and CRUD operations.',
    loading: 'Loading history...',
    user: 'User',
    action: 'Action',
    subject: 'Subject',
    details: 'Details',
    time: 'Time',
    filters: {
      searchPlaceholder: 'Search by user, email, or action...',
      allActions: 'All actions'
    },
    subjects: {
      session: 'Session',
      order: 'Order',
      user: 'User'
    },
    actions: {
      sessionLogin: 'Signed in',
      sessionLogout: 'Signed out',
      orderCreate: 'Created order',
      orderRead: 'Viewed order',
      orderUpdate: 'Updated order',
      orderDelete: 'Deleted order',
      userCreate: 'Created user',
      userRead: 'Viewed user',
      userReadList: 'Viewed user list',
      userUpdate: 'Updated user',
      userDelete: 'Deleted user',
      trackingEnabled: 'Tracking enabled',
      trackingDisabled: 'Tracking disabled'
    }
  },

  analytics: {
    title: 'Analytics Dashboard',
    description: 'Complete overview of orders and user statistics',
    totalOrders: 'Total Orders',
    newOrders: 'New Orders',
    inProgress: 'In Progress',
    completed: 'Completed',
    topWorkers: 'Top Responsible Users',
    completedCount: 'completed',
    ordersTrend: 'Orders Created (Last 30 Days)',
    usersByRole: 'Users by Role',
    refreshData: 'Refresh Data',
    noWorkerData: 'No responsible-user data',
    noData: 'No data available'
  },

  validation: {
    required: 'This field is required',
    invalidEmail: 'Invalid email format',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordRequirements: 'Password must contain letters and numbers',
    titleRequired: 'Title is required',
    descriptionRequired: 'Description is required',
    executorRequired: 'Please enter a responsible user',
    nonNegativeNumber: 'Value must be a number greater than or equal to 0',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required'
  },

  messages: {
    loadingOrders: 'Loading orders...',
    loadingUsers: 'Loading users...',
    loadingStatistics: 'Loading statistics...',
    loadingChartData: 'Loading chart data...',
    loadingOrderDetails: 'Loading order details...',
    failedToLoadOrders: 'Failed to load orders',
    failedToLoadUsers: 'Failed to load users',
    failedToLoadOrder: 'Failed to load order',
    failedToSaveOrder: 'Failed to save order',
    failedToDeleteOrder: 'Failed to delete order',
    failedToExportOrders: 'Failed to export orders',
    failedToSaveUser: 'Failed to save user',
    failedToDeleteUser: 'Failed to delete user',
    failedToLoadHistory: 'Failed to load activity history',
    orderNotFound: 'Order not found'
  }
}
