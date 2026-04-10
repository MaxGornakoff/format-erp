<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingOrderDetails') }}</p>
    </div>

    <Alert
      v-else-if="!order && errorMessage"
      type="error"
      :title="$t('common.error')"
      :message="errorMessage"
    />

    <div v-else-if="order" class="space-y-6">
      <Alert
        v-if="errorMessage"
        type="error"
        :title="$t('common.error')"
        :message="errorMessage"
      />

      <div class="flex items-start justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('orders.orderNumber') }}{{ order.id }}</h1>
          <p class="mt-1 text-sm text-gray-500">{{ displayResponsibleName }}</p>
          <p v-if="displayResponsibleRealName" class="mt-1 text-xs text-gray-400">{{ displayResponsibleRealName }}</p>
        </div>
        <div class="flex gap-2 flex-wrap justify-end">
          <Badge :variant="getPriorityVariant(order.priority)">
            {{ formatPriority(order.priority) }}
          </Badge>
          <Badge :variant="getStatusVariant(order.status)">
            {{ formatStatus(order.status) }}
          </Badge>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div class="group">
          <div class="flex items-center gap-2 mb-1">
            <p class="text-sm text-gray-500">{{ $t('orders.executor') }}</p>
            <button
              v-if="canAssignResponsible && activeField !== 'responsible_name'"
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              :title="$t('common.edit')"
              :aria-label="$t('common.edit')"
              :disabled="!!savingField || isUpdatingQuickField"
              @click="startEditing('responsible_name')"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <template v-if="activeField === 'responsible_name' && canAssignResponsible">
            <div class="relative">
              <input
                ref="responsibleInputRef"
                v-model.trim="draft.responsible_name"
                type="text"
                name="responsible_lookup"
                autocomplete="new-password"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                data-lpignore="true"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="savingField === 'responsible_name'"
                @focus="openResponsibleSuggestions"
                @input="openResponsibleSuggestions"
                @blur="closeResponsibleSuggestions"
                @keydown.enter.prevent="saveField('responsible_name')"
                @keydown.esc.prevent="cancelEditing('responsible_name')"
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
          </template>
          <div v-else>
            <p class="font-semibold">{{ displayResponsibleName }}</p>
            <p v-if="displayResponsibleRealName" class="text-xs text-gray-500">{{ displayResponsibleRealName }}</p>
          </div>
        </div>

        <div>
          <p class="text-sm text-gray-500">{{ $t('orders.createdAt') }}</p>
          <p class="font-semibold">{{ formatDate(order.created_at, 'full') }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">{{ $t('orders.updatedAt') }}</p>
          <p class="font-semibold">{{ formatDate(order.updated_at, 'full') }}</p>
        </div>

        <div v-if="canViewFinancials" class="group">
          <div class="flex items-center gap-2 mb-1">
            <p class="text-sm text-gray-500">{{ $t('orders.packageCost') }}</p>
            <button
              v-if="canEdit && activeField !== 'package_cost'"
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              :title="$t('common.edit')"
              :aria-label="$t('common.edit')"
              :disabled="!!savingField || isUpdatingQuickField"
              @click="startEditing('package_cost')"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <input
            v-if="activeField === 'package_cost' && canEdit"
            ref="packageCostInputRef"
            v-model.number="draft.package_cost"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="savingField === 'package_cost'"
            @blur="saveField('package_cost')"
            @keydown.enter.prevent="saveField('package_cost')"
            @keydown.esc.prevent="cancelEditing('package_cost')"
          />
          <p v-else class="font-semibold">{{ formatCurrency(order.package_cost) }}</p>
        </div>

        <div v-if="canViewFinancials" class="group">
          <div class="flex items-center gap-2 mb-1">
            <p class="text-sm text-gray-500">{{ $t('orders.orderCost') }}</p>
            <button
              v-if="canEdit && activeField !== 'order_cost'"
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              :title="$t('common.edit')"
              :aria-label="$t('common.edit')"
              :disabled="!!savingField || isUpdatingQuickField"
              @click="startEditing('order_cost')"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <input
            v-if="activeField === 'order_cost' && canEdit"
            ref="orderCostInputRef"
            v-model.number="draft.order_cost"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="savingField === 'order_cost'"
            @blur="saveField('order_cost')"
            @keydown.enter.prevent="saveField('order_cost')"
            @keydown.esc.prevent="cancelEditing('order_cost')"
          />
          <p v-else class="font-semibold">{{ formatCurrency(order.order_cost) }}</p>
        </div>

        <div>
          <p class="text-sm text-gray-500">{{ $t('orders.status') }}</p>
          <p class="font-semibold">{{ formatStatus(order.status) }}</p>
        </div>
      </div>

      <div class="group">
        <div class="flex items-center gap-2 mb-2">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('orders.formDescription') }}</h2>
          <button
            v-if="canEdit && activeField !== 'description'"
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            :title="$t('common.edit')"
            :aria-label="$t('common.edit')"
            :disabled="!!savingField || isUpdatingQuickField"
            @click="startEditing('description')"
          >
            <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
              <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <textarea
          v-if="activeField === 'description' && canEdit"
          ref="descriptionTextareaRef"
          v-model="draft.description"
          rows="5"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="savingField === 'description'"
          @blur="saveField('description')"
          @keydown.ctrl.enter.prevent="saveField('description')"
          @keydown.esc.prevent="cancelEditing('description')"
        />
        <p v-else class="text-gray-700 whitespace-pre-wrap">{{ order.description }}</p>
      </div>

      <div class="group">
        <div class="flex items-center gap-2 mb-2">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('orders.note') }}</h2>
          <button
            v-if="canEdit && activeField !== 'note'"
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            :title="$t('common.edit')"
            :aria-label="$t('common.edit')"
            :disabled="!!savingField || isUpdatingQuickField"
            @click="startEditing('note')"
          >
            <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
              <path d="M13.5 3.5L16.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4.5 15.5L7.5 15L15.8 6.7C16.2 6.3 16.2 5.7 15.8 5.3L14.7 4.2C14.3 3.8 13.7 3.8 13.3 4.2L5 12.5L4.5 15.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <textarea
          v-if="activeField === 'note' && canEdit"
          ref="noteTextareaRef"
          v-model="draft.note"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="savingField === 'note'"
          @blur="saveField('note')"
          @keydown.ctrl.enter.prevent="saveField('note')"
          @keydown.esc.prevent="cancelEditing('note')"
        />
        <p v-else class="text-gray-700 whitespace-pre-wrap">{{ order.note || '—' }}</p>
      </div>

      <div class="border-t border-gray-200 pt-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('orders.images') }}</h2>
            <p class="mt-1 text-sm text-gray-500">
              {{ $t('orders.imageRules', { size: ORDER_IMAGE_MAX_SIZE_MB, count: ORDER_IMAGE_MAX_FILES }) }}
            </p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {{ (order.images || []).length }}/{{ ORDER_IMAGE_MAX_FILES }}
          </span>
        </div>

        <OrderImageGallery
          :images="order.images || []"
          :allow-delete="canEdit"
          :allow-set-cover="canEdit"
          @delete="deleteExistingImage"
          @make-cover="setCoverImage"
        />

        <div v-if="canEdit" class="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div
            class="rounded-xl border-2 border-dashed p-4 text-center transition-colors"
            :class="isDraggingDetailImages ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white/80'"
            @dragenter.prevent="isDraggingDetailImages = true"
            @dragover.prevent="isDraggingDetailImages = true"
            @dragleave.prevent="isDraggingDetailImages = false"
            @drop="handleDetailImageDrop"
          >
            <p class="text-sm font-semibold text-slate-900">
              {{ isDraggingDetailImages ? $t('orders.dragDropActive') : $t('orders.dragDropTitle') }}
            </p>
            <p class="mt-1 text-xs text-slate-500">
              {{ $t('orders.dragDropSubtitle') }}
            </p>

            <div class="mt-3 flex flex-wrap items-center justify-center gap-2">
              <label class="inline-flex cursor-pointer items-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50">
                <input
                  type="file"
                  multiple
                  :accept="ORDER_IMAGE_ACCEPT_ATTRIBUTE"
                  class="hidden"
                  @change="handleDetailImageSelection"
                />
                {{ $t('orders.addImages') }}
              </label>

              <Button
                v-if="pendingImagePreviews.length"
                variant="secondary"
                type="button"
                :disabled="isUpdatingImages"
                @click="clearPendingImages"
              >
                {{ $t('orders.clearSelectedImages') }}
              </Button>

              <Button
                type="button"
                :loading="isUpdatingImages"
                :disabled="!pendingImagePreviews.length"
                @click="uploadPendingImages"
              >
                {{ $t('orders.uploadImages') }}
              </Button>
            </div>
          </div>

          <p v-if="imageErrorMessage" class="mt-3 text-sm text-red-500">{{ imageErrorMessage }}</p>

          <div v-if="pendingImagePreviews.length" class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            <div
              v-for="(preview, index) in pendingImagePreviews"
              :key="`${preview.file.name}-${preview.url}`"
              class="relative overflow-hidden rounded-xl border border-blue-200 bg-white"
            >
              <img :src="preview.url" :alt="preview.file.name" class="aspect-[4/3] w-full object-cover" />
              <label
                class="absolute right-2 top-2 inline-flex items-center justify-center rounded-md bg-white/95 p-1 shadow-sm"
                :title="pendingCoverIndex === index ? $t('orders.cover') : $t('orders.makeCover')"
                @click.stop
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:outline-none focus:ring-0"
                  :checked="pendingCoverIndex === index"
                  :aria-label="pendingCoverIndex === index ? $t('orders.cover') : $t('orders.makeCover')"
                  @change="makePendingUploadCover(index)"
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
        </div>
      </div>

      <div v-if="canEdit" class="border-t border-gray-200 pt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('orders.changeStatus') }}</h2>
        <div class="flex gap-2 flex-wrap">
          <Button
            v-for="status in availableStatuses"
            :key="status"
            :variant="order.status === status ? 'primary' : 'secondary'"
            :disabled="isUpdatingQuickField"
            @click="updateStatus(status)"
          >
            {{ formatStatus(status) }}
          </Button>
        </div>
      </div>

      <div v-if="canEdit" class="border-t border-gray-200 pt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('orders.priority') }}</h2>
        <div class="flex gap-2 flex-wrap">
          <Button
            v-for="priority in availablePriorities"
            :key="priority"
            :variant="order.priority === priority ? getPriorityButtonVariant(priority) : 'secondary'"
            :disabled="isUpdatingQuickField"
            @click="updatePriority(priority)"
          >
            {{ formatPriority(priority) }}
          </Button>
        </div>
      </div>

      <div class="flex gap-2 justify-end pt-4 border-t border-gray-200">
        <Button variant="secondary" @click="$emit('back')">
          {{ $t('common.back') }}
        </Button>
        <Button v-if="canDelete" variant="danger" @click="$emit('delete')">
          {{ $t('common.delete') }}
        </Button>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <p class="text-gray-600">{{ $t('messages.orderNotFound') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useI18n } from 'vue-i18n'
import { useFormattedDate } from '@/composables/useFormattedDate'
import userService from '@/services/userService'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Alert from '@/components/ui/Alert.vue'
import OrderImageGallery from '@/components/orders/OrderImageGallery.vue'
import {
  ORDER_IMAGE_ACCEPT_ATTRIBUTE,
  ORDER_IMAGE_ALLOWED_MIME_TYPES,
  ORDER_IMAGE_MAX_FILES,
  ORDER_IMAGE_MAX_SIZE_BYTES,
  ORDER_IMAGE_MAX_SIZE_MB,
} from '@/services/orderService'
import type { Order, OrderImage, OrderPriority, UpdateOrderPayload } from '@/services/orderService'

interface Props {
  orderId: number
  order?: Order
  loading?: boolean
  error?: string
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

type EditableField = 'description' | 'note' | 'package_cost' | 'order_cost' | 'responsible_name'

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
})

