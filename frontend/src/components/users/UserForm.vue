<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Name -->
    <Input
      v-model="form.name"
      :label="$t('users.name')"
      :placeholder="$t('users.name')"
      required
      :error="errors.name"
    />

    <!-- Email -->
    <Input
      v-model="form.email"
      type="email"
      :label="$t('users.email')"
      :placeholder="$t('users.email')"
      required
      :error="errors.email"
    />

    <!-- Password (only for create) -->
    <div v-if="!isEdit">
      <Input
        v-model="form.password"
        type="password"
        :label="$t('auth.password')"
        :placeholder="$t('auth.password')"
        required
        :hint="$t('auth.passwordRequirements')"
        :error="errors.password"
      />
    </div>

    <!-- Role -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ $t('users.role') }}
        <span class="text-red-500">*</span>
      </label>
      <select
        v-model="form.role"
        :class="[
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.role ? 'border-red-500' : 'border-gray-300'
        ]"
      >
        <option value="worker">{{ $t('users.roles.worker') }}</option>
        <option value="manager">{{ $t('users.roles.manager') }}</option>
        <option value="admin">{{ $t('users.roles.admin') }}</option>
      </select>
      <p v-if="errors.role" class="mt-1 text-sm text-red-500">{{ errors.role }}</p>
    </div>

    <div class="rounded-lg border border-gray-200 p-3 bg-gray-50">
      <label class="flex items-start gap-3 cursor-pointer">
        <input
          v-model="form.is_tracked"
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <p class="text-sm font-medium text-gray-900">{{ $t('users.trackActivity') }}</p>
          <p class="text-xs text-gray-500">{{ $t('history.description') }}</p>
        </div>
      </label>
    </div>

    <!-- Error Alert -->
    <Alert
      v-if="generalError"
      type="error"
      :title="$t('common.error')"
      :message="generalError"
    />

    <!-- Buttons -->
    <div class="flex gap-2 justify-end pt-4 border-t border-gray-200">
      <Button
        variant="secondary"
        type="button"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        {{ $t('common.cancel') }}
      </Button>
      <Button
        type="submit"
        :loading="isSubmitting"
      >
        {{ isEdit ? $t('common.update') : $t('common.create') }} {{ $t('users.title') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import type { User } from '@/services/userService'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'

interface Props {
  userId?: number
  initialData?: {
    name: string
    email: string
    role: User['role']
    is_tracked: boolean
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'cancel': []
  'success': []
}>()

const store = useUserStore()
const { t } = useI18n()
const isEdit = computed(() => !!props.userId)

const form = ref<{ name: string; email: string; password: string; role: User['role']; is_tracked: boolean }>({
  name: '',
  email: '',
  password: '',
  role: 'worker',
  is_tracked: false,
})

const syncForm = () => {
  form.value = {
    name: props.initialData?.name || '',
    email: props.initialData?.email || '',
    password: '',
    role: props.initialData?.role || 'worker',
    is_tracked: props.initialData?.is_tracked || false,
  }
}

watch(() => props.initialData, syncForm, { immediate: true, deep: true })
const errors = ref<Record<string, string>>({})
const generalError = ref('')
const isSubmitting = ref(false)

const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = t('validation.nameRequired')
  }

  if (!form.value.email.trim()) {
    errors.value.email = t('validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = t('validation.invalidEmail')
  }

  if (!isEdit.value) {
    if (!form.value.password) {
      errors.value.password = t('validation.required')
    } else if (form.value.password.length < 8) {
      errors.value.password = t('validation.passwordTooShort')
    } else if (!/[a-zA-Z]/.test(form.value.password) || !/[0-9]/.test(form.value.password)) {
      errors.value.password = t('validation.passwordRequirements')
    }
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  try {
    if (isEdit.value && props.userId) {
      await store.updateUser(props.userId, {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
        is_tracked: form.value.is_tracked,
      })
    } else {
      await store.createUser({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
        is_tracked: form.value.is_tracked,
      })
    }
    generalError.value = ''
    emit('success')
  } catch (err: any) {
    generalError.value = err?.response?.data?.message || err?.message || t('messages.failedToSaveUser')
  } finally {
    isSubmitting.value = false
  }
}
</script>

