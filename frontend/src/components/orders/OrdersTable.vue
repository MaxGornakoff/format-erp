<template>
  <div>
    <div class="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          v-model="searchQuery"
          :label="$t('common.search')"
          :placeholder="$t('orders.filters.searchPlaceholder')"
          @blur="applyFilters"
        />

        <div>
          <select
            v-model="statusFilter"
            class="w-full text-[14px] h-10 px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">{{ $t('orders.filters.allStatuses') }}</option>
            <option value="new">{{ $t('orders.statuses.new') }}</option>
            <option value="in_progress">{{ $t('orders.statuses.in_progress') }}</option>
            <option value="completed">{{ $t('orders.statuses.completed') }}</option>
            <option value="cancelled">{{ $t('orders.statuses.cancelled') }}</option>
          </select>
        </div>

        <div v-if="canFilterByExecutor">
          <select
            v-model="executorFilter"
            :disabled="showScopeToggle && scopeFilter === 'mine'"
            class="w-full text-[14px] h-10 px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            @change="applyFilters"
          >
            <option value="">{{ $t('orders.filters.allExecutors') }}</option>
            <option v-for="responsible in store.responsibleOptions" :key="responsible" :value="responsible">
              {{ responsible }}
            </option>
          </select>
        </div>

        <div class="flex items-end gap-2 flex-wrap" :class="canFilterByExecutor ? 'md:justify-end' : 'md:col-span-2'">
          <div
            v-if="showScopeToggle"
            class="relative flex h-10 items-center rounded-full border border-slate-200 bg-slate-100/90 p-1 shadow-sm"
          >
            <span
              class="pointer-events-none absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm ring-1 ring-blue-100 transition-all duration-300 ease-out"
              :class="scopeFilter === 'mine' ? 'left-1' : 'left-[calc(50%+0px)]'"
              aria-hidden="true"
            />

            <button
              type="button"
              class="relative z-10 min-w-[78px] rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200"
              :class="scopeFilter === 'mine' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'"
              @click="setScopeFilter('mine')"
            >
              Свои
            </button>
            <button
              type="button"
              class="relative z-10 min-w-[78px] rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200"
              :class="scopeFilter === 'all' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'"
              @click="setScopeFilter('all')"
            >
              Все
            </button>
          </div>

          <Button
            v-if="hasActiveFilters"
            variant="ghost"
            size="sm"
            :title="$t('common.resetFilters')"
            :aria-label="$t('common.resetFilters')"
            disable-focus-styles
            class="!flex !h-10 !w-10 !items-center !justify-center !px-0 !py-0"
            @click="resetFilters"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4.5 w-4.5" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </Button>
        </div>
      </div>
    </div>

    <div v-if="store.isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingOrders') }}</p>
    </div>

    <Alert
      v-if="store.error"
      type="error"
      :title="$t('common.error')"
      :message="store.error"
    />

    <Table
      v-if="!store.isLoading"
      :columns="columns"
      :rows="store.orders"
      :pagination="pagination"
      :sort-field="store.sortField"
      :sort-direction="store.sortDirection"
      :clickable-rows="true"
      :reorderable-columns="true"
      column-order-key="orders-table"
      @sort="handleSort"
      @next-page="handleNextPage"
      @prev-page="handlePrevPage"
      @row-click="handleRowClick"
    >
      <template #cell-id="{ row }">
        <span class="font-semibold text-gray-900 text-[14px]">#{{ row.id }}</span>
      </template>

      <template #cell-executor="{ row }">
        <div class="min-w-[10rem]">
          <p class="font-medium text-gray-900 text-[14px]">{{ row.responsible_name || row.user?.name || '—' }}</p>
        </div>
      </template>

      <template #cell-created_at="{ value }">
        {{ formatTableDate(String(value ?? '')) }}
      </template>

      <template #cell-description="{ row }">
        <div
          class="min-w-[12.5rem] max-w-[19.5rem] overflow-hidden text-sm text-gray-700 leading-5"
          :title="row.description || '—'"
          style="display: -webkit-box; line-clamp: 2; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
        >
          {{ row.description || '—' }}
        </div>
      </template>

      <template #cell-note="{ row }">
        <div class="min-w-[18rem] max-w-[28rem] whitespace-pre-wrap break-words text-sm text-gray-600 leading-6">
          {{ row.note || '—' }}
        </div>
      </template>

      <template #cell-package_cost="{ value }">
        {{ formatCurrency(value) }}
      </template>

      <template #cell-order_cost="{ value }">
        {{ formatCurrency(value) }}
      </template>

      <template #cell-priority="{ row }">
        <Badge :variant="getPriorityVariant(row.priority)">
          {{ formatPriority(row.priority) }}
        </Badge>
      </template>

      <template #cell-status="{ row }">
        <div class="whitespace-nowrap min-w-max">
          <Badge :variant="getStatusVariant(row.status)">
            {{ formatStatus(row.status) }}
          </Badge>
        </div>
      </template>

      <template #pagination-right-extra>
        <Button @click="$emit('create')">
          {{ $t('orders.newOrder') }}
        </Button>
      </template>

      <template v-if="canViewFinancials" #pagination-left-extra>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          <p class="whitespace-nowrap">
            <span class="font-medium text-gray-700">{{ $t('orders.totals.orderCost') }}:</span>
            <span class="ml-1 font-semibold text-gray-900">{{ formatCurrency(store.filteredOrderCostTotal) }}</span>
          </p>
          <p class="whitespace-nowrap">
            <span class="font-medium text-gray-700">{{ $t('orders.totals.packageCost') }}:</span>
            <span class="ml-1 font-semibold text-gray-900">{{ formatCurrency(store.filteredPackageCostTotal) }}</span>
          </p>
        </div>
      </template>

      <template v-if="isAdmin" #actions="{ row }">
        <div class="flex justify-center">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors duration-200 hover:bg-red-100 hover:text-red-700"
            :title="$t('common.delete')"
            :aria-label="$t('common.delete')"
            @click.stop="$emit('delete', row.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="h-5 w-5"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75h6a1 1 0 0 1 1 1V6h3a.75.75 0 0 1 0 1.5h-.64l-.72 10.12A2.25 2.25 0 0 1 15.4 19.5H8.6a2.25 2.25 0 0 1-2.24-1.88L5.64 7.5H5A.75.75 0 0 1 5 6h3V4.75a1 1 0 0 1 1-1Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 10.5v5m4-5v5" />
            </svg>
          </button>
        </div>
      </template>
    </Table>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import type { OrderPriority, OrderStatus } from '@/services/orderService'
