<template>
  <header class="bg-gray-900 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
    <div class="logo flex items-center gap-3 text-white font-semibold uppercase text-lg">
      <img :src="logo" alt="Format Management logo" class="h-10 w-auto object-contain" />
      <p>Управление заказами</p>
    </div>
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
import logo from '@/assets/images/logo_for_site.svg'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

