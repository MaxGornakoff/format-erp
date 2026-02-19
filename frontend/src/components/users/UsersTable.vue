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
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('users.role') }}</label>
          <select
            v-model="roleFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingUsers') }}</p>
    </div>

    <!-- Error State -->
    <Alert
      v-if="error"
      type="error"
      :title="$t('common.error')"
      :message="error"
    />

    <!-- Table -->
    <Table
      v-if="!isLoading"
      :columns="columns"
      :rows="users"
      :pagination="pagination"
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

      <!-- Created Cell -->
      <template #cell-created_at="{ value }">
        {{ formatTableDate(value) }}
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
import Table from '@/components/ui/Table.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'
import type { User } from '@/services/userService'

const { t } = useI18n()
const { formatTableDate } = useFormattedDate()

const searchQuery = ref('')
const roleFilter = ref('')
const isLoading = ref(false)
const error = ref('')
const users = ref<User[]>([])
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  total: 0
})

const columns = computed(() => [
  { key: 'id', label: 'ID' },
  { key: 'name', label: t('users.name') },
  { key: 'email', label: t('users.email') },
  { key: 'role', label: t('users.role') },
  { key: 'created_at', label: t('users.created') }
])

const getRoleVariant = (role: string) => {
  const variants: Record<string, string> = {
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
  // TODO: Implement filtering
  await loadUsers()
}

const loadUsers = async () => {
  isLoading.value = true
  try {
    // TODO: Fetch users from backend
    error.value = ''
  } catch (err: any) {
    error.value = err.message || t('messages.failedToLoadUsers')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

defineEmits<{
  'create': []
  'edit': [id: number]
  'delete': [id: number]
}>()
</script>