const emit = defineEmits<{
  'back': []
  'delete': []
}>()

const authStore = useAuthStore()
const orderStore = useOrderStore()
const { t } = useI18n()
const { formatDate } = useFormattedDate()

const isLoading = ref(props.loading)
const isUpdatingQuickField = ref(false)
const savingField = ref<EditableField | null>(null)
const activeField = ref<EditableField | null>(null)
const errorMessage = ref(props.error)
const order = ref(props.order)
const managers = ref<ManagerOption[]>([])
const responsibleInputRef = ref<HTMLInputElement | null>(null)
const packageCostInputRef = ref<HTMLInputElement | null>(null)
const showResponsibleSuggestions = ref(false)
let responsibleSuggestionsTimeout: ReturnType<typeof setTimeout> | null = null

const filteredManagers = computed(() => {
  const selectedResponsible = (draft.value.responsible_name || '').trim().toLowerCase()

  const sortedManagers = [...managers.value].sort((a, b) => {
    const aIsSelected = a.name.trim().toLowerCase() === selectedResponsible
    const bIsSelected = b.name.trim().toLowerCase() === selectedResponsible

    if (aIsSelected !== bIsSelected) {
      return aIsSelected ? -1 : 1
    }

    return a.name.localeCompare(b.name, 'ru')
  })

  if (!selectedResponsible) {
    return sortedManagers
  }

  const matches = sortedManagers.filter((manager) => {
    return manager.name.toLowerCase().includes(selectedResponsible)
      || (manager.real_name ?? '').toLowerCase().includes(selectedResponsible)
  })

  return matches.length > 0 ? matches : sortedManagers
})

