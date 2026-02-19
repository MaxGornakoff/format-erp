<template>
  <div class="space-y-4">
    <h1 class="text-3xl font-bold text-gray-900">{{ $t('orders.title') }}</h1>
    <p class="text-gray-600">{{ $t('orders.description') }}</p>

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
      @edit="handleEditOrder"
      @delete="handleDeleteOrder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/ui/Modal.vue'
import OrdersTable from '@/components/orders/OrdersTable.vue'
import OrderForm from '@/components/orders/OrderForm.vue'

const router = useRouter()
const { t } = useI18n()
const showModal = ref(false)
const editingOrderId = ref<number | null>(null)
const editingOrderData = ref()

const handleCreateOrder = () => {
  editingOrderId.value = null
  editingOrderData.value = undefined
  showModal.value = true
}

const handleViewOrder = (id: number) => {
  router.push(`/orders/${id}`)
}

const handleEditOrder = (id: number) => {
  editingOrderId.value = id
  // TODO: Fetch order data for editing
  showModal.value = true
}

const handleDeleteOrder = async (id: number) => {
  if (confirm(t('orders.confirmDelete'))) {
    // TODO: Delete order via store
    // await store.deleteOrder(id)
  }
}

const handleFormSuccess = () => {
  showModal.value = false
  editingOrderId.value = null
  editingOrderData.value = undefined
}

const handleModalSubmit = () => {
  // Form handles submission
}
</script>
