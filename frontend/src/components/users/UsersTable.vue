<template>
  <div>
    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          v-model="searchQuery"
          :label="$t('common.search')"
          :placeholder="$t('users.filters.searchPlaceholder')"
          @blur="applyFilters"
        />

        <div>
          <FilterSelect
            v-model="roleFilter"
            :options="roleOptions"
            :placeholder="$t('users.filters.allRoles')"
            @change="applyFilters"
          />
        </div>

        <div class="flex items-end justify-end gap-2">
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

    <div v-if="store.isLoading" class="py-8 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingUsers') }}</p>
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
      :rows="store.users"
      :pagination="pagination"
      :sort-field="store.sortField"
      :sort-direction="store.sortDirection"
      :clickable-rows="true"
      :reorderable-columns="true"
      column-order-key="users-table"
      @sort="handleSort"
      @next-page="handleNextPage"
      @prev-page="handlePrevPage"
      @row-click="handleRowClick"
    >
      <template v-if="isAdmin" #header-select>
        <div class="bulk-select-header flex w-full items-center justify-center" @click.stop>
          <input
            type="checkbox"
            class="bulk-select-checkbox m-0 block h-4 w-4 rounded border-white/70 text-blue-600 focus:outline-none focus:ring-0 focus:border-white/70 disabled:cursor-not-allowed disabled:opacity-40"
            :checked="allVisibleUsersSelected"
            :disabled="selectableUserIds.length === 0"
            :aria-label="$t('common.deleteSelected')"
            @change="toggleSelectAllUsers"
          />
        </div>
      </template>

      <template v-if="isAdmin" #cell-select="{ row }">
        <div class="bulk-select-cell flex w-full items-center justify-center" @click.stop>
          <input
            type="checkbox"
            class="bulk-select-checkbox m-0 block h-4 w-4 rounded border-gray-300 text-blue-600 focus:outline-none focus:ring-0 focus:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
            :checked="selectedUserIds.includes(row.id)"
            :disabled="isProtectedUser(row)"
            :title="isProtectedUser(row) ? $t('users.primaryAdminProtected') : undefined"
            @change="toggleUserSelection(row.id)"
          />
        </div>
      </template>

      <template #cell-id="{ row }">
        <span class="font-semibold text-gray-900 text-[14px]">#{{ row.id }}</span>
      </template>

      <template #cell-name="{ row }">
        <div class="min-w-[12rem]">
          <p class="text-[14px] font-medium text-gray-900">{{ row.name }}</p>
          <p v-if="row.real_name" class="mt-0.5 text-xs text-gray-500">{{ row.real_name }}</p>
        </div>
      </template>

      <template #cell-email="{ row }">
        <div class="text-sm text-gray-700">{{ row.email }}</div>
      </template>

      <template #cell-role="{ row }">
        <Badge :variant="getRoleVariant(row.role)">
          {{ formatRole(row.role) }}
        </Badge>
      </template>

      <template #cell-is_tracked="{ row }">
        <Badge :variant="row.is_tracked ? 'success' : 'default'">
          {{ row.is_tracked ? $t('users.tracked') : $t('users.notTracked') }}
        </Badge>
      </template>

      <template #cell-created_at="{ value }">
        {{ formatTableDate(String(value ?? '')) }}
      </template>

      <template #pagination-right-extra>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <span
            v-if="hasSelectedUsers"
            class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {{ $t('common.selectedCount', { count: selectedUserIds.length }) }}
          </span>

          <Button
            v-if="hasSelectedUsers"
            variant="danger"
            size="sm"
            @click="emitBulkDelete"
          >
            {{ $t('common.deleteSelected') }}
          </Button>

          <Button @click="$emit('create')">
            {{ $t('users.newUser') }}
          </Button>
        </div>
      </template>

      <template v-if="isAdmin" #actions="{ row }">
        <div class="flex justify-center">
          <button
            type="button"
            :disabled="isProtectedUser(row)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-200"
            :class="isProtectedUser(row)
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300'
              : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'"
            :title="isProtectedUser(row) ? $t('users.primaryAdminProtected') : $t('common.delete')"
            :aria-label="isProtectedUser(row) ? $t('users.primaryAdminProtected') : $t('common.delete')"
            @click.stop="!isProtectedUser(row) && $emit('delete', row.id)"
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
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { isPrimaryAdminUser, type User } from '@/services/userService'
import Table from '@/components/ui/Table.vue'
import Input from '@/components/ui/Input.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'

