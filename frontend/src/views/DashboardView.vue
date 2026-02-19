<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white">
      <h1 class="text-3xl font-bold mb-2">{{ $t('dashboard.welcome', { name: authStore.user?.name }) }}</h1>
      <p class="text-blue-100">{{ $t('dashboard.description') }}</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">{{ $t('dashboard.yourRole') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatRole(authStore.user?.role) }}</p>
          </div>
          <div class="text-4xl">👤</div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">{{ $t('dashboard.memberSince') }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatTableDate(authStore.user?.created_at) }}</p>
          </div>
          <div class="text-4xl">📅</div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">{{ $t('dashboard.status') }}</p>
            <Badge variant="success">{{ $t('dashboard.active') }}</Badge>
          </div>
          <div class="text-4xl">✅</div>
        </div>
      </div>
    </div>

    <!-- Action Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Orders Card -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">📋 {{ $t('dashboard.ordersManagement') }}</h2>
        <p class="text-gray-600 mb-4">{{ $t('dashboard.ordersDescription') }}</p>
        <Button @click="$router.push('/orders')" class="w-full">
          {{ $t('dashboard.goToOrders') }}
        </Button>
      </div>

      <!-- Analytics Card (for Manager/Admin) -->
      <div v-if="isManagerOrAdmin" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">📊 {{ $t('dashboard.analytics') }}</h2>
        <p class="text-gray-600 mb-4">{{ $t('dashboard.analyticsDescription') }}</p>
        <Button @click="$router.push('/analytics')" class="w-full">
          {{ $t('dashboard.viewAnalytics') }}
        </Button>
      </div>

      <!-- Users Management Card (for Admin) -->
      <div v-if="isAdmin" class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">👥 {{ $t('dashboard.usersManagement') }}</h2>
        <p class="text-gray-600 mb-4">{{ $t('dashboard.usersDescription') }}</p>
        <Button @click="$router.push('/users')" class="w-full">
          {{ $t('dashboard.manageUsers') }}
        </Button>
      </div>
    </div>

    <!-- Quick Help -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-blue-900 mb-2">ℹ️ {{ $t('dashboard.gettingStarted') }}</h3>
      <ul class="space-y-2 text-blue-800">
        <li>✅ {{ $t('dashboard.startByCreating') }}</li>
        <li>✅ {{ $t('dashboard.checkProfile') }}</li>
        <li v-if="isManagerOrAdmin">✅ {{ $t('dashboard.monitorTeam') }}</li>
        <li v-if="isAdmin">✅ {{ $t('dashboard.manageUsersAdmin') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

const authStore = useAuthStore()
const { t } = useI18n()
const { formatTableDate } = useFormattedDate()

const isManagerOrAdmin = computed(() => authStore.isManager || authStore.isAdmin)
const isAdmin = computed(() => authStore.isAdmin)

const formatRole = (role?: string) => {
  const formatted: Record<string, string> = {
    admin: t('users.roles.admin'),
    manager: t('users.roles.manager'),
    worker: t('users.roles.worker')
  }
  return formatted[role || ''] || 'Unknown'
}
</script>

