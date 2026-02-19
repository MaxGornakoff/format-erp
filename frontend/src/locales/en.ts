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
    actions: 'Actions'
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
    gettingStarted: 'Getting Started',
    startByCreating: 'Start by creating a new order',
    checkProfile: 'Check your profile in the top right menu',
    monitorTeam: 'Monitor team performance in Analytics',
    manageUsersAdmin: 'Manage users and assign roles'
  },

  orders: {
    title: 'Order Management',
    description: 'View and manage all orders',
    newOrder: '+ New Order',
    createOrder: 'Create Order',
    editOrder: 'Edit Order',
    orderDetails: 'Order Details',
    orderNumber: 'Order #',
    createdBy: 'Created by',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    viewOrder: 'View',
    deleteOrder: 'Delete',
    confirmDelete: 'Are you sure you want to delete this order?',
    status: 'Status',
    changeStatus: 'Change Status',
    
    statuses: {
      new: 'New',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    },

    filters: {
      searchPlaceholder: 'Search by title or description...',
      allStatuses: 'All Statuses'
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

  analytics: {
    title: 'Analytics Dashboard',
    description: 'Complete overview of orders and user statistics',
    totalOrders: 'Total Orders',
    newOrders: 'New Orders',
    inProgress: 'In Progress',
    completed: 'Completed',
    topWorkers: 'Top Workers',
    completedCount: 'completed',
    ordersTrend: 'Orders Created (Last 30 Days)',
    usersByRole: 'Users by Role',
    refreshData: 'Refresh Data',
    noWorkerData: 'No worker data',
    noData: 'No data available'
  },

  validation: {
    required: 'This field is required',
    invalidEmail: 'Invalid email format',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordRequirements: 'Password must contain letters and numbers',
    titleRequired: 'Title is required',
    descriptionRequired: 'Description is required',
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
    failedToSaveUser: 'Failed to save user',
    failedToDeleteUser: 'Failed to delete user',
    orderNotFound: 'Order not found'
  }
}
