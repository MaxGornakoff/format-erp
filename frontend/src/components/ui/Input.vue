<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full px-3 py-2 border rounded-lg font-base transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed',
        error ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  id?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`
})

defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
}>()
</script>