import Table from '@/components/ui/Table.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'

const route = useRoute()
const router = useRouter()
const store = useOrderStore()
const authStore = useAuthStore()
const { t } = useI18n()
const { formatTableDate } = useFormattedDate()

const searchQuery = ref('')
const statusFilter = ref('')
const executorFilter = ref('')
const scopeFilter = ref<'all' | 'mine'>('all')

const columns = computed(() => [
  { key: 'id', label: t('orders.orderNumberShort'), sortable: true },
  { key: 'executor', label: t('orders.executor') },
  { key: 'created_at', label: t('orders.date'), sortable: true },
  { key: 'description', label: t('orders.formDescription') },
  { key: 'note', label: t('orders.note') },
  ...(canViewFinancials.value
    ? [
        { key: 'package_cost', label: t('orders.packageCost'), sortable: true },
        { key: 'order_cost', label: t('orders.orderCost'), sortable: true },
      ]
    : []),
  { key: 'priority', label: t('orders.priority'), sortable: true },
  { key: 'status', label: t('orders.status'), sortable: true },
])

const pagination = computed(() => ({
  currentPage: store.currentPage,
  totalPages: store.totalPages,
  total: store.total,
}))

const isAdmin = computed(() => authStore.isAdmin)
const showScopeToggle = computed(() => authStore.isManager)
const canFilterByExecutor = computed(() => true)
const canViewFinancials = computed(() => !authStore.isWorker)
const hasActiveFilters = computed(() => {
  return Boolean(
    statusFilter.value
    || searchQuery.value.trim()
    || executorFilter.value
    || (showScopeToggle.value && scopeFilter.value === 'mine')
  )
})

