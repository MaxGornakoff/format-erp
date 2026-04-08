<template>
  <div class="overflow-x-auto bg-white rounded-lg">
    <table class="w-full min-w-max border-collapse">
      <thead>
        <tr class="bg-[#3b82f6] border-b border-gray-300">
          <th
            v-for="column in displayedColumns"
            :key="column.key"
            :draggable="isColumnDraggable(column)"
            :class="[
              'px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap select-none',
              column.sortable && 'hover:bg-[#2563eb] transition-colors',
              isColumnDraggable(column) && 'cursor-grab active:cursor-grabbing',
              dragOverColumnKey === column.key && 'bg-[#2563eb]',
              draggedColumnKey === column.key && 'opacity-80'
            ]"
            @click="handleHeaderClick(column)"
            @dragstart="handleDragStart($event, column)"
            @dragover.prevent="handleDragOver($event, column)"
            @dragleave="handleDragLeave(column)"
            @drop="handleDrop($event, column)"
            @dragend="handleDragEnd"
          >
            <div class="flex items-center gap-2 text-[14px] text-white">
              <svg
                v-if="isColumnDraggable(column)"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-3.5 w-3.5 shrink-0 text-blue-100/90"
                aria-hidden="true"
              >
                <circle cx="6" cy="5.5" r="1.1" />
                <circle cx="6" cy="10" r="1.1" />
                <circle cx="6" cy="14.5" r="1.1" />
                <circle cx="11.5" cy="5.5" r="1.1" />
                <circle cx="11.5" cy="10" r="1.1" />
                <circle cx="11.5" cy="14.5" r="1.1" />
              </svg>

              <span>{{ column.label }}</span>

              <span v-if="column.sortable && sortField === column.key" class="text-white">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </div>
          </th>
          <th v-if="$slots.actions" class="px-4 py-3 text-center font-semibold text-white text-[14px]">
            {{ $t('common.actions') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, idx) in rows"
          :key="idx"
          :class="[
            'border-b border-gray-200 hover:bg-gray-50 transition-colors',
            clickableRows && 'cursor-pointer'
          ]"
          @click="clickableRows && $emit('row-click', row)"
        >
          <td
            v-for="column in displayedColumns"
            :key="column.key"
            class="px-4 py-3 text-gray-700 align-middle text-[14px]"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key as keyof typeof row]">
              {{ row[column.key as keyof typeof row] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-4 py-3 text-center" @click.stop>
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="rows.length === 0" class="text-center py-8 text-gray-500">
      <p>{{ $t('common.noData') }}</p>
    </div>
  </div>

  <div v-if="pagination" class="mt-4 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3 flex-wrap">
      <p class="text-sm text-gray-600">
        {{ $t('common.page') }} {{ pagination.currentPage }} {{ $t('common.of') }} {{ pagination.totalPages }} ({{ pagination.total }} {{ $t('common.total') }})
      </p>

      <Button
        v-if="reorderableColumns && canResetColumns"
        variant="ghost"
        size="sm"
        @click="resetColumnOrder"
      >
        {{ $t('common.resetColumns') }}
      </Button>
    </div>

    <div class="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        :disabled="pagination.currentPage === 1"
        @click="$emit('prev-page')"
      >
        {{ $t('common.previous') }}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        :disabled="pagination.currentPage === pagination.totalPages"
        @click="$emit('next-page')"
      >
        {{ $t('common.next') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from './Button.vue'

const { t: $t } = useI18n()

interface Column {
  key: string
  label: string
  sortable?: boolean
  reorderable?: boolean
}

interface Pagination {
  currentPage: number
  totalPages: number
  total: number
}

interface Props {
  columns: Column[]
  rows: T[]
  pagination?: Pagination
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  clickableRows?: boolean
  reorderableColumns?: boolean
  columnOrderKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  clickableRows: false,
  reorderableColumns: false,
  columnOrderKey: '',
})

const emit = defineEmits<{
  'sort': [key: string]
  'next-page': []
  'prev-page': []
  'row-click': [row: T]
  'columns-reordered': [keys: string[]]
}>()

const displayedColumns = ref<Column[]>([])
const draggedColumnKey = ref<string | null>(null)
const dragOverColumnKey = ref<string | null>(null)
const suppressNextSortClick = ref(false)

const defaultColumnKeys = computed(() => props.columns.map((column) => column.key))
const canResetColumns = computed(() => {
  if (!props.reorderableColumns) {
    return false
  }

  const currentKeys = displayedColumns.value.map((column) => column.key)
  return currentKeys.join('|') !== defaultColumnKeys.value.join('|')
})

const getStorageKey = () => props.columnOrderKey ? `format-erp:table-columns:${props.columnOrderKey}` : ''

const readSavedOrder = () => {
  if (typeof window === 'undefined' || !props.columnOrderKey) {
    return [] as string[]
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey())
    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue)
    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

const persistColumnOrder = (keys: string[]) => {
  if (typeof window === 'undefined' || !props.columnOrderKey) {
    return
  }

  window.localStorage.setItem(getStorageKey(), JSON.stringify(keys))
}

const clearPersistedColumnOrder = () => {
  if (typeof window === 'undefined' || !props.columnOrderKey) {
    return
  }

  window.localStorage.removeItem(getStorageKey())
}

const buildDisplayedColumns = (columns: Column[]) => {
  const normalizedColumns = [...columns]

  if (!props.reorderableColumns) {
    return normalizedColumns
  }

  const savedOrder = readSavedOrder()
  if (savedOrder.length === 0) {
    return normalizedColumns
  }

  const columnMap = new Map(normalizedColumns.map((column) => [column.key, column]))
  const orderedColumns = savedOrder
    .map((key) => columnMap.get(key))
    .filter((column): column is Column => Boolean(column))

  const missingColumns = normalizedColumns.filter(
    (column) => !savedOrder.includes(column.key),
  )

  return [...orderedColumns, ...missingColumns]
}

watch(
  () => ({
    columns: props.columns,
    reorderableColumns: props.reorderableColumns,
    columnOrderKey: props.columnOrderKey,
  }),
  ({ columns }) => {
    displayedColumns.value = buildDisplayedColumns(columns)
  },
  { immediate: true, deep: true },
)

const isColumnDraggable = (column: Column) => {
  return props.reorderableColumns && column.reorderable !== false
}

const handleHeaderClick = (column: Column) => {
  if (suppressNextSortClick.value) {
    suppressNextSortClick.value = false
    return
  }

  if (column.sortable) {
    emit('sort', column.key)
  }
}

const handleDragStart = (event: DragEvent, column: Column) => {
  if (!isColumnDraggable(column)) {
    return
  }

  draggedColumnKey.value = column.key
  event.dataTransfer?.setData('text/plain', column.key)

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragOver = (event: DragEvent, column: Column) => {
  if (!draggedColumnKey.value || !isColumnDraggable(column)) {
    return
  }

  event.preventDefault()
  dragOverColumnKey.value = column.key
}

const handleDragLeave = (column: Column) => {
  if (dragOverColumnKey.value === column.key) {
    dragOverColumnKey.value = null
  }
}

const handleDrop = (event: DragEvent, targetColumn: Column) => {
  if (!draggedColumnKey.value || !isColumnDraggable(targetColumn)) {
    return
  }

  event.preventDefault()

  const sourceIndex = displayedColumns.value.findIndex((column) => column.key === draggedColumnKey.value)
  const targetIndex = displayedColumns.value.findIndex((column) => column.key === targetColumn.key)

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    handleDragEnd()
    return
  }

  const updatedColumns = [...displayedColumns.value]
  const [movedColumn] = updatedColumns.splice(sourceIndex, 1)

  if (!movedColumn) {
    handleDragEnd()
    return
  }

  updatedColumns.splice(targetIndex, 0, movedColumn)

  displayedColumns.value = updatedColumns
  persistColumnOrder(updatedColumns.map((column) => column.key))
  emit('columns-reordered', updatedColumns.map((column) => column.key))
  suppressNextSortClick.value = true
  handleDragEnd()
}

const handleDragEnd = () => {
  draggedColumnKey.value = null
  dragOverColumnKey.value = null
}

const resetColumnOrder = () => {
  displayedColumns.value = [...props.columns]
  clearPersistedColumnOrder()
  emit('columns-reordered', displayedColumns.value.map((column) => column.key))
  handleDragEnd()
}
</script>
