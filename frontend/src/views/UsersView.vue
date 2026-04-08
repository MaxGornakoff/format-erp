<template>
  <div class="space-y-4">
    <h1 class="text-3xl font-bold text-gray-900">{{ $t('users.title') }}</h1>
    <p class="text-gray-600">{{ $t('users.description') }}</p>

    <!-- Modal for Create/Edit -->
    <Modal v-model="showModal" @submit="handleModalSubmit">
      <template #header>
        {{ editingUserId ? $t('users.editUser') : $t('users.createUser') }}
      </template>
      <UserForm
        :user-id="editingUserId"
        :initial-data="editingUserData"
        @cancel="showModal = false"
        @success="handleFormSuccess"
      />
    </Modal>

    <!-- Users Table -->
    <UsersTable
      @create="handleCreateUser"
      @edit="handleEditUser"
      @delete="handleDeleteUser"
    />

    <ConfirmDialog
      v-model="showDeleteDialog"
      :title="$t('common.warning')"
      :message="$t('users.confirmDelete')"
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { User } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import UsersTable from '@/components/users/UsersTable.vue'
import UserForm from '@/components/users/UserForm.vue'

const store = useUserStore()
const { t } = useI18n()
const showModal = ref(false)
const showDeleteDialog = ref(false)
const showInfoDialog = ref(false)
const dialogMessage = ref('')
const pendingDeleteUserId = ref<number | null>(null)
const editingUserId = ref<number | undefined>(undefined)
const editingUserData = ref<{ name: string; email: string; role: User['role']; is_tracked: boolean } | undefined>(undefined)

const handleCreateUser = () => {
  editingUserId.value = undefined
  editingUserData.value = undefined
  showModal.value = true
}

const showErrorDialog = (message: string) => {
  dialogMessage.value = message
  showInfoDialog.value = true
}

const handleEditUser = async (id: number) => {
  try {
    const user = store.users.find((item) => item.id === id) ?? await store.fetchUser(id)

    editingUserId.value = id
    editingUserData.value = {
      name: user.name,
      email: user.email,
      role: user.role,
      is_tracked: user.is_tracked,
    }
    showModal.value = true
  } catch (err: any) {
    showErrorDialog(err?.response?.data?.message || err?.message || t('messages.failedToLoadUsers'))
  }
}

const handleDeleteUser = (id: number) => {
  pendingDeleteUserId.value = id
  showDeleteDialog.value = true
}

const confirmDeleteUser = async () => {
  if (!pendingDeleteUserId.value) {
    return
  }

  try {
    await store.deleteUser(pendingDeleteUserId.value)
  } catch (err: any) {
    showErrorDialog(err?.response?.data?.message || err?.message || t('messages.failedToDeleteUser'))
  } finally {
    pendingDeleteUserId.value = null
    showDeleteDialog.value = false
  }
}

const handleFormSuccess = async () => {
  showModal.value = false
  editingUserId.value = undefined
  editingUserData.value = undefined
  await store.fetchUsers()
}

const handleModalSubmit = () => {
  // Form handles submission
}
</script>
