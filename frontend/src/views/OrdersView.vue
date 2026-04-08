<template>
  <div class="space-y-4">
    <h1 class="text-3xl font-bold text-gray-900">{{ $t('orders.title') }}</h1>

    <!-- Modal for Create/Edit -->
    <Modal v-model="showModal" @submit="handleModalSubmit">
      <template #header>
        {{ editingOrderId ? $t('orders.editOrder') : $t('orders.createOrder') }}
      </template>
      <OrderForm
        :order-id="editingOrderId"
        :initial-data="editingOrderData"
        @cancel="showModal = false"
        @success="handleFormSuccess"
      />
    </Modal>

    <!-- Orders Table -->
    <OrdersTable
      @create="handleCreateOrder"
      @view="handleViewOrder"
      @delete="handleDeleteOrder"
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

    <ConfirmDialog
      v-model="showInfoDialog"
      :title="dialogTitle"
      :message="dialogMessage"
      :confirm-text="$t('common.close')"
      confirm-variant="primary"
      :show-cancel="false"
      @confirm="showInfoDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Order } from '@/services/orderService'
import { useOrderStore } from '@/stores/orderStore'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import OrdersTable from '@/components/orders/OrdersTable.vue'
import OrderForm from '@/components/orders/OrderForm.vue'

const router = useRouter()
const store = useOrderStore()
const { t } = useI18n()
const showModal = ref(false)
const showDeleteDialog = ref(false)
const showInfoDialog = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const pendingDeleteOrderId = ref<number | null>(null)
const editingOrderId = ref<number | undefined>(undefined)
const editingOrderData = ref<{
  description: string
  note: string
  package_cost: number | null
  order_cost: number | null
  priority?: Order['priority']
  status?: Order['status']
  user_id?: number
} | undefined>(undefined)

const handleCreateOrder = () => {
  editingOrderId.value = undefined
  editingOrderData.value = undefined
  showModal.value = true
}

const showErrorDialog = (message: string, title: string = t('common.error')) => {
  dialogTitle.value = title
  dialogMessage.value = message
  showInfoDialog.value = true
}

const handleViewOrder = (id: number) => {
  router.push(`/orders/${id}`)
}

const handleDeleteOrder = (id: number) => {
  pendingDeleteOrderId.value = id
  showDeleteDialog.value = true
}

const confirmDeleteOrder = async () => {
  if (!pendingDeleteOrderId.value) {
    return
  }

  try {
    await store.deleteOrder(pendingDeleteOrderId.value)
  } catch (err: any) {
    showErrorDialog(err?.response?.data?.message || err?.message || t('messages.failedToDeleteOrder'))
  } finally {
    pendingDeleteOrderId.value = null
    showDeleteDialog.value = false
  }
}

const handleFormSuccess = async () => {
  showModal.value = false
  editingOrderId.value = undefined
  editingOrderData.value = undefined
  await store.fetchOrders()
}

const handleModalSubmit = () => {
  // Form handles submission
}
</script>
