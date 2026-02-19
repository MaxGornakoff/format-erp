<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">Format Management</h1>
    <div class="flex items-center space-x-4">
      <span class="text-sm text-gray-600">{{ authStore.user?.name }}</span>
      <button
        @click="handleLogout"
        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        {{ $t('auth.logout') }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