const store = useUserStore()
const authStore = useAuthStore()
const { t } = useI18n()
const { formatTableDate } = useFormattedDate()
const emit = defineEmits<{
  'create': []
  'view': [id: number]
  'delete': [id: number]
  'bulk-delete': [ids: number[]]
}>()

const searchQuery = ref('')
const roleFilter = ref('')
const selectedUserIds = ref<number[]>([])

const isAdmin = computed(() => authStore.isAdmin)
const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim() || roleFilter.value))
const isProtectedUser = (user: Pick<User, 'email' | 'role'> | null | undefined) => isPrimaryAdminUser(user)
const selectableUserIds = computed(() => store.users
  .filter((user) => !isProtectedUser(user))
  .map((user) => user.id))
const hasSelectedUsers = computed(() => selectedUserIds.value.length > 0)
const allVisibleUsersSelected = computed(() => (
  selectableUserIds.value.length > 0
    && selectableUserIds.value.every((id) => selectedUserIds.value.includes(id))
))

const columns = computed(() => [
  ...(isAdmin.value ? [{ key: 'select', label: '', reorderable: false }] : []),
  { key: 'id', label: t('users.id'), sortable: true },
  { key: 'name', label: t('users.name'), sortable: true },
  { key: 'email', label: t('users.email'), sortable: true },
  { key: 'role', label: t('users.role'), sortable: true },
  { key: 'is_tracked', label: t('users.tracking'), sortable: true },
  { key: 'created_at', label: t('users.created'), sortable: true },
])

const roleOptions = computed(() => [
  { value: '', label: t('users.filters.allRoles') },
  { value: 'admin', label: t('users.roles.admin') },
  { value: 'manager', label: t('users.roles.manager') },
  { value: 'worker', label: t('users.roles.worker') },
])

const pagination = computed(() => ({
  currentPage: store.currentPage,
  totalPages: store.totalPages,
  total: store.total,
}))

watch(selectableUserIds, (ids) => {
  selectedUserIds.value = selectedUserIds.value.filter((id) => ids.includes(id))
}, { immediate: true })

const getRoleVariant = (role: string): 'info' | 'warning' | 'danger' | 'default' => {
  const variants: Record<string, 'info' | 'warning' | 'danger' | 'default'> = {
    admin: 'danger',
    manager: 'warning',
    worker: 'info',
  }

  return variants[role] || 'default'
}

const formatRole = (role: string) => {
  const formatted: Record<string, string> = {
    admin: t('users.roles.admin'),
    manager: t('users.roles.manager'),
    worker: t('users.roles.worker'),
  }

  return formatted[role] || role
}

const applyFilters = async () => {
  store.setRoleFilter(roleFilter.value || undefined)
  store.setSearchQuery(searchQuery.value.trim())
  store.goToPage(1)
  await loadUsers()
}

const resetFilters = async () => {
  searchQuery.value = ''
  roleFilter.value = ''
  store.resetFilters()
  await loadUsers()
}

const handleSort = (field: string) => {
  const newDirection = store.sortField === field && store.sortDirection === 'asc' ? 'desc' : 'asc'
  store.setSorting(field, newDirection)
  void loadUsers()
}

const handleNextPage = () => {
  store.goToPage(store.currentPage + 1)
  void loadUsers()
}

const handlePrevPage = () => {
  store.goToPage(store.currentPage - 1)
  void loadUsers()
}

const handleRowClick = (row: { id: number }) => {
  emit('view', row.id)
}

const toggleUserSelection = (userId: number) => {
  const user = store.users.find((item) => item.id === userId)

  if (isProtectedUser(user)) {
    return
  }

  selectedUserIds.value = selectedUserIds.value.includes(userId)
    ? selectedUserIds.value.filter((id) => id !== userId)
    : [...selectedUserIds.value, userId]
}

const toggleSelectAllUsers = () => {
  selectedUserIds.value = allVisibleUsersSelected.value ? [] : [...selectableUserIds.value]
}

const emitBulkDelete = () => {
  if (!hasSelectedUsers.value) {
    return
  }

  emit('bulk-delete', [...selectedUserIds.value])
}

const loadUsers = async () => {
  await store.fetchUsers()
}

onMounted(() => {
  void loadUsers()
})
</script>

