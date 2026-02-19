<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
    <div class="grid grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-gray-600">Welcome back</p>
        <p class="text-2xl font-bold">{{ authStore.user?.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>
