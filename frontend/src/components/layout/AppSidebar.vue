<template>
  <aside
    :class="[
      'shrink-0 bg-white border-r border-[#EEF5FD] min-h-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col will-change-[width,padding] shadow-sm',
      collapsed ? 'w-20 p-3' : 'w-64 px-5 py-3'
    ]"
  >
    <div :class="['flex items-center', collapsed ? 'justify-center' : 'justify-end']">
      <button
        type="button"
        class="outline-none focus:outline-none inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#205EA6] hover:bg-[#EEF5FD] transition"
        :title="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
        :aria-label="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
        @click="$emit('toggle')"
      >
        <svg viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
          <path
            :d="collapsed ? 'M7 4L13 10L7 16' : 'M13 4L7 10L13 16'"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <nav class="space-y-2">
      <router-link
        v-for="item in visibleNavItems"
        :key="item.key"
        :to="item.to"
        :title="collapsed ? item.label : undefined"
        :class="[
          'flex items-center rounded-xl text-[14px] text-[#333] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] px-3 py-3 hover:bg-[#EEF5FD] hover:translate-x-[1px]',
          collapsed ? 'justify-center' : 'gap-3',
          isRouteActive(item.routeNames) ? 'bg-[#EEF5FD] text-[#205EA6] font-semibold shadow-sm' : ''
        ]"
      >
        <span class="flex h-5 w-5 shrink-0 items-center justify-center">
          <svg v-if="item.key === 'dashboard'" viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
            <path d="M4 10.5L10 4L16 10.5V16H4V10.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            <path d="M8 16V11H12V16" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>

          <svg v-else-if="item.key === 'orders'" viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
            <rect x="4" y="3.5" width="12" height="13" rx="2" stroke="currentColor" stroke-width="1.6" />
            <path d="M7 7H13M7 10H13M7 13H11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>

          <svg v-else-if="item.key === 'analytics'" viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
            <path d="M4 15.5H16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            <path d="M6.5 13V9.5M10 13V6.5M13.5 13V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>

          <svg v-else-if="item.key === 'history'" viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
            <path d="M10 5V10L13 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17 10A7 7 0 1 1 14.6 4.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            <path d="M14.5 3.5H17V6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <svg v-else viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
            <path d="M6.5 8.5C7.3 8.5 8 7.83 8 7C8 6.17 7.3 5.5 6.5 5.5C5.67 5.5 5 6.17 5 7C5 7.83 5.67 8.5 6.5 8.5Z" stroke="currentColor" stroke-width="1.6" />
            <path d="M13.5 8.5C14.3 8.5 15 7.83 15 7C15 6.17 14.3 5.5 13.5 5.5C12.67 5.5 12 6.17 12 7C12 7.83 12.67 8.5 13.5 8.5Z" stroke="currentColor" stroke-width="1.6" />
            <path d="M3.8 14.5C4.4 12.8 5.8 12 7.5 12C9.2 12 10.6 12.8 11.2 14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            <path d="M8.8 14.5C9.3 13.2 10.5 12.5 12 12.5C13.5 12.5 14.7 13.2 15.2 14.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </span>

        <span
          v-if="!collapsed"
          class="truncate transition-all duration-200 ease-out"
        >
          {{ item.label }}
        </span>
      </router-link>
    </nav>

    <div class="mt-auto pt-5 border-t border-[#EEF5FD]">
      <div v-if="!collapsed" class="text-sm text-gray-900">
        <p>{{ $t('dashboard.yourRole') }}:</p>
        <p class="font-bold text-gray-900 mt-2 capitalize">{{ getRoleLabel(authStore.user?.role) }}</p>
      </div>

      <div v-else class="flex justify-center">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF5FD] text-[#205EA6] font-bold uppercase"
          :title="getRoleLabel(authStore.user?.role)"
        >
          {{ getRoleInitial(authStore.user?.role) }}
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'

interface Props {
  collapsed?: boolean
}

interface NavItem {
  key: 'dashboard' | 'orders' | 'analytics' | 'users' | 'history'
  to: string
  label: string
  routeNames: string[]
}

withDefaults(defineProps<Props>(), {
  collapsed: false,
})

defineEmits<{
  toggle: []
}>()

const authStore = useAuthStore()
const route = useRoute()
const { t } = useI18n()

const visibleNavItems = computed<NavItem[]>(() => {
  const items: Array<NavItem | null> = [
    {
      key: 'dashboard',
      to: '/',
      label: t('navigation.dashboard'),
      routeNames: ['Dashboard'],
    },
    {
      key: 'orders',
      to: '/orders',
      label: t('navigation.orders'),
      routeNames: ['Orders', 'OrderDetail'],
    },
    authStore.isManager || authStore.isAdmin
      ? {
          key: 'analytics',
          to: '/analytics',
          label: t('navigation.analytics'),
          routeNames: ['Analytics'],
        }
      : null,
    authStore.isAdmin
      ? {
          key: 'users',
          to: '/users',
          label: t('navigation.users'),
          routeNames: ['Users'],
        }
      : null,
    authStore.isAdmin
      ? {
          key: 'history',
          to: '/history',
          label: t('navigation.history'),
          routeNames: ['History'],
        }
      : null,
  ]

  return items.filter((item): item is NavItem => item !== null)
})

const isRouteActive = (routeNames: string[]) => {
  return route.name ? routeNames.includes(String(route.name)) : false
}

const getRoleLabel = (role?: string) => {
  if (!role) return ''
  const roleMap: Record<string, string> = {
    admin: t('users.roles.admin'),
    manager: t('users.roles.manager'),
    worker: t('users.roles.worker'),
  }
  return roleMap[role] || role
}

const getRoleInitial = (role?: string) => {
  const label = getRoleLabel(role)
  return label ? label.charAt(0) : '?'
}
</script>

