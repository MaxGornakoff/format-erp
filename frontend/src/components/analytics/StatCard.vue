<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    :class="[
      'w-full bg-white rounded-lg border border-gray-200 p-6 text-left',
      clickable && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    ]"
  >
    <div class="flex items-start justify-between gap-3">
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
  </component>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number
  icon?: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  icon: '📊',
  color: 'blue',
  clickable: false,
})
</script>
