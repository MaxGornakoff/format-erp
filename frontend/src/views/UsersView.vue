<template>
  <div class="space-y-4">
    <h1 class="text-3xl font-bold text-gray-900">{{ $t('users.title') }}</h1>
  

    <Modal v-model="showCreateModal" @submit="handleModalSubmit">
      <template #header>
        {{ $t('users.createUser') }}
      </template>
      <UserForm
        @cancel="showCreateModal = false"
        @success="handleFormSuccess"
      />
    </Modal>

    <UsersTable
      @create="handleCreateUser"
      @view="handleViewUser"
      @delete="handleDeleteUser"
      @bulk-delete="handleBulkDeleteUsers"
    />

    <ConfirmDialog
      v-model="showDeleteDialog"
      :title="$t('common.warning')"
      :message="deleteDialogMessage"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      confirm-variant="danger"
      @confirm="confirmDeleteUser"
    />

    <ConfirmDialog
      v-model="showInfoDialog"
      :title="$t('common.error')"
      :message="dialogMessage"
      :confirm-text="$t('common.close')"
      confirm-variant="primary"
      :show-cancel="false"
      @confirm="showInfoDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { isPrimaryAdminUser } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import UsersTable from '@/components/users/UsersTable.vue'
import UserForm from '@/components/users/UserForm.vue'

const router = useRouter()
const store = useUserStore()
const { t } = useI18n()
const showCreateModal = ref(false)
const showDeleteDialog = ref(false)
const showInfoDialog = ref(false)
const dialogMessage = ref('')
const pendingDeleteUserIds = ref<number[]>([])

const deleteDialogMessage = computed(() => (
  pendingDeleteUserIds.value.length > 1
    ? t('users.confirmBulkDelete', { count: pendingDeleteUserIds.value.length })
    : t('users.confirmDelete')
))

const handleCreateUser = () => {
  showCreateModal.value = true
}

const showErrorDialog = (message: string) => {
  dialogMessage.value = message
  showInfoDialog.value = true
}

const handleViewUser = (id: number) => {
  router.push(`/users/${id}`)
}

const handleDeleteUser = (id: number) => {
  const user = store.users.find((item) => item.id === id)

  if (isPrimaryAdminUser(user)) {
    showErrorDialog(t('users.primaryAdminProtected'))
    return
  }

  pendingDeleteUserIds.value = [id]
  showDeleteDialog.value = true
}

const handleBulkDeleteUsers = (ids: number[]) => {
  const deletableIds = ids.filter((id) => {
    const user = store.users.find((item) => item.id === id)
    return !isPrimaryAdminUser(user)
  })

  if (deletableIds.length === 0) {
    showErrorDialog(t('users.primaryAdminProtected'))
    return
  }

  pendingDeleteUserIds.value = deletableIds
  showDeleteDialog.value = true
}

const confirmDeleteUser = async () => {
  if (pendingDeleteUserIds.value.length === 0) {
    return
  }

  try {
    if (pendingDeleteUserIds.value.length > 1) {
      await store.deleteUsersBulk(pendingDeleteUserIds.value)
    } else {
      const userId = pendingDeleteUserIds.value[0]

      if (userId === undefined) {
        return
      }

      await store.deleteUser(userId)
    }
  } catch (err: any) {
    showErrorDialog(err?.response?.data?.message || err?.message || t('messages.failedToDeleteUser'))
  } finally {
    pendingDeleteUserIds.value = []
    showDeleteDialog.value = false
  }
}

const handleFormSuccess = async () => {
  showCreateModal.value = false
  await store.fetchUsers()
}

const handleModalSubmit = () => {
  // Form handles submission
}
</script>