const displayResponsibleName = computed(() => order.value?.responsible_name || order.value?.user?.name || '—')
const displayResponsibleRealName = computed(() => {
  if (!order.value) {
    return ''
  }

  return order.value.responsible_user?.real_name
    || order.value.responsibleUser?.real_name
    || (!order.value.responsible_name ? order.value.user?.real_name ?? '' : '')
})
const orderCostInputRef = ref<HTMLInputElement | null>(null)
const descriptionTextareaRef = ref<HTMLTextAreaElement | null>(null)
const noteTextareaRef = ref<HTMLTextAreaElement | null>(null)
const pendingImagePreviews = ref<PendingImagePreview[]>([])
const isUpdatingImages = ref(false)
const imageErrorMessage = ref('')
const isDraggingDetailImages = ref(false)
const pendingCoverIndex = ref<number | null>(null)

const draft = ref<{
  description: string
  note: string
  package_cost: number | null | ''
  order_cost: number | null | ''
  responsible_name: string
}>({
  description: '',
  note: '',
  package_cost: null,
  order_cost: null,
  responsible_name: '',
})

const availableStatuses: Order['status'][] = ['new', 'in_progress', 'completed', 'cancelled']
const availablePriorities: OrderPriority[] = ['low', 'medium', 'high']

watch(() => props.loading, (value) => {
  isLoading.value = value
})

