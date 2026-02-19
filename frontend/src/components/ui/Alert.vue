<template>
  <div
    v-if="visible"
    :class="[
      'p-4 rounded-lg border mb-4 flex items-start justify-between',
      type === 'success' && 'bg-green-50 border-green-200 text-green-800',
      type === 'error' && 'bg-red-50 border-red-200 text-red-800',
      type === 'warning' && 'bg-yellow-50 border-yellow-200 text-yellow-800',
      type === 'info' && 'bg-blue-50 border-blue-200 text-blue-800'
    ]"
  >
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <svg
          v-if="type === 'success'"
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="type === 'error'"
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="type === 'warning'"
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Message -->
      <div class="flex-1">
        <p class="font-semibold">{{ title }}</p>
        <p v-if="message" class="text-sm mt-1">{{ message }}</p>
      </div>
    </div>

    <!-- Close Button -->
    <button
      class="flex-shrink-0 ml-4 text-current opacity-70 hover:opacity-100"
      @click="visible = false"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  dismissible?: boolean
  autoClose?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: true,
  autoClose: 0
})

const visible = ref(true)

watch(visible, (newVal) => {
  if (!newVal) {
    // Could emit an event if needed
  }
})

// Auto-close after specified seconds
if (props.autoClose > 0) {
  setTimeout(() => {
    visible.value = false
  }, props.autoClose * 1000)
}
</script>
