<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div v-if="isLoading" class="py-8 text-center">
      <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingUsers') }}</p>
    </div>

    <Alert
      v-if="errorMessage"
      type="error"
      :title="$t('common.error')"
      :message="errorMessage"
      class="mb-4"
    />

    <div v-if="userRecord" class="space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">{{ userRecord.name }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ userRecord.email }}</p>
          <p v-if="isPrimaryAdmin" class="mt-2 text-xs font-medium text-amber-600">{{ $t('users.primaryAdminProtected') }}</p>
          <p class="mt-2 text-xs text-gray-400">ID: {{ userRecord.id }}</p>
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <Badge :variant="getRoleVariant(userRecord.role)">
            {{ formatRole(userRecord.role) }}
          </Badge>
          <Badge :variant="userRecord.is_tracked ? 'success' : 'default'">
            {{ userRecord.is_tracked ? $t('users.tracked') : $t('users.notTracked') }}
          </Badge>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="group">
          <div class="mb-1 flex items-center gap-2">
            <p class="text-sm text-gray-500">{{ $t('users.name') }}</p>
            <button
              v-if="activeField !== 'name'"
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 opacity-100 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              :title="$t('common.edit')"
              :aria-label="$t('common.edit')"
              :disabled="!!savingField"
              @click="startEditing('name')"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <input
            v-if="activeField === 'name'"
            ref="nameInputRef"
            v-model.trim="draft.name"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="savingField === 'name'"
            @blur="saveField('name')"
            @keydown.enter.prevent="saveField('name')"
            @keydown.esc.prevent="cancelEditing('name')"
          />
          <p v-else class="font-semibold text-gray-900">{{ userRecord.name }}</p>
        </div>
        <div v-if="userRecord.role === 'manager' || userRecord.real_name || activeField === 'real_name'" class="group">
          <div class="mb-1 flex items-center gap-2">
            <p class="text-sm text-gray-500">{{ $t('users.realName') }}</p>
            <button
              v-if="activeField !== 'real_name'"
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 opacity-100 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              :title="$t('common.edit')"
              :aria-label="$t('common.edit')"
              :disabled="!!savingField"
              @click="startEditing('real_name')"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <input
            v-if="activeField === 'real_name'"
            ref="realNameInputRef"
            v-model.trim="draft.real_name"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="savingField === 'real_name'"
            @blur="saveField('real_name')"
            @keydown.enter.prevent="saveField('real_name')"
            @keydown.esc.prevent="cancelEditing('real_name')"
          />
          <p v-else class="font-semibold text-gray-900">{{ userRecord.real_name || '—' }}</p>
        </div>
        <div class="group">
          <div class="mb-1 flex items-center gap-2">
            <p class="text-sm text-gray-500">{{ $t('users.email') }}</p>
            <button
              v-if="activeField !== 'email' && !isFieldLocked('email')"
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 opacity-100 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              :title="$t('common.edit')"
              :aria-label="$t('common.edit')"
              :disabled="!!savingField"
              @click="startEditing('email')"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <input
            v-if="activeField === 'email'"
            ref="emailInputRef"
            v-model.trim="draft.email"
            type="email"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="savingField === 'email'"
            @blur="saveField('email')"
            @keydown.enter.prevent="saveField('email')"
            @keydown.esc.prevent="cancelEditing('email')"
          />
          <p v-else class="font-semibold text-gray-900">{{ userRecord.email }}</p>
        </div>

        <div class="group">
          <div class="mb-1 flex items-center gap-2">
            <p class="text-sm text-gray-500">{{ $t('users.role') }}</p>
            <button
              v-if="activeField !== 'role' && !isFieldLocked('role')"
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 opacity-100 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              :title="$t('common.edit')"
              :aria-label="$t('common.edit')"
              :disabled="!!savingField"
              @click="startEditing('role')"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <select
            v-if="activeField === 'role'"
            v-model="draft.role"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="savingField === 'role'"
            @change="saveField('role')"
            @keydown.esc.prevent="cancelEditing('role')"
          >
            <option value="worker">{{ $t('users.roles.worker') }}</option>
            <option value="manager">{{ $t('users.roles.manager') }}</option>
            <option value="admin">{{ $t('users.roles.admin') }}</option>
          </select>
          <Badge v-else :variant="getRoleVariant(userRecord.role)">
            {{ formatRole(userRecord.role) }}
          </Badge>
        </div>

        <div class="group">
          <div class="mb-1 flex items-center gap-2">
            <p class="text-sm text-gray-500">{{ $t('users.tracking') }}</p>
            <button
              v-if="activeField !== 'is_tracked' && !isFieldLocked('is_tracked')"
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 opacity-100 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              :title="$t('common.edit')"
              :aria-label="$t('common.edit')"
              :disabled="!!savingField"
              @click="startEditing('is_tracked')"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <label
            v-if="activeField === 'is_tracked'"
            class="inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
          >
            <input
              v-model="draft.is_tracked"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :disabled="savingField === 'is_tracked'"
              @change="saveField('is_tracked')"
            />
            <span>{{ $t('users.trackActivity') }}</span>
          </label>
          <Badge v-else :variant="userRecord.is_tracked ? 'success' : 'default'">
            {{ userRecord.is_tracked ? $t('users.tracked') : $t('users.notTracked') }}
          </Badge>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <div>
          <p class="text-sm text-gray-500">{{ $t('users.created') }}</p>
          <p class="font-semibold text-gray-900">{{ formatDate(userRecord.created_at, 'full') }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">{{ $t('users.updatedAt') }}</p>
          <p class="font-semibold text-gray-900">{{ formatDate(userRecord.updated_at, 'full') }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-gray-200 pt-4">
        <Button variant="secondary" @click="$emit('back')">
          {{ $t('common.back') }}
        </Button>
        <Button v-if="canDelete" variant="danger" @click="$emit('delete')">
          {{ $t('common.delete') }}
        </Button>
      </div>
    </div>

    <div v-else-if="!isLoading" class="py-8 text-center text-gray-600">
      <p>{{ $t('messages.userNotFound') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { isPrimaryAdminUser, type UpdateUserPayload, type User } from '@/services/userService'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'

interface Props {
  userId: number
  user?: User
  loading?: boolean
  error?: string
}

type EditableField = 'name' | 'real_name' | 'email' | 'role' | 'is_tracked'

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
})

defineEmits<{
  'back': []
  'delete': []
}>()

const authStore = useAuthStore()
const userStore = useUserStore()
const { t } = useI18n()
const { formatDate } = useFormattedDate()

const isLoading = ref(props.loading)
const errorMessage = ref(props.error)
const userRecord = ref<User | undefined>(props.user)
const activeField = ref<EditableField | null>(null)
const savingField = ref<EditableField | null>(null)
const nameInputRef = ref<HTMLInputElement | null>(null)
const emailInputRef = ref<HTMLInputElement | null>(null)
const realNameInputRef = ref<HTMLInputElement | null>(null)
const draft = ref({
  name: '',
  real_name: '',
  email: '',
  role: 'worker' as User['role'],
  is_tracked: false,
})

const isPrimaryAdmin = computed(() => isPrimaryAdminUser(userRecord.value))
const canDelete = computed(() => authStore.isAdmin && !isPrimaryAdmin.value)
const isFieldLocked = (field: EditableField) => (
  isPrimaryAdmin.value && ['email', 'role', 'is_tracked'].includes(field)
)

watch(() => props.loading, (value) => {
  isLoading.value = value
}, { immediate: true })

watch(() => props.error, (value) => {
  errorMessage.value = value
}, { immediate: true })

watch(() => props.user, (value) => {
  userRecord.value = value
  syncDraft(value)
}, { immediate: true })

function syncDraft(user?: User) {
  draft.value = {
    name: user?.name ?? '',
    real_name: user?.real_name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'worker',
    is_tracked: Boolean(user?.is_tracked),
  }
}

const getRoleVariant = (role: User['role']): 'info' | 'warning' | 'danger' | 'default' => {
  const variants: Record<User['role'], 'info' | 'warning' | 'danger'> = {
    admin: 'danger',
    manager: 'warning',
    worker: 'info',
  }

  return variants[role] || 'default'
}

const formatRole = (role: User['role']) => {
  const formatted: Record<User['role'], string> = {
    admin: t('users.roles.admin'),
    manager: t('users.roles.manager'),
    worker: t('users.roles.worker'),
  }

  return formatted[role] || role
}

const startEditing = async (field: EditableField) => {
  if (!userRecord.value || savingField.value || isFieldLocked(field)) {
    return
  }

  if (field === 'real_name' && userRecord.value.role !== 'manager') {
    return
  }

  errorMessage.value = ''
  syncDraft(userRecord.value)
  activeField.value = field
  await nextTick()

  if (field === 'name') {
    nameInputRef.value?.focus()
  }

  if (field === 'real_name') {
    realNameInputRef.value?.focus()
  }

  if (field === 'email') {
    emailInputRef.value?.focus()
  }
}

const cancelEditing = (field: EditableField) => {
  if (activeField.value !== field) {
    return
  }

  syncDraft(userRecord.value)
  activeField.value = null
  errorMessage.value = ''
}

const saveField = async (field: EditableField) => {
  if (!userRecord.value) {
    return
  }

  const payload: UpdateUserPayload = {}

  if (field === 'name') {
    const value = draft.value.name.trim()
    if (!value) {
      errorMessage.value = t('validation.nameRequired')
      return
    }
    payload.name = value
  }

  if (field === 'real_name') {
    payload.real_name = draft.value.real_name.trim() || null
  }

  if (field === 'email') {
    const value = draft.value.email.trim()
    if (!value) {
      errorMessage.value = t('validation.emailRequired')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errorMessage.value = t('validation.invalidEmail')
      return
    }
    payload.email = value
  }

  if (field === 'role') {
    payload.role = draft.value.role
    if (draft.value.role !== 'manager') {
      payload.real_name = null
    }
  }

  if (field === 'is_tracked') {
    payload.is_tracked = draft.value.is_tracked
  }

  savingField.value = field

  try {
    const updatedUser = await userStore.updateUser(userRecord.value.id, payload)
    userRecord.value = updatedUser
    syncDraft(updatedUser)
    activeField.value = null
    errorMessage.value = ''
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || err?.message || t('messages.failedToSaveUser')
  } finally {
    savingField.value = null
  }
}
</script>