watch(() => props.error, (value) => {
  errorMessage.value = value
})

const syncDraft = (value?: Order) => {
  draft.value = {
    description: value?.description || '',
    note: value?.note || '',
    package_cost: value?.package_cost !== null && value?.package_cost !== undefined ? Number(value.package_cost) : null,
    order_cost: value?.order_cost !== null && value?.order_cost !== undefined ? Number(value.order_cost) : null,
    responsible_name: value?.responsible_name || value?.user?.name || '',
  }
}

watch(() => props.order, (value) => {
  order.value = value
  syncDraft(value)
}, { immediate: true })

const clearPendingImages = () => {
  pendingImagePreviews.value.forEach((preview) => URL.revokeObjectURL(preview.url))
  pendingImagePreviews.value = []
  pendingCoverIndex.value = null
}

const processDetailFiles = (selectedFiles: File[]) => {
  const currentImageCount = (order.value?.images?.length ?? 0) + pendingImagePreviews.value.length

  imageErrorMessage.value = ''

  if (currentImageCount >= ORDER_IMAGE_MAX_FILES) {
    imageErrorMessage.value = t('orders.imageLimitReached', { count: ORDER_IMAGE_MAX_FILES })
    return
  }

  const accepted: PendingImagePreview[] = []

  for (const file of selectedFiles) {
    if (!ORDER_IMAGE_ALLOWED_MIME_TYPES.includes(file.type as typeof ORDER_IMAGE_ALLOWED_MIME_TYPES[number])) {
      imageErrorMessage.value = t('orders.invalidImageFormat')
      continue
    }

    if (file.size > ORDER_IMAGE_MAX_SIZE_BYTES) {
      imageErrorMessage.value = t('orders.imageTooLarge', { size: ORDER_IMAGE_MAX_SIZE_MB })
      continue
    }

    if ((order.value?.images?.length ?? 0) + pendingImagePreviews.value.length + accepted.length >= ORDER_IMAGE_MAX_FILES) {
      imageErrorMessage.value = t('orders.imageLimitReached', { count: ORDER_IMAGE_MAX_FILES })
      break
    }

    accepted.push({
      file,
      url: URL.createObjectURL(file),
    })
  }

  pendingImagePreviews.value = [...pendingImagePreviews.value, ...accepted]
}

