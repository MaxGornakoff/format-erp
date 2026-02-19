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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/ui/Modal.vue'
import UsersTable from '@/components/users/UsersTable.vue'
import UserForm from '@/components/users/UserForm.vue'

const { t } = useI18n()
const showModal = ref(false)
const editingUserId = ref<number | null>(null)
const editingUserData = ref()

const handleCreateUser = () => {
  editingUserId.value = null
  editingUserData.value = undefined
  showModal.value = true
}

const handleEditUser = (id: number) => {
  editingUserId.value = id
  // TODO: Fetch user data for editing
  showModal.value = true
}

const handleDeleteUser = async (id: number) => {
  if (confirm(t('users.confirmDelete'))) {
    // TODO: Delete user via service
    // await userService.deleteUser(id)
  }
}

const handleFormSuccess = () => {
  showModal.value = false
  editingUserId.value = null
  editingUserData.value = undefined
}

const handleModalSubmit = () => {
  // Form handles submission
}
</script>
