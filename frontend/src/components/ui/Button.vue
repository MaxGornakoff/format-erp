<template>
  <button
    :type="type"
    :class="[
      'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variant === 'primary' && 'bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      variant === 'secondary' && 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
      variant === 'danger' && 'bg-red-500 hover:bg-red-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
      variant === 'ghost' && 'bg-transparent hover:bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'lg' && 'px-6 py-3 text-lg'
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="inline-block mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})
</script>