const handleDetailImageSelection = (event: Event) => {
  const input = event.target as HTMLInputElement
  processDetailFiles(Array.from(input.files || []))
  input.value = ''
}

const handleDetailImageDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingDetailImages.value = false
  processDetailFiles(Array.from(event.dataTransfer?.files || []))
}

const removePendingImage = (index: number) => {
  const [removed] = pendingImagePreviews.value.splice(index, 1)

  if (removed) {
    URL.revokeObjectURL(removed.url)
  }

  if (pendingCoverIndex.value === index) {
    pendingCoverIndex.value = null
  } else if (pendingCoverIndex.value !== null && pendingCoverIndex.value > index) {
    pendingCoverIndex.value -= 1
  }

  imageErrorMessage.value = ''
}

const makePendingUploadCover = (index: number) => {
  pendingCoverIndex.value = index
}

const uploadPendingImages = async () => {
  if (!order.value || pendingImagePreviews.value.length === 0) {
    return
  }

  isUpdatingImages.value = true

  try {
    const updatedOrder = await orderStore.updateOrder(props.orderId, {
      images: pendingImagePreviews.value.map((preview) => preview.file),
      cover_upload_index: pendingCoverIndex.value ?? undefined,
    })

    order.value = updatedOrder
    syncDraft(updatedOrder)
    clearPendingImages()
    imageErrorMessage.value = ''
    errorMessage.value = ''
  } catch (err: any) {
    imageErrorMessage.value = getFirstErrorMessage(err, t('messages.failedToSaveOrder'))
  } finally {
    isUpdatingImages.value = false
  }
}

const deleteExistingImage = async (image: OrderImage) => {
  if (!order.value) {
    return
  }

  isUpdatingImages.value = true

  try {
    const updatedOrder = await orderStore.updateOrder(props.orderId, {
      deleted_image_ids: [image.id],
    })

    order.value = updatedOrder
    syncDraft(updatedOrder)
    imageErrorMessage.value = ''
    errorMessage.value = ''
  } catch (err: any) {
    imageErrorMessage.value = getFirstErrorMessage(err, t('messages.failedToSaveOrder'))
  } finally {
    isUpdatingImages.value = false
  }
}

const setCoverImage = async (image: OrderImage) => {
  if (!order.value) {
    return
  }

  isUpdatingImages.value = true

  try {
    const updatedOrder = await orderStore.updateOrder(props.orderId, {
      cover_image_id: image.id,
    })

    order.value = updatedOrder
    syncDraft(updatedOrder)
    imageErrorMessage.value = ''
    errorMessage.value = ''
  } catch (err: any) {
    imageErrorMessage.value = getFirstErrorMessage(err, t('messages.failedToSaveOrder'))
  } finally {
    isUpdatingImages.value = false
  }
}

const canEdit = computed(() => {
  if (!order.value) return false
  return authStore.isAdmin || authStore.isManager || order.value.user_id === authStore.user?.id
})

