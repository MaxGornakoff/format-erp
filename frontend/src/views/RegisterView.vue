<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-6">Format Management</h1>
      <h2 class="text-xl font-semibold text-center text-gray-700 mb-8">{{ $t('auth.register') }}</h2>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('auth.name') }}</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
          <p class="text-xs text-gray-500 mt-1">{{ $t('auth.passwordRequirements') }}</p>
        </div>

        <div v-if="authStore.error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? $t('common.loading') : $t('auth.register') }}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-600">
        {{ $t('auth.alreadyHaveAccount') }}
        <router-link to="/login" class="text-blue-500 hover:underline">{{ $t('auth.login') }}</router-link>
      </p>
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
  name: '',
  email: '',
  password: '',
})

const handleRegister = async () => {
  try {
    await authStore.register(form)
    router.push('/')
  } catch (err) {
    console.error('Register error:', err)
  }
}
</script>

