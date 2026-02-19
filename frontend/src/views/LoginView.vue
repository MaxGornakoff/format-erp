<template>
  <div class="min-h-screen flex items-center justify-center w-[30%] mx-auto max-[1024px]:w-full">
    <div class="bg-[#FFFFFF] px-[40px] py-[20px] rounded-[20px] shadow-md w-full max-w-md">
      <h1 class="text-4xl font-bold text-center text-[#333333] mb-6 flex justify-center items-center flex-col">ФОРМАТ <span class="text-xl leading-7 tracking-[1px] uppercase text-[#ffffff] inline-block bg-blue-500 w-auto font-medium px-[6px] rounded-[4px]">management</span></h1>
      <h2 class="text-xl font-semibold text-center text-[#333333] mb-8">{{ $t('auth.login') }}</h2>

      <form @submit.prevent="handleLogin" class=" flex flex-col  gap-[10px]">
        <div class="relative">
          <label class="block text-[14px] font-medium text-[#333333] absolute top-[-9px] left-[8px] bg-[#ffffff] px-[7px]">{{ $t('auth.email') }}</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-[10px] py-3 border border-[#EEF5FD] rounded-[10px] focus:border-blue-500 focus:outline-blue-500"
          />
        </div>

        <div class="relative">
          <label class="block text-[14px] font-medium text-[#333333] absolute top-[-9px] left-[10px] bg-[#ffffff] px-[7px]">{{ $t('auth.password') }}</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-[10px] py-3 border border-[#EEF5FD] rounded-[10px] focus:border-blue-500 focus:outline-blue-500"
          />
        </div>

        <div v-if="authStore.error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-[10px] text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-blue-500 text-[#ffffff] py-3 rounded-[10px] hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-blue-500 "
        >
          {{ authStore.isLoading ? $t('common.loading') : $t('auth.login') }}
        </button>
      </form>

      <p class="text-center mt-4 text-[#333333] text-[14px]">
        {{ $t('auth.dontHaveAccount') }}
        <router-link to="/register" class="text-blue-500 hover:text-blue-500 hover:underline">{{ $t('auth.register') }}</router-link>
      </p>

      <!-- Demo credentials -->
      <div class="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200 hidden">
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
useI18n()

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

