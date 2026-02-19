<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-gray-600 mb-1">{{ title }}</p>
        <p class="text-3xl font-bold text-gray-900">{{ value }}</p>
      </div>
      <div
        :class="[
          'text-3xl',
          color === 'blue' && 'text-blue-500',
          color === 'green' && 'text-green-500',
          color === 'yellow' && 'text-yellow-500',
          color === 'red' && 'text-red-500'
        ]"
      >
        {{ icon }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number
  icon?: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
}

withDefaults(defineProps<Props>(), {
  icon: '📊',
  color: 'blue'
})
</script>
