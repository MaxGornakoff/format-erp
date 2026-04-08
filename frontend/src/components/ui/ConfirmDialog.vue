<template>
  <Modal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      {{ title }}
    </template>

    <div class="space-y-3">
      <p class="text-sm leading-6 text-gray-600 whitespace-pre-line">
        {{ message }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-4">
        <Button
          v-if="showCancel"
          variant="secondary"
          @click="$emit('update:modelValue', false)"
        >
          {{ cancelText }}
        </Button>
        <Button
          :variant="confirmVariant"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue'
import Button from './Button.vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  showCancel?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  confirmText: 'OK',
  cancelText: 'Cancel',
  confirmVariant: 'primary',
  showCancel: true,
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const handleConfirm = () => {
  emit('confirm')
}
</script>
