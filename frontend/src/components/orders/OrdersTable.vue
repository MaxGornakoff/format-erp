<template>
  <div>
    <div class="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          v-model="searchQuery"
          :label="$t('common.search')"
          :placeholder="$t('orders.filters.searchPlaceholder')"
          @blur="applyFilters"
        />

        <div>
        
          <select
            v-model="statusFilter"
            class="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">{{ $t('orders.filters.allStatuses') }}</option>
            <option value="new">{{ $t('orders.statuses.new') }}</option>
            <option value="in_progress">{{ $t('orders.statuses.in_progress') }}</option>
            <option value="completed">{{ $t('orders.statuses.completed') }}</option>
            <option value="cancelled">{{ $t('orders.statuses.cancelled') }}</option>
          </select>
        </div>

        <div class="flex items-end gap-2">
          <Button variant="secondary" @click="loadOrders">
            {{ $t('common.refresh') }}
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
      @sort="handleSort"
      @next-page="handleNextPage"
      @prev-page="handlePrevPage"
      @row-click="handleRowClick"
    >
      <template #cell-id="{ row }">
        <span class="font-semibold text-gray-900">#{{ row.id }}</span>
      </template>

      <template #cell-executor="{ row }">
        <div class="min-w-[10rem]">
          <p class="font-medium text-gray-900">{{ row.user?.name || '—' }}</p>
        </div>
      </template>

      <template #cell-created_at="{ value }">
        {{ formatTableDate(String(value ?? '')) }}
      </template>

      <template #cell-description="{ row }">
        <div
          class="min-w-[12.5rem] max-w-[19.5rem] overflow-hidden text-sm text-gray-700 leading-5"
          :title="row.description || '—'"
          style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
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

      <template v-if="isAdmin" #actions="{ row }">
        <div class="flex gap-2 justify-center">
          <Button
            variant="danger"
            size="sm"
            @click.stop="$emit('delete', row.id)"
          >
            {{ $t('common.delete') }}
          </Button>
        </div>
      </template>
    </Table>

    <div class="mt-6 flex justify-end">
      <Button @click="$emit('create')">
        {{ $t('orders.newOrder') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import Table from '@/components/ui/Table.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'
import type { OrderPriority, OrderStatus } from '@/services/orderService'

const store = useOrderStore()
const authStore = useAuthStore()
const { t } = useI18n()
const { formatTableDate } = useFormattedDate()

const searchQuery = ref('')
const statusFilter = ref('')

const columns = computed(() => [
  { key: 'id', label: t('orders.orderNumberShort'), sortable: true },
  { key: 'executor', label: t('orders.executor') },
  { key: 'created_at', label: t('orders.date'), sortable: true },
  { key: 'description', label: t('orders.formDescription') },
  { key: 'note', label: t('orders.note') },
  { key: 'package_cost', label: t('orders.packageCost'), sortable: true },
  { key: 'order_cost', label: t('orders.orderCost'), sortable: true },
  { key: 'priority', label: t('orders.priority'), sortable: true },
  { key: 'status', label: t('orders.status'), sortable: true },
])

const pagination = computed(() => ({
  currentPage: store.currentPage,
  totalPages: store.totalPages,
  total: store.total,
}))

const isAdmin = computed(() => authStore.isAdmin)

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

const applyFilters = async () => {
  store.setStatusFilter(statusFilter.value)
  store.setSearchQuery(searchQuery.value)
  store.goToPage(1)
  await loadOrders()
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

onMounted(() => {
  loadOrders()
})

const emit = defineEmits<{
  'view': [id: number]
  'delete': [id: number]
  'create': []
}>()
</script>
