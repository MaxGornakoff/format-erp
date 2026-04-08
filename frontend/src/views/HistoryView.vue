<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">{{ $t('history.title') }}</h1>
      <p class="text-gray-600">{{ $t('history.description') }}</p>
    </div>

    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          v-model="searchQuery"
          :label="$t('common.search')"
          :placeholder="$t('history.filters.searchPlaceholder')"
          @blur="applyFilters"
        />

        <div>
        
          <select
            v-model="actionFilter"
            class="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">{{ $t('history.filters.allActions') }}</option>
            <option v-for="option in actionOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="flex items-end gap-2">
          <Button variant="secondary" disable-focus-styles @click="loadHistory">
            {{ $t('common.refresh') }}
          </Button>
        </div>
      </div>
    </div>

    <div v-if="store.isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">{{ $t('history.loading') }}</p>
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
      :rows="store.logs"
      :pagination="pagination"
      :reorderable-columns="true"
      column-order-key="history-table"
      @next-page="handleNextPage"
      @prev-page="handlePrevPage"
    >
      <template #cell-created_at="{ value }">
        {{ formatTableDate(String(value ?? '')) }}
      </template>

      <template #cell-user_name="{ row }">
        <div class="min-w-[12rem]">
          <p class="font-medium text-gray-900">{{ row.user_name }}</p>
          <p class="text-xs text-gray-500">{{ row.user_email || '—' }}</p>
        </div>
      </template>

      <template #cell-user_role="{ row }">
        <Badge :variant="getRoleVariant(row.user_role)">
          {{ formatRole(row.user_role) }}
        </Badge>
      </template>

      <template #cell-action="{ row }">
        <Badge :variant="getActionVariant(row.action)">
          {{ formatAction(row.action) }}
        </Badge>
      </template>

      <template #cell-subject_type="{ row }">
        <span class="text-sm text-gray-700">
          {{ formatSubject(row.subject_type, row.subject_id) }}
        </span>
      </template>

      <template #cell-description="{ row }">
        <div class="min-w-[16rem] max-w-[28rem] whitespace-pre-wrap break-words text-sm text-gray-600 leading-5">
          {{ row.description || '—' }}
        </div>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import { useHistoryStore } from '@/stores/historyStore'
import type { ActivityLog } from '@/services/historyService'
import Table from '@/components/ui/Table.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'

const store = useHistoryStore()
const { t } = useI18n()
const { formatTableDate } = useFormattedDate()

const searchQuery = ref('')
const actionFilter = ref('')

const columns = computed(() => [
  { key: 'created_at', label: t('history.time') },
  { key: 'user_name', label: t('history.user') },
  { key: 'user_role', label: t('users.role') },
  { key: 'action', label: t('history.action') },
  { key: 'subject_type', label: t('history.subject') },
  { key: 'description', label: t('history.details') },
])

const actionOptions = computed(() => [
  { value: 'session.login', label: formatAction('session.login') },
  { value: 'session.logout', label: formatAction('session.logout') },
  { value: 'order.create', label: formatAction('order.create') },
  { value: 'order.read', label: formatAction('order.read') },
  { value: 'order.update', label: formatAction('order.update') },
  { value: 'order.delete', label: formatAction('order.delete') },
  { value: 'user.create', label: formatAction('user.create') },
  { value: 'user.read', label: formatAction('user.read') },
  { value: 'user.read.list', label: formatAction('user.read.list') },
  { value: 'user.update', label: formatAction('user.update') },
  { value: 'user.delete', label: formatAction('user.delete') },
  { value: 'tracking.enabled', label: formatAction('tracking.enabled') },
  { value: 'tracking.disabled', label: formatAction('tracking.disabled') },
])

const pagination = computed(() => ({
  currentPage: store.currentPage,
  totalPages: store.totalPages,
  total: store.total,
}))

const roleVariantMap: Record<string, 'info' | 'warning' | 'danger' | 'default'> = {
  worker: 'info',
  manager: 'warning',
  admin: 'danger',
}

const actionVariantMap: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  'session.login': 'success',
  'session.logout': 'warning',
  'order.create': 'success',
  'order.read': 'info',
  'order.update': 'warning',
  'order.delete': 'danger',
  'user.create': 'success',
  'user.read': 'info',
  'user.read.list': 'info',
  'user.update': 'warning',
  'user.delete': 'danger',
  'tracking.enabled': 'success',
  'tracking.disabled': 'danger',
}

const formatRole = (role?: ActivityLog['user_role']) => {
  if (!role) return '—'

  const formatted: Record<string, string> = {
    admin: t('users.roles.admin'),
    manager: t('users.roles.manager'),
    worker: t('users.roles.worker'),
  }

  return formatted[role] || role
}

const formatAction = (action: string) => {
  const formatted: Record<string, string> = {
    'session.login': t('history.actions.sessionLogin'),
    'session.logout': t('history.actions.sessionLogout'),
    'order.create': t('history.actions.orderCreate'),
    'order.read': t('history.actions.orderRead'),
    'order.update': t('history.actions.orderUpdate'),
    'order.delete': t('history.actions.orderDelete'),
    'user.create': t('history.actions.userCreate'),
    'user.read': t('history.actions.userRead'),
    'user.read.list': t('history.actions.userReadList'),
    'user.update': t('history.actions.userUpdate'),
    'user.delete': t('history.actions.userDelete'),
    'tracking.enabled': t('history.actions.trackingEnabled'),
    'tracking.disabled': t('history.actions.trackingDisabled'),
  }

  return formatted[action] || action
}

const formatSubject = (subjectType: string | null, subjectId: number | null) => {
  if (!subjectType) {
    return '—'
  }

  const labels: Record<string, string> = {
    session: t('history.subjects.session'),
    order: t('history.subjects.order'),
    user: t('history.subjects.user'),
  }

  const label = labels[subjectType] || subjectType
  return subjectId ? `${label} #${subjectId}` : label
}

const getRoleVariant = (role?: ActivityLog['user_role']) => {
  if (!role) return 'default'
  return roleVariantMap[role] || 'default'
}

const getActionVariant = (action: string) => {
  return actionVariantMap[action] || 'default'
}

const applyFilters = async () => {
  store.setSearchQuery(searchQuery.value)
  store.setActionFilter(actionFilter.value)
  store.goToPage(1)
  await loadHistory()
}

const handleNextPage = () => {
  store.goToPage(store.currentPage + 1)
  void loadHistory()
}

const handlePrevPage = () => {
  store.goToPage(store.currentPage - 1)
  void loadHistory()
}

const loadHistory = async () => {
  await store.fetchHistory()
}

onMounted(() => {
  void loadHistory()
})
</script>
