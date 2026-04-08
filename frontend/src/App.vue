<template>
  <div class="min-h-screen bg-[#F1F1F1] w-full">
    <template v-if="authStore.isInitializing && !authStore.isInitialized">
      <div class="min-h-screen flex items-center justify-center bg-[#F1F1F1]">
        <div class="bg-white px-6 py-5 rounded-xl shadow-sm flex items-center gap-3 text-gray-600 text-sm">
          <span class="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></span>
          <span>Проверка сессии...</span>
        </div>
      </div>
    </template>
    <template v-else-if="authStore.isAuthenticated">
      <!-- Authenticated layout -->
      <div class="min-h-screen flex flex-col">
        <AppHeader />

        <div class="flex flex-1 min-h-0">
          <AppSidebar />

          <main class="flex-1 overflow-auto p-6 min-w-0">
            <router-view />
          </main>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Public routes (login, register, 404) -->
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const authStore = useAuthStore()
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
}
</style>
