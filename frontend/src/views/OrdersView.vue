<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-3xl font-bold text-gray-900">{{ $t('orders.title') }}</h1>

      <div class="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          :loading="store.isLoading"
          :title="$t('common.refresh')"
          :aria-label="$t('common.refresh')"
          disable-focus-styles
          class="refresh-button h-10 w-10 flex items-center justify-center !rounded-lg !px-0 !py-0 !bg-[#ffffff]"
          @click="refreshOrders"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="#3b82f6" stroke-width="1.8" class="h-5 w-5" aria-hidden="true">
            <path d="M16.75 10A6.75 6.75 0 1 1 14.77 5.23" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16.75 3.75v4h-4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </Button>

        <Button
          v-if="authStore.isAdmin"
          variant="ghost"
          size="sm"
          :loading="isExporting"
          :title="$t('common.exportExcel')"
          :aria-label="$t('common.exportExcel')"
          disable-focus-styles
          class="h-10 w-10 flex items-center justify-center !rounded-lg !border !border-green-200 !bg-green-50 !px-0 !py-0 !text-green-700 hover:!bg-green-100"
          @click="exportFilteredOrders"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5" aria-hidden="true">
            <path d="M10 2a1 1 0 0 1 1 1v6.59l1.3-1.3a1 1 0 1 1 1.4 1.42l-3 3a1 1 0 0 1-1.4 0l-3-3A1 1 0 0 1 7.7 8.3L9 9.59V3a1 1 0 0 1 1-1Z" />
            <path d="M4 13a1 1 0 0 1 1 1v1h10v-1a1 1 0 1 1 2 0v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1Z" />
          </svg>
        </Button>
      </div>
    </div>

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
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import orderService, { type Order } from '@/services/orderService'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import OrdersTable from '@/components/orders/OrdersTable.vue'
import OrderForm from '@/components/orders/OrderForm.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const store = useOrderStore()
const authStore = useAuthStore()
const { t } = useI18n()
const showModal = ref(false)
const isExporting = ref(false)
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
  responsible_name?: string
} | undefined>(undefined)

const handleCreateOrder = () => {
  editingOrderId.value = undefined
  editingOrderData.value = undefined
  showModal.value = true
}

const refreshOrders = async () => {
  try {
    await store.fetchOrders()
  } catch {
    // table-level alert already reflects the store error state
  }
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

const exportFilteredOrders = async () => {
  if (!authStore.isAdmin) {
    return
  }

  isExporting.value = true

  try {
    const status = typeof route.query.status === 'string' ? route.query.status : undefined
    const search = typeof route.query.search === 'string' ? route.query.search : undefined
    const executor = typeof route.query.executor === 'string' ? route.query.executor : undefined

    const blob = await orderService.exportOrders(
      status,
      search,
      store.sortField,
      store.sortDirection,
      executor,
    )

    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `orders-export-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (err: any) {
    showErrorDialog(err?.message || t('messages.failedToExportOrders'))
  } finally {
    isExporting.value = false
  }
}

const handleModalSubmit = () => {
  // Form handles submission
}
</script>
