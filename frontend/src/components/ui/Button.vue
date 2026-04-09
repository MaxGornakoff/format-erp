<template>
  <button
    :type="type"
    :class="[
      'relative appearance-none border-0 rounded-lg shadow-none px-4 py-2 text-[14px] outline-none focus:outline-none focus-visible:outline-none active:outline-none font-medium transition-colors duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variant === 'primary' && 'bg-blue-500 hover:bg-blue-600 text-white',
      variant === 'secondary' && 'bg-gray-200 hover:bg-gray-300 text-gray-900',
      variant === 'danger' && 'bg-red-500 hover:bg-red-600 text-white',
      variant === 'ghost' && 'bg-transparent hover:bg-gray-100 text-gray-900',
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'lg' && 'px-6 py-3 text-lg'
    ]"
    :disabled="disabled || loading"
  >
    <span
      :class="[
        'inline-flex items-center justify-center transition-opacity duration-150',
        loading && 'opacity-0'
      ]"
    >
      <slot />
    </span>

    <span
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  disableFocusStyles?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  disableFocusStyles: false,
})
</script>
