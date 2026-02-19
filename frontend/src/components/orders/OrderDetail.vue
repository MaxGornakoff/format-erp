<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingOrderDetails') }}</p>
    </div>

    <!-- Error State -->
    <Alert
      v-else-if="error"
      type="error"
      :title="$t('common.error')"
      :message="error"
    />

    <!-- Order Details -->
    <div v-else-if="order" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ order.title }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ $t('orders.orderNumber') }}{{ order.id }}</p>
        </div>
        <Badge :variant="getStatusVariant(order.status)">
          {{ formatStatus(order.status) }}
        </Badge>
      </div>

      <!-- Metadata -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p class="text-sm text-gray-500">{{ $t('orders.createdAt') }}</p>
          <p class="font-semibold">{{ formatDate(order.created_at, 'full') }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">{{ $t('orders.updatedAt') }}</p>
          <p class="font-semibold">{{ formatDate(order.updated_at, 'full') }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">{{ $t('orders.createdBy') }}</p>
          <p class="font-semibold">{{ order.user?.name || 'Unknown' }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">{{ $t('orders.status') }}</p>
          <p class="font-semibold">{{ formatStatus(order.status) }}</p>
        </div>
      </div>

      <!-- Description -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('orders.description') }}</h2>
        <p class="text-gray-700 whitespace-pre-wrap">{{ order.description }}</p>
      </div>

      <!-- Status Change (if applicable) -->
      <div v-if="canChangeStatus" class="border-t border-gray-200 pt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('orders.changeStatus') }}</h2>
        <div class="flex gap-2 flex-wrap">
          <Button
            v-for="status in availableStatuses"
            :key="status"
            :variant="order.status === status ? 'primary' : 'secondary'"
            :disabled="isUpdating"
            @click="updateStatus(status)"
          >
            {{ formatStatus(status) }}
          </Button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 justify-end pt-4 border-t border-gray-200">
        <Button variant="secondary" @click="$emit('back')">
          {{ $t('common.back') }}
        </Button>
        <Button
          v-if="canEdit"
          @click="$emit('edit')"
        >
          {{ $t('common.edit') }}
        </Button>
        <Button
          v-if="canDelete"
          variant="danger"
          @click="$emit('delete')"
        >
          {{ $t('common.delete') }}
        </Button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-8">
      <p class="text-gray-600">{{ $t('messages.orderNotFound') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'
import type { Order } from '@/services/orderService'

interface Props {
  orderId: number
  order?: Order
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: ''
})

const authStore = useAuthStore()
const { t } = useI18n()
const { formatDate } = useFormattedDate()

const isLoading = ref(props.loading)
const isUpdating = ref(false)
const error = ref(props.error)
const order = ref(props.order)

const availableStatuses = ['new', 'in_progress', 'completed', 'cancelled']

const canEdit = computed(() => {
  if (!order.value) return false
  return authStore.isManager || (authStore.isWorker && order.value.user_id === authStore.user?.id)
})

const canDelete = computed(() => {
  return authStore.isAdmin
})

const canChangeStatus = computed(() => {
  return authStore.isManager || authStore.isAdmin
})

const orderStatus = computed(() => order.value?.status || '')

const getStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    new: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return variants[status] || 'default'
}

const formatStatus = (status: string) => {
  const formatted: Record<string, string> = {
    new: t('orders.statuses.new'),
    in_progress: t('orders.statuses.in_progress'),
    completed: t('orders.statuses.completed'),
    cancelled: t('orders.statuses.cancelled')
  }
  return formatted[status] || status
}

const updateStatus = async (newStatus: string) => {
  if (!order.value || orderStatus === newStatus) return

  isUpdating.value = true
  try {
    // Call update endpoint
    $emit('status-change', newStatus)
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  isLoading.value = props.loading
  error.value = props.error
  order.value = props.order
})

defineEmits<{
  'back': []
  'edit': []
  'delete': []
  'status-change': [status: string]
}>()
</script>

