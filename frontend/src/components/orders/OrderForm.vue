<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ $t('orders.executor') }}
        <span class="text-red-500">*</span>
      </label>

      <div class="relative">
        <input
          v-model.trim="responsibleName"
          type="text"
          :placeholder="isLoadingManagers ? $t('common.loading') : $t('orders.selectExecutor')"
          :class="[
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.responsible_name ? 'border-red-500' : 'border-gray-300'
          ]"
          @focus="openResponsibleSuggestions"
          @input="openResponsibleSuggestions"
          @blur="closeResponsibleSuggestions"
        />

        <div
          v-if="showResponsibleSuggestions && filteredManagers.length > 0"
          class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <button
            v-for="manager in filteredManagers"
            :key="manager.id"
            type="button"
            class="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-blue-50"
            @mousedown.prevent="selectResponsible(manager)"
          >
            <span class="text-sm font-medium text-gray-900">{{ manager.name }}</span>
            <span v-if="manager.email" class="text-xs text-gray-500">{{ manager.email }}</span>
          </button>
        </div>
      </div>

      <p class="mt-1 text-xs text-gray-500">
        {{ $t('orders.selectExecutor') }} — можно выбрать из списка менеджеров или вписать вручную.
      </p>
      <p v-if="errors.responsible_name" class="mt-1 text-sm text-red-500">{{ errors.responsible_name }}</p>
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

    <div v-if="canManageFinancials" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    responsible_name?: string
  }
}

interface ManagerOption {
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
const canManageFinancials = computed(() => authStore.isManager || authStore.isAdmin)
const managers = ref<ManagerOption[]>([])
const isLoadingManagers = ref(false)
const responsibleName = ref(authStore.user?.name ?? '')
const showResponsibleSuggestions = ref(false)
let responsibleSuggestionsTimeout: ReturnType<typeof setTimeout> | null = null

const filteredManagers = computed(() => {
  const currentUserName = (authStore.user?.name ?? '').trim().toLowerCase()
  const query = responsibleName.value.trim().toLowerCase()

  const sortedManagers = [...managers.value].sort((a, b) => {
    const aIsCurrent = a.name.trim().toLowerCase() === currentUserName
    const bIsCurrent = b.name.trim().toLowerCase() === currentUserName

    if (aIsCurrent !== bIsCurrent) {
      return aIsCurrent ? -1 : 1
    }

    return a.name.localeCompare(b.name, 'ru')
  })

  if (!query || query === currentUserName) {
    return sortedManagers
  }

  const matches = sortedManagers.filter((manager) => {
    return manager.name.toLowerCase().includes(query)
      || manager.email.toLowerCase().includes(query)
  })

  return matches.length > 0 ? matches : sortedManagers
})

const form = ref<{
  description: string
  note: string
  package_cost: number | null | ''
  order_cost: number | null | ''
  priority: OrderPriority
  status: Order['status']
}>({
  description: '',
  note: '',
  package_cost: null,
  order_cost: null,
  priority: 'medium',
  status: 'new',
})

const errors = ref<Record<string, string>>({})
const generalError = ref('')
const isSubmitting = ref(false)

const getDefaultResponsibleName = () => {
  if (props.initialData?.responsible_name?.trim()) {
    return props.initialData.responsible_name.trim()
  }

  return authStore.user?.name ?? ''
}

const syncForm = () => {
  form.value = {
    description: props.initialData?.description || '',
    note: props.initialData?.note || '',
    package_cost: props.initialData?.package_cost ?? null,
    order_cost: props.initialData?.order_cost ?? null,
    priority: props.initialData?.priority || 'medium',
    status: props.initialData?.status || 'new',
  }

  responsibleName.value = getDefaultResponsibleName()
}

watch(() => props.initialData, syncForm, { immediate: true, deep: true })

watch(
  () => authStore.user?.name,
  (userName) => {
    if (!userName || responsibleName.value.trim()) {
      return
    }

    responsibleName.value = userName
  },
  { immediate: true }
)

const toNullableNumber = (value: number | null | '' | undefined) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

const loadManagers = async () => {
  isLoadingManagers.value = true
  try {
    const response = await userService.getUsers(1, 100, 'manager')
    managers.value = [...response.data].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  } catch (err) {
    console.error('Failed to load managers:', err)
    managers.value = []
  } finally {
    isLoadingManagers.value = false
  }
}

const openResponsibleSuggestions = () => {
  if (responsibleSuggestionsTimeout) {
    clearTimeout(responsibleSuggestionsTimeout)
    responsibleSuggestionsTimeout = null
  }

  showResponsibleSuggestions.value = true
}

const closeResponsibleSuggestions = () => {
  responsibleSuggestionsTimeout = setTimeout(() => {
    showResponsibleSuggestions.value = false
  }, 120)
}

const selectResponsible = (manager: ManagerOption) => {
  responsibleName.value = manager.name
  showResponsibleSuggestions.value = false
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.description.trim()) {
    errors.value.description = t('validation.descriptionRequired')
  }

  if (!responsibleName.value.trim()) {
    errors.value.responsible_name = t('validation.executorRequired')
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
    package_cost: canManageFinancials.value ? toNullableNumber(form.value.package_cost) : undefined,
    order_cost: canManageFinancials.value ? toNullableNumber(form.value.order_cost) : undefined,
    priority: form.value.priority,
    responsible_name: responsibleName.value.trim(),
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
  loadManagers()
})
</script>

