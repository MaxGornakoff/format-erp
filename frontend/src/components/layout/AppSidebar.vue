<template>
  <aside class="w-64 bg-gray-900 text-white p-6">
    <nav class="space-y-4">
      <router-link
        to="/"
        class="block px-4 py-2 rounded-md hover:bg-gray-800 transition"
        :class="{ 'bg-blue-600': $route.name === 'Dashboard' }"
      >
        📊 {{ $t('navigation.dashboard') }}
      </router-link>

      <router-link
        to="/orders"
        class="block px-4 py-2 rounded-md hover:bg-gray-800 transition"
        :class="{ 'bg-blue-600': $route.name === 'Orders' || $route.name === 'OrderDetail' }"
      >
        📋 {{ $t('navigation.orders') }}
      </router-link>

      <router-link
        v-if="authStore.isManager || authStore.isAdmin"
        to="/analytics"
        class="block px-4 py-2 rounded-md hover:bg-gray-800 transition"
        :class="{ 'bg-blue-600': $route.name === 'Analytics' }"
      >
        📈 {{ $t('navigation.analytics') }}
      </router-link>

      <router-link
        v-if="authStore.isAdmin"
        to="/users"
        class="block px-4 py-2 rounded-md hover:bg-gray-800 transition"
        :class="{ 'bg-blue-600': $route.name === 'Users' }"
      >
        👥 {{ $t('navigation.users') }}
      </router-link>
    </nav>

    <div class="mt-8 pt-8 border-t border-gray-700">
      <div class="text-sm text-gray-400">
        <p>{{ $t('dashboard.yourRole') }}:</p>
        <p class="font-bold text-white mt-2 capitalize">{{ getRoleLabel(authStore.user?.role) }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { t } = useI18n()

const getRoleLabel = (role?: string) => {
  if (!role) return ''
  const roleMap: Record<string, string> = {
    admin: t('users.roles.admin'),
    manager: t('users.roles.manager'),
    worker: t('users.roles.worker')
  }
  return roleMap[role] || role
}
</script>

