<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="mb-4">
      <label class="mb-1 block text-sm font-medium text-gray-700">
        {{ $t('orders.executor') }}
        <span class="text-red-500">*</span>
      </label>

      <div class="relative">
        <input
          v-model.trim="responsibleName"
          type="text"
          name="responsible_lookup"
          autocomplete="new-password"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          data-lpignore="true"
          :placeholder="isLoadingManagers ? $t('common.loading') : $t('orders.selectExecutor')"
          :class="[
            'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.responsible_name ? 'border-red-500' : 'border-gray-300'
          ]"
          @focus="openResponsibleSuggestions"
          @input="openResponsibleSuggestions"
          @blur="closeResponsibleSuggestions"
        />

        <div
          v-if="showResponsibleSuggestions && filteredManagers.length > 0"
          class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <button
            v-for="manager in filteredManagers"
            :key="manager.id"
            type="button"
            class="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-blue-50"
            @mousedown.prevent="selectResponsible(manager)"
          >
            <span class="text-sm font-medium text-gray-900">{{ manager.name }}</span>
            <span v-if="manager.real_name" class="text-xs text-gray-500">{{ manager.real_name }}</span>
          </button>
        </div>
      </div>

      <p class="mt-1 text-xs text-gray-500">
        {{ $t('orders.selectExecutor') }} — можно выбрать из списка менеджеров или вписать вручную.
      </p>
      <p v-if="errors.responsible_name" class="mt-1 text-sm text-red-500">{{ errors.responsible_name }}</p>
    </div>

    <div class="mb-4">
      <label class="mb-1 block text-sm font-medium text-gray-700">
        {{ $t('orders.formDescription') }}
        <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="form.description"
        :placeholder="$t('orders.formDescriptionPlaceholder')"
        rows="4"
        :class="[
          'w-full rounded-lg border px-3 py-2 transition-colors duration-200',
          errors.description ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        ]"
      />
      <p v-if="errors.description" class="mt-1 text-sm text-red-500">{{ errors.description }}</p>
    </div>

    <div class="mb-4">
      <label class="mb-1 block text-sm font-medium text-gray-700">
        {{ $t('orders.note') }}
      </label>
      <textarea
        v-model="form.note"
        :placeholder="$t('orders.notePlaceholder')"
        rows="3"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div
        class="rounded-xl border-2 border-dashed p-4 text-center transition-colors"
        :class="isDraggingImages ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white/80'"
        @dragenter.prevent="isDraggingImages = true"
        @dragover.prevent="isDraggingImages = true"
        @dragleave.prevent="isDraggingImages = false"
        @drop="handleImageDrop"
      >
        <p class="text-sm font-semibold text-slate-900">
          {{ isDraggingImages ? $t('orders.dragDropActive') : $t('orders.dragDropTitle') }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          {{ $t('orders.dragDropSubtitle') }}
        </p>

        <div class="mt-3 flex flex-wrap items-center justify-center gap-3">
          <label class="inline-flex cursor-pointer items-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50">
            <input
              type="file"
              multiple
              :accept="ORDER_IMAGE_ACCEPT_ATTRIBUTE"
              class="hidden"
              @change="handleImageSelection"
            />
            {{ $t('orders.addImages') }}
          </label>

          <span class="text-xs text-slate-500">
            {{ totalSelectedImages }} / {{ ORDER_IMAGE_MAX_FILES }}
          </span>
        </div>
      </div>

      <p class="mt-3 text-xs text-slate-500">
        {{ $t('orders.imageRules', { size: ORDER_IMAGE_MAX_SIZE_MB, count: ORDER_IMAGE_MAX_FILES }) }}
      </p>
      <p v-if="imageError" class="mt-2 text-sm text-red-500">{{ imageError }}</p>

      <div v-if="existingImages.length || newImagePreviews.length" class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div
          v-for="(image, index) in existingImages"
          :key="`existing-${image.id}`"
          class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <img
            :src="image.thumbnail_url || image.url"
            :alt="image.original_name || $t('orders.image')"
            class="aspect-[4/3] w-full object-cover"
          />
          <label
            class="absolute right-2 top-2 inline-flex items-center justify-center rounded-md bg-white/95 p-1 shadow-sm"
            :title="preferredCoverSource === 'existing' && index === 0 ? $t('orders.cover') : $t('orders.makeCover')"
            @click.stop
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:outline-none focus:ring-0"
              :checked="preferredCoverSource === 'existing' && index === 0"
              :aria-label="preferredCoverSource === 'existing' && index === 0 ? $t('orders.cover') : $t('orders.makeCover')"
              @change="makeExistingImageCover(image.id)"
            />
          </label>
          <div class="flex items-center justify-between p-2">
            <span class="text-[11px] text-slate-500">{{ $t('orders.savedImage') }}</span>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              :title="$t('orders.deleteImage')"
              :aria-label="$t('orders.deleteImage')"
              @click="markExistingImageForRemoval(image.id)"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div
          v-for="(preview, index) in newImagePreviews"
          :key="`${preview.file.name}-${preview.url}`"
          class="group relative overflow-hidden rounded-xl border border-blue-200 bg-white"
        >
          <img
            :src="preview.url"
            :alt="preview.file.name"
            class="aspect-[4/3] w-full object-cover"
          />
          <label
            class="absolute right-2 top-2 inline-flex items-center justify-center rounded-md bg-white/95 p-1 shadow-sm"
            :title="preferredCoverSource === 'new' && index === 0 ? $t('orders.cover') : $t('orders.makeCover')"
            @click.stop
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:outline-none focus:ring-0"
              :checked="preferredCoverSource === 'new' && index === 0"
              :aria-label="preferredCoverSource === 'new' && index === 0 ? $t('orders.cover') : $t('orders.makeCover')"
              @change="makePendingImageCover(index)"
            />
          </label>
          <div class="flex items-center justify-between p-2">
            <span class="text-[11px] text-blue-600">{{ $t('orders.newImage') }}</span>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              :title="$t('orders.deleteImage')"
              :aria-label="$t('orders.deleteImage')"
              @click="removePendingImage(index)"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="mt-4 rounded-lg border border-dashed border-slate-300 bg-white/80 px-4 py-5 text-sm text-slate-500">
        {{ $t('orders.noImages') }}
      </div>
    </div>

    <div v-if="canManageFinancials" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          {{ $t('orders.packageCost') }}
        </label>
        <input
          v-model.number="form.package_cost"
          type="number"
          min="0"
          step="0.01"
          :placeholder="$t('orders.packageCostPlaceholder')"
          :class="[
            'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.package_cost ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.package_cost" class="mt-1 text-sm text-red-500">{{ errors.package_cost }}</p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          {{ $t('orders.orderCost') }}
        </label>
        <input
          v-model.number="form.order_cost"
          type="number"
          min="0"
          step="0.01"
          :placeholder="$t('orders.orderCostPlaceholder')"
          :class="[
            'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.order_cost ? 'border-red-500' : 'border-gray-300'
          ]"
        />
        <p v-if="errors.order_cost" class="mt-1 text-sm text-red-500">{{ errors.order_cost }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          {{ $t('orders.priority') }}
          <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.priority"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">{{ $t('orders.priorities.low') }}</option>
          <option value="medium">{{ $t('orders.priorities.medium') }}</option>
          <option value="high">{{ $t('orders.priorities.high') }}</option>
        </select>
      </div>

      <div v-if="isEdit">
        <label class="mb-1 block text-sm font-medium text-gray-700">
          {{ $t('orders.status') }}
        </label>
        <select
          v-model="form.status"
          :class="[
            'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.status ? 'border-red-500' : 'border-gray-300'
          ]"
        >
          <option value="new">{{ $t('orders.statuses.new') }}</option>
          <option value="in_progress">{{ $t('orders.statuses.in_progress') }}</option>
          <option value="completed">{{ $t('orders.statuses.completed') }}</option>
          <option value="cancelled">{{ $t('orders.statuses.cancelled') }}</option>
        </select>
        <p v-if="errors.status" class="mt-1 text-sm text-red-500">{{ errors.status }}</p>
      </div>
    </div>

    <Alert
      v-if="generalError"
      type="error"
      :title="$t('common.error')"
      :message="generalError"
      @close="generalError = ''"
    />

    <div class="flex justify-end gap-2 border-t border-gray-200 pt-4">
      <Button
        variant="secondary"
        type="button"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        {{ $t('common.cancel') }}
      </Button>
      <Button type="submit" :loading="isSubmitting">
        {{ isEdit ? $t('common.update') : $t('common.create') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import userService from '@/services/userService'
import {
  ORDER_IMAGE_ACCEPT_ATTRIBUTE,
  ORDER_IMAGE_ALLOWED_MIME_TYPES,
  ORDER_IMAGE_MAX_FILES,
  ORDER_IMAGE_MAX_SIZE_BYTES,
  ORDER_IMAGE_MAX_SIZE_MB,
} from '@/services/orderService'
import type { Order, OrderImage, OrderPriority } from '@/services/orderService'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'

interface Props {
  orderId?: number
  initialData?: {
    description: string
    note: string
    package_cost: number | null
    order_cost: number | null
    priority?: OrderPriority
    status?: Order['status']
    responsible_name?: string
    images?: OrderImage[]
  }
}

interface ManagerOption {
  id: number
  name: string
  real_name?: string | null
}

interface PendingImagePreview {
  file: File
  url: string
}

type CoverSource = 'existing' | 'new' | null

const props = defineProps<Props>()
const emit = defineEmits<{
  cancel: []
  success: []
}>()

const store = useOrderStore()
const authStore = useAuthStore()
const { t } = useI18n()

const isEdit = computed(() => !!props.orderId)
const canManageFinancials = computed(() => authStore.isManager || authStore.isAdmin)
const managers = ref<ManagerOption[]>([])
const isLoadingManagers = ref(false)
const responsibleName = ref(authStore.user?.name ?? '')
const showResponsibleSuggestions = ref(false)
const existingImages = ref<OrderImage[]>([])
const deletedImageIds = ref<number[]>([])
const newImagePreviews = ref<PendingImagePreview[]>([])
const imageError = ref('')
const isDraggingImages = ref(false)
const preferredCoverSource = ref<CoverSource>(null)
let responsibleSuggestionsTimeout: ReturnType<typeof setTimeout> | null = null

const filteredManagers = computed(() => {
  const currentUserName = (authStore.user?.name ?? '').trim().toLowerCase()
  const query = responsibleName.value.trim().toLowerCase()

  const sortedManagers = [...managers.value].sort((a, b) => {
    const aIsCurrent = a.name.trim().toLowerCase() === currentUserName
    const bIsCurrent = b.name.trim().toLowerCase() === currentUserName

    if (aIsCurrent !== bIsCurrent) {
      return aIsCurrent ? -1 : 1
    }

    return a.name.localeCompare(b.name, 'ru')
  })

  if (!query || query === currentUserName) {
    return sortedManagers
  }

  const matches = sortedManagers.filter((manager) => {
    return manager.name.toLowerCase().includes(query)
      || (manager.real_name ?? '').toLowerCase().includes(query)
  })

  return matches.length > 0 ? matches : sortedManagers
})

const totalSelectedImages = computed(() => existingImages.value.length + newImagePreviews.value.length)

const form = ref<{
  description: string
  note: string
  package_cost: number | null | ''
  order_cost: number | null | ''
  priority: OrderPriority
  status: Order['status']
}>({
  description: '',
  note: '',
  package_cost: null,
  order_cost: null,
  priority: 'medium',
  status: 'new',
})

const errors = ref<Record<string, string>>({})
const generalError = ref('')
const isSubmitting = ref(false)

const resetPendingImages = () => {
  newImagePreviews.value.forEach((preview) => URL.revokeObjectURL(preview.url))
  newImagePreviews.value = []
}

const getDefaultResponsibleName = () => {
  if (props.initialData?.responsible_name?.trim()) {
    return props.initialData.responsible_name.trim()
  }

  return authStore.user?.name ?? ''
}

const syncForm = () => {
  resetPendingImages()
  deletedImageIds.value = []
  imageError.value = ''
  isDraggingImages.value = false
  existingImages.value = [...(props.initialData?.images ?? [])]
  preferredCoverSource.value = existingImages.value.length > 0 ? 'existing' : null

  form.value = {
    description: props.initialData?.description || '',
    note: props.initialData?.note || '',
    package_cost: props.initialData?.package_cost !== null && props.initialData?.package_cost !== undefined
      ? Number(props.initialData.package_cost)
      : null,
    order_cost: props.initialData?.order_cost !== null && props.initialData?.order_cost !== undefined
      ? Number(props.initialData.order_cost)
      : null,
    priority: props.initialData?.priority || 'medium',
    status: props.initialData?.status || 'new',
  }

  responsibleName.value = getDefaultResponsibleName()
}

watch(() => props.initialData, syncForm, { immediate: true, deep: true })

watch(
  () => authStore.user?.name,
  (userName) => {
    if (!userName || responsibleName.value.trim()) {
      return
    }

    responsibleName.value = userName
  },
  { immediate: true },
)

const toNullableNumber = (value: number | null | '' | undefined) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

const loadManagers = async () => {
  isLoadingManagers.value = true
  try {
    const response = await userService.getUsers(1, 100, 'manager')
    managers.value = response.data
      .map((manager) => ({
        id: manager.id,
        name: manager.name,
        real_name: manager.real_name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
  } catch (err) {
    console.error('Failed to load managers:', err)
    managers.value = []
  } finally {
    isLoadingManagers.value = false
  }
}

const openResponsibleSuggestions = () => {
  if (responsibleSuggestionsTimeout) {
    clearTimeout(responsibleSuggestionsTimeout)
    responsibleSuggestionsTimeout = null
  }

  showResponsibleSuggestions.value = true
}

const closeResponsibleSuggestions = () => {
  responsibleSuggestionsTimeout = setTimeout(() => {
    showResponsibleSuggestions.value = false
  }, 120)
}

const selectResponsible = (manager: ManagerOption) => {
  responsibleName.value = manager.name
  showResponsibleSuggestions.value = false
}

const processSelectedFiles = (selectedFiles: File[]) => {
  const remainingSlots = ORDER_IMAGE_MAX_FILES - totalSelectedImages.value

  imageError.value = ''

  if (remainingSlots <= 0) {
    imageError.value = t('orders.imageLimitReached', { count: ORDER_IMAGE_MAX_FILES })
    return
  }

  const acceptedFiles: PendingImagePreview[] = []

  for (const file of selectedFiles) {
    if (!ORDER_IMAGE_ALLOWED_MIME_TYPES.includes(file.type as typeof ORDER_IMAGE_ALLOWED_MIME_TYPES[number])) {
      imageError.value = t('orders.invalidImageFormat')
      continue
    }

    if (file.size > ORDER_IMAGE_MAX_SIZE_BYTES) {
      imageError.value = t('orders.imageTooLarge', { size: ORDER_IMAGE_MAX_SIZE_MB })
      continue
    }

    if ((acceptedFiles.length + totalSelectedImages.value) >= ORDER_IMAGE_MAX_FILES) {
      imageError.value = t('orders.imageLimitReached', { count: ORDER_IMAGE_MAX_FILES })
      break
    }

    acceptedFiles.push({
      file,
      url: URL.createObjectURL(file),
    })
  }

  if (acceptedFiles.length > 0) {
    newImagePreviews.value = [...newImagePreviews.value, ...acceptedFiles]

    if (!preferredCoverSource.value) {
      preferredCoverSource.value = 'new'
    }
  }
}

const handleImageSelection = (event: Event) => {
  const input = event.target as HTMLInputElement
  processSelectedFiles(Array.from(input.files || []))
  input.value = ''
}

const handleImageDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingImages.value = false
  processSelectedFiles(Array.from(event.dataTransfer?.files || []))
}

const removePendingImage = (index: number) => {
  const [removed] = newImagePreviews.value.splice(index, 1)
  if (removed) {
    URL.revokeObjectURL(removed.url)
  }

  if (newImagePreviews.value.length === 0 && preferredCoverSource.value === 'new') {
    preferredCoverSource.value = existingImages.value.length > 0 ? 'existing' : null
  }

  imageError.value = ''
}

const makePendingImageCover = (index: number) => {
  if (index <= 0 && preferredCoverSource.value === 'new') {
    return
  }

  const [selectedPreview] = newImagePreviews.value.splice(index, 1)

  if (selectedPreview) {
    newImagePreviews.value.unshift(selectedPreview)
    preferredCoverSource.value = 'new'
  }
}

const makeExistingImageCover = (imageId: number) => {
  const selectedIndex = existingImages.value.findIndex((image) => image.id === imageId)

  if (selectedIndex === -1) {
    return
  }

  const [selectedImage] = existingImages.value.splice(selectedIndex, 1)

  if (selectedImage) {
    existingImages.value.unshift(selectedImage)
    preferredCoverSource.value = 'existing'
  }
}

const markExistingImageForRemoval = (imageId: number) => {
  if (!deletedImageIds.value.includes(imageId)) {
    deletedImageIds.value.push(imageId)
  }

  existingImages.value = existingImages.value.filter((image) => image.id !== imageId)

  if (existingImages.value.length === 0 && preferredCoverSource.value === 'existing') {
    preferredCoverSource.value = newImagePreviews.value.length > 0 ? 'new' : null
  }

  imageError.value = ''
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.description.trim()) {
    errors.value.description = t('validation.descriptionRequired')
  }

  if (!responsibleName.value.trim()) {
    errors.value.responsible_name = t('validation.executorRequired')
  }

  const packageCost = toNullableNumber(form.value.package_cost)
  const orderCost = toNullableNumber(form.value.order_cost)

  if (packageCost !== null && packageCost < 0) {
    errors.value.package_cost = t('validation.nonNegativeNumber')
  }

  if (orderCost !== null && orderCost < 0) {
    errors.value.order_cost = t('validation.nonNegativeNumber')
  }

  if (totalSelectedImages.value > ORDER_IMAGE_MAX_FILES) {
    imageError.value = t('orders.imageLimitReached', { count: ORDER_IMAGE_MAX_FILES })
  }

  return Object.keys(errors.value).length === 0 && !imageError.value
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const payload = {
    title: form.value.description.trim().slice(0, 80),
    description: form.value.description.trim(),
    note: form.value.note.trim() || undefined,
    package_cost: canManageFinancials.value ? toNullableNumber(form.value.package_cost) : undefined,
    order_cost: canManageFinancials.value ? toNullableNumber(form.value.order_cost) : undefined,
    priority: form.value.priority,
    responsible_name: responsibleName.value.trim(),
    images: newImagePreviews.value.length ? newImagePreviews.value.map((preview) => preview.file) : undefined,
    deleted_image_ids: deletedImageIds.value.length ? [...deletedImageIds.value] : undefined,
    cover_image_id: preferredCoverSource.value === 'existing' && existingImages.value[0]
      ? existingImages.value[0].id
      : undefined,
    cover_upload_index: preferredCoverSource.value === 'new' && newImagePreviews.value.length > 0
      ? 0
      : undefined,
  }

  try {
    if (isEdit.value && props.orderId) {
      await store.updateOrder(props.orderId, {
        ...payload,
        status: form.value.status,
      })
    } else {
      await store.createOrder(payload)
    }

    generalError.value = ''
    emit('success')
  } catch (err: any) {
    const validationErrors = err?.response?.data?.errors
    const firstValidationError = validationErrors ? Object.values(validationErrors).flat()[0] : null
    generalError.value = typeof firstValidationError === 'string'
      ? firstValidationError
      : err?.response?.data?.message || err?.message || t('messages.failedToSaveOrder')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadManagers()
})

onBeforeUnmount(() => {
  resetPendingImages()
})
</script>

