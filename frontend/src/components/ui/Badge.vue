<template>
  <span :class="[
    'inline-block px-3 py-1 rounded-full text-sm font-medium',
    variant === 'success' && 'bg-green-100 text-green-800',
    variant === 'danger' && 'bg-red-100 text-red-800',
    variant === 'warning' && 'bg-yellow-100 text-yellow-800',
    variant === 'info' && 'bg-blue-100 text-blue-800',
    variant === 'default' && 'bg-gray-100 text-gray-800'
  ]">
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default'
}

withDefaults(defineProps<Props>(), {
  variant: 'default'
})
</script>
