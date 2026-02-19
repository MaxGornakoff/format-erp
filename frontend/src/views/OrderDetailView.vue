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

    <!-- Order Detail Component -->
    <OrderDetail
      :order-id="orderId"
      :order="currentOrder"
      :loading="isLoading"
      :error="error"
      @back="$router.back()"
      @edit="handleEdit"
      @delete="handleDelete"
      @status-change="handleStatusChange"
    />

    <!-- Edit Modal -->
    <Modal v-model="showEditModal" @submit="handleSubmitEdit">
      <template #header>
        {{ $t('orders.editOrder') }}
      </template>
      <OrderForm
        :order-id="orderId"
        :initial-data="editFormData"
        @cancel="showEditModal = false"
        @success="handleEditSuccess"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useOrderStore } from '@/stores/orderStore'
import OrderDetail from '@/components/orders/OrderDetail.vue'
import OrderForm from '@/components/orders/OrderForm.vue'
import Modal from '@/components/ui/Modal.vue'

const route = useRoute()
const router = useRouter()
const store = useOrderStore()
const { t } = useI18n()

const orderId = computed(() => parseInt(route.params.id as string))
const showEditModal = ref(false)
const isLoading = ref(false)
const error = ref('')
const editFormData = ref()

const currentOrder = computed(() => store.currentOrder)

const handleEdit = () => {
  if (currentOrder.value) {
    editFormData.value = {
      title: currentOrder.value.title,
      description: currentOrder.value.description,
      status: currentOrder.value.status
    }
    showEditModal.value = true
  }
}

const handleEditSuccess = () => {
  showEditModal.value = false
  loadOrder()
}

const handleSubmitEdit = () => {
  // Form handles submission
}

const handleDelete = async () => {
  if (confirm(t('orders.confirmDelete'))) {
    try {
      await store.deleteOrder(orderId.value)
      router.push('/orders')
    } catch (err: any) {
      error.value = err.message || t('messages.failedToDeleteOrder')
    }
  }
}

const handleStatusChange = async (newStatus: string) => {
  try {
    await store.updateOrder(orderId.value, {
      status: newStatus
    })
    loadOrder()
  } catch (err: any) {
    error.value = err.message || t('messages.failedToSaveOrder')
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
