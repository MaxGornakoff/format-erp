<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <button
        class="text-blue-500 hover:text-blue-700 font-medium"
        @click="$router.back()"
      >
        ← {{ $t('common.back') }}
      </button>
    </div>

    <OrderDetail
      :order-id="orderId"
      :order="currentOrder"
      :loading="isLoading"
      :error="error"
      @back="$router.back()"
      @delete="handleDelete"
    />

    <ConfirmDialog
      v-model="showDeleteDialog"
      :title="$t('orders.deleteOrder')"
      :message="$t('orders.confirmDelete')"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      confirm-variant="danger"
      @confirm="confirmDeleteOrder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useOrderStore } from '@/stores/orderStore'
import type { Order } from '@/services/orderService'
import OrderDetail from '@/components/orders/OrderDetail.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useOrderStore()
const { t } = useI18n()

const orderId = computed(() => parseInt(route.params.id as string, 10))
const showDeleteDialog = ref(false)
const isLoading = ref(false)
const error = ref('')

const currentOrder = computed<Order | undefined>(() => store.currentOrder ?? undefined)

const handleDelete = () => {
  showDeleteDialog.value = true
}

const confirmDeleteOrder = async () => {
  try {
    await store.deleteOrder(orderId.value)
    showDeleteDialog.value = false
    router.push('/orders')
  } catch (err: any) {
    error.value = err.message || t('messages.failedToDeleteOrder')
  }
}

const loadOrder = async () => {
  isLoading.value = true
  try {
    await store.fetchOrder(orderId.value)
    error.value = ''
  } catch (err: any) {
    error.value = err.message || t('messages.failedToLoadOrder')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>
