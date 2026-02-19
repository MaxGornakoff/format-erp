<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100 border-b border-gray-300">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-4 py-3 text-left font-semibold text-gray-700',
              column.sortable && 'cursor-pointer hover:bg-gray-200 transition-colors'
            ]"
            @click="column.sortable && $emit('sort', column.key)"
          >
            <div class="flex items-center gap-2">
              {{ column.label }}
              <span v-if="column.sortable && sortField === column.key" class="text-gray-500">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </div>
          </th>
          <th v-if="$slots.actions" class="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, idx) in rows"
          :key="idx"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-4 py-3 text-gray-700"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key as keyof typeof row]">
              {{ row[column.key as keyof typeof row] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-4 py-3 text-center">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty State -->
    <div v-if="rows.length === 0" class="text-center py-8 text-gray-500">
      <p>No data available</p>
    </div>
  </div>

  <!-- Pagination -->
  <div v-if="pagination" class="mt-4 flex items-center justify-between">
    <p class="text-sm text-gray-600">
      Page {{ pagination.currentPage }} of {{ pagination.totalPages }} ({{ pagination.total }} total)
    </p>
    <div class="flex gap-2">
      <Button
        variant="secondary"
        size="sm"
        :disabled="pagination.currentPage === 1"
        @click="$emit('prev-page')"
      >
        Previous
      </Button>
      <Button
        variant="secondary"
        size="sm"
        :disabled="pagination.currentPage === pagination.totalPages"
        @click="$emit('next-page')"
      >
        Next
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import Button from './Button.vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
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
}

defineProps<Props>()

defineEmits<{
  'sort': [key: string]
  'next-page': []
  'prev-page': []
}>()
</script>