const canAssignResponsible = computed(() => canEdit.value)
const canViewFinancials = computed(() => !authStore.isWorker)
const canDelete = computed(() => authStore.isAdmin)

const normalizeNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? null : numericValue
}

const loadManagers = async () => {
  if (!canAssignResponsible.value || managers.value.length > 0) {
    return
  }

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
    void saveField('responsible_name')
  }, 120)
}

const selectResponsible = (manager: ManagerOption) => {
  draft.value.responsible_name = manager.name
  showResponsibleSuggestions.value = false
}

watch(canAssignResponsible, (value) => {
  if (value) {
    loadManagers()
  }
}, { immediate: true })

const focusActiveField = () => {
  switch (activeField.value) {
    case 'responsible_name':
      responsibleInputRef.value?.focus()
      break
    case 'package_cost':
      packageCostInputRef.value?.focus()
      break
    case 'order_cost':
      orderCostInputRef.value?.focus()
      break
    case 'description':
      descriptionTextareaRef.value?.focus()
      break
    case 'note':
      noteTextareaRef.value?.focus()
      break
  }
}

const startEditing = async (field: EditableField) => {
  if (savingField.value || isUpdatingQuickField.value) {
    return
  }

  if (
    (field === 'responsible_name' && !canAssignResponsible.value) ||
    ((field === 'package_cost' || field === 'order_cost') && !canViewFinancials.value) ||
    (field !== 'responsible_name' && !canEdit.value)
  ) {
    return
  }

  errorMessage.value = ''

  if (field === 'responsible_name') {
    await loadManagers()
  }

  activeField.value = field
  await nextTick()
  focusActiveField()
}

const resetFieldValue = (field: EditableField) => {
  if (!order.value) {
    return
  }

  switch (field) {
    case 'description':
      draft.value.description = order.value.description || ''
      break
    case 'note':
      draft.value.note = order.value.note || ''
      break
    case 'package_cost':
      draft.value.package_cost = order.value.package_cost !== null && order.value.package_cost !== undefined
        ? Number(order.value.package_cost)
        : null
      break
    case 'order_cost':
      draft.value.order_cost = order.value.order_cost !== null && order.value.order_cost !== undefined
        ? Number(order.value.order_cost)
        : null
      break
    case 'responsible_name':
      draft.value.responsible_name = order.value.responsible_name || order.value.user?.name || ''
      break
  }
}

const cancelEditing = (field: EditableField) => {
  resetFieldValue(field)
  if (activeField.value === field) {
    activeField.value = null
  }
  errorMessage.value = ''
}

const hasFieldChanged = (field: EditableField) => {
  if (!order.value) {
    return false
  }

  switch (field) {
    case 'description':
      return draft.value.description.trim() !== (order.value.description || '').trim()
    case 'note':
      return draft.value.note.trim() !== (order.value.note || '').trim()
    case 'package_cost':
      return normalizeNumber(draft.value.package_cost) !== normalizeNumber(order.value.package_cost)
    case 'order_cost':
      return normalizeNumber(draft.value.order_cost) !== normalizeNumber(order.value.order_cost)
    case 'responsible_name':
      return draft.value.responsible_name.trim() !== ((order.value.responsible_name || order.value.user?.name || '').trim())
    default:
      return false
  }
}

const validateField = (field: EditableField) => {
  if (field === 'description' && !draft.value.description.trim()) {
    return t('validation.descriptionRequired')
  }

  if (field === 'responsible_name' && canAssignResponsible.value && !draft.value.responsible_name.trim()) {
    return t('validation.executorRequired')
  }

  if (field === 'package_cost') {
    const packageCost = normalizeNumber(draft.value.package_cost)
    if (packageCost !== null && packageCost < 0) {
      return t('validation.nonNegativeNumber')
    }
  }

  if (field === 'order_cost') {
    const orderCost = normalizeNumber(draft.value.order_cost)
    if (orderCost !== null && orderCost < 0) {
      return t('validation.nonNegativeNumber')
    }
  }

  return ''
}

