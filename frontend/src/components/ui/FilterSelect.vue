<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      :disabled="disabled"
      class="flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
      @click="toggleOpen"
      @keydown.esc.prevent="isOpen = false"
    >
      <span class="min-w-0 flex-1">
        <span class="block truncate text-[14px] font-medium text-gray-900">
          {{ selectedOption?.label || placeholder }}
        </span>
        <span
          v-if="selectedOption?.description && modelValue"
          class="mt-0.5 block truncate text-xs text-gray-500"
        >
          {{ selectedOption.description }}
        </span>
      </span>

      <svg
        viewBox="0 0 20 20"
        fill="none"
        class="h-4 w-4 shrink-0 text-slate-500 transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
        aria-hidden="true"
      >
        <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div
      v-if="isOpen && !disabled"
      class="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
    >
      <button
        v-for="option in options"
        :key="`${option.value}-${option.label}`"
        type="button"
        class="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-blue-50"
        :class="option.value === modelValue ? 'bg-blue-50' : ''"
        @click="selectOption(option.value)"
      >
        <span class="text-sm font-medium text-gray-900">{{ option.label }}</span>
        <span v-if="option.description && option.value" class="text-xs text-gray-500">{{ option.description }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface FilterSelectOption {
  value: string
  label: string
  description?: string | null
}

const props = withDefaults(defineProps<{
  modelValue?: string
  options: FilterSelectOption[]
  placeholder: string
  disabled?: boolean
}>(), {
  modelValue: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() => props.options.find((option) => option.value === props.modelValue) ?? null)

const toggleOpen = () => {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value
}

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!rootRef.value) {
    return
  }

  const target = event.target as Node | null

  if (target && !rootRef.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>
