<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <button
        class="font-medium text-blue-500 hover:text-blue-700"
        @click="$router.back()"
      >
        ← {{ $t('common.back') }}
      </button>
    </div>

    <UserDetail
      :user-id="userId"
      :user="currentUser"
      :loading="isLoading"
      :error="error"
      @back="$router.back()"
      @delete="handleDelete"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import type { User } from '@/services/userService'
import UserDetail from '@/components/users/UserDetail.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const { t } = useI18n()

const userId = computed(() => parseInt(route.params.id as string, 10))
const showDeleteDialog = ref(false)
const isLoading = ref(false)
const error = ref('')

const currentUser = computed<User | undefined>(() => store.currentUser ?? undefined)

const handleDelete = () => {
  showDeleteDialog.value = true
}

const confirmDeleteUser = async () => {
  try {
    await store.deleteUser(userId.value)
    showDeleteDialog.value = false
    router.push('/users')
  } catch (err: any) {
    error.value = err?.message || t('messages.failedToDeleteUser')
  }
}

const loadUser = async () => {
  isLoading.value = true

  try {
    await store.fetchUser(userId.value)
    error.value = ''
  } catch (err: any) {
    error.value = err?.message || t('messages.failedToLoadUser')
  } finally {
    isLoading.value = false
  }
}

watch(() => userId.value, () => {
  void loadUser()
}, { immediate: true })
</script>