const buildFieldPayload = (field: EditableField): UpdateOrderPayload => {
  switch (field) {
    case 'description':
      return { description: draft.value.description.trim() }
    case 'note':
      return { note: draft.value.note.trim() || null }
    case 'package_cost':
      return { package_cost: normalizeNumber(draft.value.package_cost) }
    case 'order_cost':
      return { order_cost: normalizeNumber(draft.value.order_cost) }
    case 'responsible_name':
      return { responsible_name: draft.value.responsible_name.trim() }
    default:
      return {}
  }
}

const getFirstErrorMessage = (err: any, fallback: string) => {
  const validationErrors = err?.response?.data?.errors

  if (validationErrors) {
    const firstError = Object.values(validationErrors).flat()[0]
    if (typeof firstError === 'string') {
      return firstError
    }
  }

  return err?.response?.data?.message || err?.message || fallback
}

const saveField = async (field: EditableField) => {
  if (!order.value || activeField.value !== field || savingField.value === field) {
    return
  }

  const validationMessage = validateField(field)
  if (validationMessage) {
    errorMessage.value = validationMessage
    return
  }

  if (!hasFieldChanged(field)) {
    activeField.value = null
    errorMessage.value = ''
    return
  }

  savingField.value = field

  try {
    await orderStore.updateOrder(props.orderId, buildFieldPayload(field))
    errorMessage.value = ''
    activeField.value = null
  } catch (err: any) {
    errorMessage.value = getFirstErrorMessage(err, t('messages.failedToSaveOrder'))
  } finally {
    savingField.value = null
  }
}

const getStatusVariant = (status: string): 'info' | 'warning' | 'success' | 'danger' | 'default' => {
  const variants: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
    new: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  }
  return variants[status] || 'default'
}

const getPriorityVariant = (priority: OrderPriority): 'info' | 'warning' | 'success' | 'danger' | 'default' => {
  const variants: Record<OrderPriority, 'default' | 'warning' | 'danger'> = {
    low: 'default',
    medium: 'warning',
    high: 'danger',
  }
  return variants[priority] || 'default'
}

const getPriorityButtonVariant = (priority: OrderPriority): 'primary' | 'secondary' | 'danger' | 'ghost' => {
  const variants: Record<OrderPriority, 'secondary' | 'primary' | 'danger'> = {
    low: 'secondary',
    medium: 'primary',
    high: 'danger',
  }
  return variants[priority]
}

const formatStatus = (status: string) => {
  const formatted: Record<string, string> = {
    new: t('orders.statuses.new'),
    in_progress: t('orders.statuses.in_progress'),
    completed: t('orders.statuses.completed'),
    cancelled: t('orders.statuses.cancelled'),
  }
  return formatted[status] || status
}

const formatPriority = (priority: OrderPriority) => {
  const formatted: Record<OrderPriority, string> = {
    low: t('orders.priorities.low'),
    medium: t('orders.priorities.medium'),
    high: t('orders.priorities.high'),
  }
  return formatted[priority] || priority
}

const formatCurrency = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '—'
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(numericValue)
}

const updateStatus = async (newStatus: Order['status']) => {
  if (!order.value || order.value.status === newStatus || !canEdit.value) return

  isUpdatingQuickField.value = true
  try {
    await orderStore.updateOrder(props.orderId, { status: newStatus })
    errorMessage.value = ''
  } catch (err: any) {
    errorMessage.value = getFirstErrorMessage(err, t('messages.failedToSaveOrder'))
  } finally {
    isUpdatingQuickField.value = false
  }
}

const updatePriority = async (newPriority: OrderPriority) => {
  if (!order.value || order.value.priority === newPriority || !canEdit.value) return

  isUpdatingQuickField.value = true
  try {
    await orderStore.updateOrder(props.orderId, { priority: newPriority })
    errorMessage.value = ''
  } catch (err: any) {
    errorMessage.value = getFirstErrorMessage(err, t('messages.failedToSaveOrder'))
  } finally {
    isUpdatingQuickField.value = false
  }
}

onBeforeUnmount(() => {
  clearPendingImages()
})
</script>