const getStatusVariant = (status: OrderStatus): 'info' | 'warning' | 'success' | 'danger' | 'default' => {
  const variants: Record<OrderStatus, 'info' | 'warning' | 'success' | 'danger'> = {
    new: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  }
  return variants[status] || 'default'
}

const getPriorityVariant = (priority: OrderPriority): 'info' | 'warning' | 'success' | 'danger' | 'default' => {
  const variants: Record<OrderPriority, 'default' | 'warning' | 'danger'> = {
    low: 'default',
    medium: 'warning',
    high: 'danger',
  }
  return variants[priority] || 'default'
}

const formatStatus = (status: OrderStatus) => {
  const formatted: Record<OrderStatus, string> = {
    new: t('orders.statuses.new'),
    in_progress: t('orders.statuses.in_progress'),
    completed: t('orders.statuses.completed'),
    cancelled: t('orders.statuses.cancelled'),
  }
  return formatted[status] || status
}

const formatPriority = (priority: OrderPriority) => {
  const formatted: Record<OrderPriority, string> = {
    low: t('orders.priorities.low'),
    medium: t('orders.priorities.medium'),
    high: t('orders.priorities.high'),
  }
  return formatted[priority] || priority
}

const formatCurrency = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '—'
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(numericValue)
}

const handleRowClick = (row: any) => {
  emit('view', row.id)
}

const allowedStatuses: OrderStatus[] = ['new', 'in_progress', 'completed', 'cancelled']

const syncFiltersFromRoute = () => {
  const routeStatus = typeof route.query.status === 'string' ? route.query.status : ''
  const routeSearch = typeof route.query.search === 'string' ? route.query.search : ''
  const routeExecutor = typeof route.query.executor === 'string' ? route.query.executor : ''
  const routeScope = showScopeToggle.value && route.query.scope === 'mine' ? 'mine' : 'all'
  const normalizedStatus = allowedStatuses.includes(routeStatus as OrderStatus)
    ? routeStatus as OrderStatus
    : ''

  statusFilter.value = normalizedStatus
  searchQuery.value = routeSearch
  executorFilter.value = routeExecutor
  scopeFilter.value = routeScope
  store.setStatusFilter(normalizedStatus || undefined)
  store.setExecutorFilter(routeScope === 'mine' ? undefined : routeExecutor || undefined)
  store.setMineOnlyFilter(routeScope === 'mine')
  store.setSearchQuery(routeSearch)
}

const buildFilterQuery = () => {
  const query: Record<string, string> = {}

  if (statusFilter.value) {
    query.status = statusFilter.value
  }

  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim()
  }

  if (showScopeToggle.value && scopeFilter.value === 'mine') {
    query.scope = 'mine'
  } else if (executorFilter.value) {
    query.executor = executorFilter.value
  }

  return query
}

const applyFilters = async () => {
  store.goToPage(1)
  store.setMineOnlyFilter(showScopeToggle.value && scopeFilter.value === 'mine')
  await router.replace({ query: buildFilterQuery() })
}

const setScopeFilter = async (scope: 'all' | 'mine') => {
  if (scopeFilter.value === scope) {
    return
  }

  scopeFilter.value = scope
  await applyFilters()
}

const resetFilters = async () => {
  searchQuery.value = ''
  statusFilter.value = ''
  executorFilter.value = ''
  scopeFilter.value = 'all'
  store.resetFilters()
  await router.replace({ query: {} })
}

const handleSort = (field: string) => {
  const newDirection = store.sortField === field && store.sortDirection === 'asc' ? 'desc' : 'asc'
  store.setSorting(field, newDirection)
  loadOrders()
}

const handleNextPage = () => {
  store.goToPage(store.currentPage + 1)
  loadOrders()
}

const handlePrevPage = () => {
  store.goToPage(store.currentPage - 1)
  loadOrders()
}

const loadOrders = async () => {
  await store.fetchOrders()
}

watch(
  () => [route.query.status, route.query.search, route.query.executor, route.query.scope],
  async () => {
    syncFiltersFromRoute()
    await loadOrders()
  },
  { immediate: true }
)

const emit = defineEmits<{
  'view': [id: number]
  'delete': [id: number]
  'create': []
}>()
</script>
