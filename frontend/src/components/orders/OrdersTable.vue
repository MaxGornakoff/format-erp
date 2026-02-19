<template>
  <div>
    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <Input
          v-model="searchQuery"
          :label="$t('common.search')"
          :placeholder="$t('orders.filters.searchPlaceholder')"
          @blur="applyFilters"
        />

        <!-- Status Filter -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('orders.status') }}</label>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">{{ $t('orders.filters.allStatuses') }}</option>
            <option value="new">{{ $t('orders.statuses.new') }}</option>
            <option value="in_progress">{{ $t('orders.statuses.in_progress') }}</option>
            <option value="completed">{{ $t('orders.statuses.completed') }}</option>
            <option value="cancelled">{{ $t('orders.statuses.cancelled') }}</option>
          </select>
        </div>

        <!-- Refresh Button -->
        <div class="flex items-end gap-2">
          <Button variant="secondary" @click="loadOrders">
            {{ $t('common.refresh') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingOrders') }}</p>
    </div>

    <!-- Error State -->
    <Alert
      v-if="store.error"
      type="error"
      :title="$t('common.error')"
      :message="store.error"
    />

    <!-- Table -->
    <Table
      v-if="!store.isLoading"
      :columns="columns"
      :rows="store.orders"
      :pagination="pagination"
      :sort-field="store.sortField"
      :sort-direction="store.sortDirection"
      @sort="handleSort"
      @next-page="handleNextPage"
      @prev-page="handlePrevPage"
    >
      <!-- Status Cell -->
      <template #cell-status="{ row }">
        <Badge :variant="getStatusVariant(row.status)">
          {{ formatStatus(row.status) }}
        </Badge>
      </template>

      <!-- Title Cell (truncated) -->
      <template #cell-title="{ row }">
        <div class="max-w-xs truncate" :title="row.title">
          {{ row.title }}
        </div>
      </template>

      <!-- Created At Cell -->
      <template #cell-created_at="{ value }">
        {{ formatTableDate(value) }}
      </template>

      <!-- Actions -->
      <template #actions="{ row }">
        <div class="flex gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            @click="$emit('view', row.id)"
          >
            {{ $t('orders.viewOrder') }}
          </Button>
          <Button
            v-if="isOwnerOrManager(row)"
            variant="ghost"
            size="sm"
            @click="$emit('edit', row.id)"
          >
            {{ $t('common.edit') }}
          </Button>
          <Button
            v-if="isAdmin"
            variant="danger"
            size="sm"
            @click="$emit('delete', row.id)"
          >
            {{ $t('common.delete') }}
          </Button>
        </div>
      </template>
    </Table>

    <!-- New Order Button -->
    <div class="mt-6 flex justify-end">
      <Button @click="$emit('create')">
        {{ $t('orders.newOrder') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import Table from '@/components/ui/Table.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'

const store = useOrderStore()
const authStore = useAuthStore()
const { t } = useI18n()
const { formatTableDate } = useFormattedDate()

const searchQuery = ref('')
const statusFilter = ref('')

const columns = computed(() => [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'title', label: t('orders.title'), sortable: true },
  { key: 'status', label: t('orders.status'), sortable: true },
  { key: 'created_at', label: t('orders.createdAt'), sortable: true }
])

const pagination = computed(() => ({
  currentPage: store.currentPage,
  totalPages: store.totalPages,
  total: store.total
}))

const isAdmin = computed(() => authStore.isAdmin)

const getStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    new: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return variants[status] || 'default'
}

const formatStatus = (status: string) => {
  const formatted: Record<string, string> = {
    new: t('orders.statuses.new'),
    in_progress: t('orders.statuses.in_progress'),
    completed: t('orders.statuses.completed'),
    cancelled: t('orders.statuses.cancelled')
  }
  return formatted[status] || status
}

const isOwnerOrManager = (row: any) => {
  // Assuming row has user_id field
  return authStore.isManager || (authStore.user?.id === row.user_id && row.status === 'new')
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

defineEmits<{
  'view': [id: number]
  'edit': [id: number]
  'delete': [id: number]
  'create': []
}>()
</script>
