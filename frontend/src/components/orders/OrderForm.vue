<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Title -->
    <Input
      v-model="form.title"
      :label="$t('orders.title')"
      :placeholder="$t('orders.title')"
      required
      :error="errors.title"
    />

    <!-- Description -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ $t('orders.description') }}
        <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="form.description"
        :placeholder="$t('orders.description')"
        required
        :class="[
          'w-full px-3 py-2 border rounded-lg font-base transition-colors duration-200',
          errors.description ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        ]"
        rows="4"
      ></textarea>
      <p v-if="errors.description" class="mt-1 text-sm text-red-500">{{ errors.description }}</p>
    </div>

    <!-- Status (for edit mode) -->
    <div v-if="isEdit" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ $t('orders.status') }}
      </label>
      <select
        v-model="form.status"
        :class="[
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.status ? 'border-red-500' : 'border-gray-300'
        ]"
      >
        <option value="new">{{ $t('orders.statuses.new') }}</option>
        <option value="in_progress">{{ $t('orders.statuses.in_progress') }}</option>
        <option value="completed">{{ $t('orders.statuses.completed') }}</option>
        <option value="cancelled">{{ $t('orders.statuses.cancelled') }}</option>
      </select>
      <p v-if="errors.status" class="mt-1 text-sm text-red-500">{{ errors.status }}</p>
    </div>

    <!-- Error Alert -->
    <Alert
      v-if="generalError"
      type="error"
      :title="$t('common.error')"
      :message="generalError"
      @close="generalError = ''"
    />

    <!-- Buttons -->
    <div class="flex gap-2 justify-end pt-4 border-t border-gray-200">
      <Button
        variant="secondary"
        type="button"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        {{ $t('common.cancel') }}
      </Button>
      <Button
        type="submit"
        :loading="isSubmitting"
      >
        {{ isEdit ? $t('common.update') : $t('common.create') }} {{ $t('orders.title') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrderStore } from '@/stores/orderStore'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'

interface Props {
  orderId?: number
  initialData?: {
    title: string
    description: string
    status?: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'cancel': []
  'success': []
}>()

const store = useOrderStore()
const { t } = useI18n()

const isEdit = computed(() => !!props.orderId)

const form = ref({
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  status: props.initialData?.status || 'new'
})

const errors = ref<Record<string, string>>({})
const generalError = ref('')
const isSubmitting = ref(false)

const validateForm = () => {
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = t('validation.titleRequired')
  }

  if (!form.value.description.trim()) {
    errors.value.description = t('validation.descriptionRequired')
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  try {
    if (isEdit.value && props.orderId) {
      await store.updateOrder(props.orderId, {
        title: form.value.title,
        description: form.value.description,
        status: form.value.status
      })
    } else {
      await store.createOrder({
        title: form.value.title,
        description: form.value.description
      })
    }
    generalError.value = ''
    emit('success')
  } catch (err: any) {
    generalError.value = err.message || t('messages.failedToSaveOrder')
  } finally {
    isSubmitting.value = false
  }
}
</script>

