<template>
  <div class="min-h-screen bg-[#F1F1F1] w-full">
    <template v-if="authStore.isAuthenticated">
      <!-- Authenticated layout -->
      <div class="flex">
        <AppSidebar />
        <div class="flex-1 flex flex-col">
          <AppHeader />
          <main class="flex-1 overflow-auto p-6">
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
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initAuth()
})
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
}
</style>
