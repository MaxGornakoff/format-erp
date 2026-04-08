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
      <div class="min-h-screen flex flex-col">
        <AppHeader />

        <div class="flex flex-1 min-h-0 overflow-hidden">
          <AppSidebar
            :collapsed="isSidebarCollapsed"
            @toggle="toggleSidebar"
          />

          <main
            :class="[
              'flex-1 overflow-auto min-w-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              isSidebarCollapsed ? 'p-5 md:p-6' : 'p-5 md:p-6'
            ]"
          >
            <div class="mx-auto w-full max-w-[1600px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
              <router-view />
            </div>
          </main>
        </div>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'

const authStore = useAuthStore()
const SIDEBAR_STORAGE_KEY = 'format-erp-sidebar-collapsed'

const getInitialSidebarState = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
}

const isSidebarCollapsed = ref(getInitialSidebarState())

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed.value))
  }
}
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif;
}
</style>
