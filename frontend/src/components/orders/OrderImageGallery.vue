<template>
  <div>
    <div
      v-if="images.length === 0"
      :class="compact
        ? 'flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400'
        : 'rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500'"
    >
      {{ compact ? '—' : emptyText || $t('orders.noImages') }}
    </div>

    <button
      v-else-if="compact"
      type="button"
      class="group relative flex h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm"
      @click.stop="openLightbox(0)"
    >
      <img
        :src="firstImage?.thumbnail_url || firstImage?.url"
        :alt="firstImage?.original_name || $t('orders.image')"
        class="h-full w-full object-cover transition duration-200 group-hover:scale-105"
        loading="lazy"
      />
      <span
        v-if="images.length > 1"
        class="absolute bottom-1 right-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white"
      >
        +{{ images.length - 1 }}
      </span>
    </button>

    <div v-else class="space-y-3">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <button
            type="button"
            class="block aspect-[4/3] w-full overflow-hidden bg-slate-100"
            @click="openLightbox(index)"
          >
            <img
              :src="image.thumbnail_url || image.url"
              :alt="image.original_name || `${$t('orders.image')} ${index + 1}`"
              class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </button>

          <label
            class="absolute right-2 top-2 inline-flex items-center justify-center rounded-md bg-white/95 p-1 shadow-sm"
            :title="index === 0 ? $t('orders.cover') : $t('orders.makeCover')"
            @click.stop
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:outline-none focus:ring-0 disabled:cursor-default"
              :checked="index === 0"
              :disabled="!allowSetCover"
              :aria-label="index === 0 ? $t('orders.cover') : $t('orders.makeCover')"
              @change="$emit('make-cover', image)"
            />
          </label>

          <div v-if="allowDelete" class="flex items-center justify-end p-2">
            <button
              type="button"
              class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              :title="$t('orders.deleteImage')"
              :aria-label="$t('orders.deleteImage')"
              @click.stop="$emit('delete', image)"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen && activeImage"
          class="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 px-4 py-6"
          @click.self="closeLightbox"
        >
          <button
            type="button"
            class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            :title="$t('common.close')"
            :aria-label="$t('common.close')"
            @click="closeLightbox"
          >
            <svg viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>

          <button
            v-if="images.length > 1"
            type="button"
            class="absolute left-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:left-6"
            :title="$t('common.previous')"
            :aria-label="$t('common.previous')"
            @click.stop="showPrevious"
          >
            <svg viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
              <path d="m12.5 4.5-5 5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div class="flex max-h-full w-full max-w-5xl flex-col items-center gap-4">
            <div class="flex w-full items-center justify-between gap-3 text-white">
              <p class="truncate text-sm font-medium">{{ currentLabel }}</p>
              <p class="shrink-0 text-xs text-slate-300">{{ activeIndex + 1 }} / {{ images.length }}</p>
            </div>

            <img
              :src="activeImage.url"
              :alt="currentLabel"
              class="max-h-[72vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />

            <div v-if="images.length > 1" class="flex max-w-full gap-2 overflow-x-auto pb-1">
              <button
                v-for="(image, index) in images"
                :key="`thumb-${image.id}`"
                type="button"
                class="h-14 w-14 overflow-hidden rounded-lg border-2 transition"
                :class="index === activeIndex ? 'border-blue-400' : 'border-transparent opacity-70 hover:opacity-100'"
                @click.stop="activeIndex = index"
              >
                <img
                  :src="image.thumbnail_url || image.url"
                  :alt="image.original_name || `${$t('orders.image')} ${index + 1}`"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            </div>
          </div>

          <button
            v-if="images.length > 1"
            type="button"
            class="absolute right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:right-6"
            :title="$t('common.next')"
            :aria-label="$t('common.next')"
            @click.stop="showNext"
          >
            <svg viewBox="0 0 20 20" fill="none" class="h-5 w-5" aria-hidden="true">
              <path d="m7.5 4.5 5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { OrderImage } from '@/services/orderService'

interface Props {
  images: OrderImage[]
  compact?: boolean
  allowDelete?: boolean
  allowSetCover?: boolean
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  allowDelete: false,
  allowSetCover: false,
  emptyText: '',
})

defineEmits<{
  delete: [image: OrderImage]
  'make-cover': [image: OrderImage]
}>()

const isOpen = ref(false)
const activeIndex = ref(0)

const firstImage = computed(() => props.images[0] ?? null)
const activeImage = computed(() => props.images[activeIndex.value] ?? null)
const currentLabel = computed(() => activeImage.value?.original_name || `Image ${activeIndex.value + 1}`)

const openLightbox = (index: number) => {
  activeIndex.value = index
  isOpen.value = true
}

const closeLightbox = () => {
  isOpen.value = false
}

const showPrevious = () => {
  activeIndex.value = activeIndex.value === 0 ? props.images.length - 1 : activeIndex.value - 1
}

const showNext = () => {
  activeIndex.value = activeIndex.value === props.images.length - 1 ? 0 : activeIndex.value + 1
}

watch(
  () => props.images.length,
  (length) => {
    if (length === 0) {
      isOpen.value = false
      activeIndex.value = 0
      return
    }

    if (activeIndex.value > length - 1) {
      activeIndex.value = length - 1
    }
  },
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
