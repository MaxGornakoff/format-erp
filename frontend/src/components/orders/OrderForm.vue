<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div v-if="canAssignWorker" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ $t('orders.executor') }}
        <span class="text-red-500">*</span>
      </label>
      <select
        v-model.number="form.user_id"
        :class="[
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.user_id ? 'border-red-500' : 'border-gray-300'
        ]"
      >
        <option :value="undefined" disabled>
          {{ isLoadingWorkers ? $t('common.loading') : $t('orders.selectExecutor') }}
        </option>
        <option v-for="worker in workers" :key="worker.id" :value="worker.id">
          {{ worker.name }}{{ worker.email ? ` (${worker.email})` : '' }}
        </option>
      </select>
      <p v-if="errors.user_id" class="mt-1 text-sm text-red-500">{{ errors.user_id }}</p>
    </div>

    <div v-else class="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
      {{ $t('orders.autoAssignedWorker') }}: <span class="font-semibold">{{ authStore.user?.name }}</span>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ $t('orders.formDescription') }}
        <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="form.description"
        :placeholder="$t('orders.formDescriptionPlaceholder')"
        rows="4"
        :class="[
          'w-full px-3 py-2 border rounded-lg transition-colors duration-200',
          errors.description ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        ]"
      />
      <p v-if="errors.description" class="mt-1 text-sm text-red-500">{{ errors.description }}</p>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ $t('orders.note') }}
      </label>
      <textarea
        v-model="form.note"
        :placeholder="$t('orders.notePlaceholder')"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ $t('orders.packageCost') }}
        </label>
        <input
          v-model.number="form.package_cost"
          type="number"
          min="0"
          step="0.01"
          :placeholder="$t('orders.packageCostPlaceholder')"
          :class="[
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.package_cost ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.package_cost" class="mt-1 text-sm text-red-500">{{ errors.package_cost }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ $t('orders.orderCost') }}
        </label>
        <input
          v-model.number="form.order_cost"
          type="number"
          min="0"
          step="0.01"
          :placeholder="$t('orders.orderCostPlaceholder')"
          :class="[
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.order_cost ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.order_cost" class="mt-1 text-sm text-red-500">{{ errors.order_cost }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ $t('orders.priority') }}
          <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.priority"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">{{ $t('orders.priorities.low') }}</option>
          <option value="medium">{{ $t('orders.priorities.medium') }}</option>
          <option value="high">{{ $t('orders.priorities.high') }}</option>
        </select>
      </div>

      <div v-if="isEdit">
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
    </div>

    <Alert
      v-if="generalError"
      type="error"
      :title="$t('common.error')"
      :message="generalError"
      @close="generalError = ''"
    />

    <div class="flex gap-2 justify-end pt-4 border-t border-gray-200">
      <Button
        variant="secondary"
        type="button"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        {{ $t('common.cancel') }}
      </Button>
      <Button type="submit" :loading="isSubmitting">
        {{ isEdit ? $t('common.update') : $t('common.create') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import userService from '@/services/userService'
import type { Order, OrderPriority } from '@/services/orderService'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'

interface Props {
  orderId?: number
  initialData?: {
    description: string
    note: string
    package_cost: number | null
    order_cost: number | null
    priority?: OrderPriority
    status?: Order['status']
    user_id?: number
  }
}

interface WorkerOption {
  id: number
  name: string
  email: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'cancel': []
  'success': []
}>()

const store = useOrderStore()
const authStore = useAuthStore()
const { t } = useI18n()

const isEdit = computed(() => !!props.orderId)
const canAssignWorker = computed(() => authStore.isManager || authStore.isAdmin)
const workers = ref<WorkerOption[]>([])
const isLoadingWorkers = ref(false)

const form = ref<{
  description: string
  note: string
  package_cost: number | null | ''
  order_cost: number | null | ''
  priority: OrderPriority
  status: Order['status']
  user_id?: number
}>({
  description: '',
  note: '',
  package_cost: null,
  order_cost: null,
  priority: 'medium',
  status: 'new',
  user_id: authStore.user?.id,
})

const errors = ref<Record<string, string>>({})
const generalError = ref('')
const isSubmitting = ref(false)

const syncForm = () => {
  form.value = {
    description: props.initialData?.description || '',
    note: props.initialData?.note || '',
    package_cost: props.initialData?.package_cost ?? null,
    order_cost: props.initialData?.order_cost ?? null,
    priority: props.initialData?.priority || 'medium',
    status: props.initialData?.status || 'new',
    user_id: canAssignWorker.value ? props.initialData?.user_id : authStore.user?.id,
  }
}

watch(() => props.initialData, syncForm, { immediate: true, deep: true })

const toNullableNumber = (value: number | null | '' | undefined) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

const loadWorkers = async () => {
  if (!canAssignWorker.value) {
    return
  }

  isLoadingWorkers.value = true
  try {
    const response = await userService.getUsers(1, 100, 'worker')
    workers.value = response.data
  } catch (err) {
    console.error('Failed to load workers:', err)
  } finally {
    isLoadingWorkers.value = false
  }
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.description.trim()) {
    errors.value.description = t('validation.descriptionRequired')
  }

  if (canAssignWorker.value && !form.value.user_id) {
    errors.value.user_id = t('validation.executorRequired')
  }

  const packageCost = toNullableNumber(form.value.package_cost)
  const orderCost = toNullableNumber(form.value.order_cost)

  if (packageCost !== null && packageCost < 0) {
    errors.value.package_cost = t('validation.nonNegativeNumber')
  }

  if (orderCost !== null && orderCost < 0) {
    errors.value.order_cost = t('validation.nonNegativeNumber')
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const payload = {
    title: form.value.description.trim().slice(0, 80),
    description: form.value.description.trim(),
    note: form.value.note.trim() || undefined,
    package_cost: toNullableNumber(form.value.package_cost),
    order_cost: toNullableNumber(form.value.order_cost),
    priority: form.value.priority,
    user_id: canAssignWorker.value ? form.value.user_id : undefined,
  }

  try {
    if (isEdit.value && props.orderId) {
      await store.updateOrder(props.orderId, {
        ...payload,
        status: form.value.status,
      })
    } else {
      await store.createOrder(payload)
    }

    generalError.value = ''
    emit('success')
  } catch (err: any) {
    const validationErrors = err?.response?.data?.errors
    const firstValidationError = validationErrors ? Object.values(validationErrors).flat()[0] : null
    generalError.value = typeof firstValidationError === 'string'
      ? firstValidationError
      : err?.response?.data?.message || err?.message || t('messages.failedToSaveOrder')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadWorkers()
})
</script>

