<template>
  <div>
    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Search -->
        <Input
          v-model="searchQuery"
          :label="$t('common.search')"
          :placeholder="$t('users.filters.searchPlaceholder')"
          @blur="applyFilters"
        />

        <!-- Role Filter -->
        <div>
        
          <select
            v-model="roleFilter"
            class="w-full h-10 px-3 py-2 text-[14px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">{{ $t('users.filters.allRoles') }}</option>
            <option value="admin">{{ $t('users.roles.admin') }}</option>
            <option value="manager">{{ $t('users.roles.manager') }}</option>
            <option value="worker">{{ $t('users.roles.worker') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingUsers') }}</p>
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
      :rows="store.users"
      :pagination="pagination"
      :sort-field="store.sortField"
      :sort-direction="store.sortDirection"
      :reorderable-columns="true"
      column-order-key="users-table"
      @sort="handleSort"
      @next-page="handleNextPage"
      @prev-page="handlePrevPage"
    >
      <!-- Email Cell -->
      <template #cell-email="{ row }">
        <div class="text-sm">{{ row.email }}</div>
      </template>

      <!-- Role Cell -->
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

      <!-- Created Cell -->
      <template #cell-created_at="{ value }">
        {{ formatTableDate(String(value ?? '')) }}
      </template>

      <!-- Actions -->
      <template #actions="{ row }">
        <div class="flex gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            @click="$emit('edit', row.id)"
          >
            {{ $t('common.edit') }}
          </Button>
          <Button
            variant="danger"
            size="sm"
            @click="$emit('delete', row.id)"
          >
            {{ $t('common.delete') }}
          </Button>
        </div>
      </template>
    </Table>

    <!-- New User Button -->
    <div class="mt-6 flex justify-end">
      <Button @click="$emit('create')">
        {{ $t('users.newUser') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import { useUserStore } from '@/stores/userStore'
import Table from '@/components/ui/Table.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'

const store = useUserStore()
const { t } = useI18n()
const { formatTableDate } = useFormattedDate()

const searchQuery = ref('')
const roleFilter = ref('')

const columns = computed(() => [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: t('users.name'), sortable: true },
  { key: 'email', label: t('users.email'), sortable: true },
  { key: 'role', label: t('users.role'), sortable: true },
  { key: 'is_tracked', label: t('users.tracking'), sortable: true },
  { key: 'created_at', label: t('users.created'), sortable: true }
])

const pagination = computed(() => ({
  currentPage: store.currentPage,
  totalPages: store.totalPages,
  total: store.total
}))

const getRoleVariant = (role: string): 'info' | 'warning' | 'danger' | 'default' => {
  const variants: Record<string, 'info' | 'warning' | 'danger' | 'default'> = {
    admin: 'danger',
    manager: 'warning',
    worker: 'info'
  }
  return variants[role] || 'default'
}

const formatRole = (role: string) => {
  const formatted: Record<string, string> = {
    admin: t('users.roles.admin'),
    manager: t('users.roles.manager'),
    worker: t('users.roles.worker')
  }
  return formatted[role] || role
}

const applyFilters = async () => {
  store.setRoleFilter(roleFilter.value || undefined)
  store.setSearchQuery(searchQuery.value)
  store.goToPage(1)
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

const loadUsers = async () => {
  await store.fetchUsers()
}

onMounted(() => {
  void loadUsers()
})

defineEmits<{
  'create': []
  'edit': [id: number]
  'delete': [id: number]
}>()
</script>

