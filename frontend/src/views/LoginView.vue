<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-6">Format Management</h1>
      <h2 class="text-xl font-semibold text-center text-gray-700 mb-8">{{ $t('auth.login') }}</h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.email') }}</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.password') }}</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div v-if="authStore.error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? $t('common.loading') : $t('auth.login') }}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-600">
        {{ $t('auth.dontHaveAccount') }}
        <router-link to="/register" class="text-blue-500 hover:underline">{{ $t('auth.register') }}</router-link>
      </p>

      <!-- Demo credentials -->
      <div class="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <p class="text-xs text-gray-600 font-semibold mb-2">{{ $t('auth.loginDemo') }}:</p>
        <p class="text-xs text-gray-600">Admin: admin@example.com / Admin123</p>
        <p class="text-xs text-gray-600">Manager: manager@example.com / Manager123</p>
        <p class="text-xs text-gray-600">Worker: worker1@example.com / Worker123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const form = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  try {
    await authStore.login(form)
    router.push('/')
  } catch (err) {
    console.error('Login error:', err)
  }
}
</script>

