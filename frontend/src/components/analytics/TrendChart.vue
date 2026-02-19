<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ title }}</h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">Loading chart data...</p>
    </div>

    <!-- Chart (Simple Bar Chart) -->
    <div v-else-if="data && data.length > 0" class="space-y-4">
      <div v-for="item in data" :key="item.label" class="flex items-center gap-3">
        <div class="w-24 text-sm text-gray-600">{{ item.label }}</div>
        <div class="flex-1 bg-gray-200 rounded-full h-8">
          <div
            :style="{ width: `${(item.value / maxValue) * 100}%` }"
            class="bg-blue-500 h-8 rounded-full flex items-center justify-end pr-3"
          >
            <span class="text-xs font-semibold text-white">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-gray-500">
      <p>No data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ChartData {
  label: string
  value: number
}

interface Props {
  title: string
  data?: ChartData[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const maxValue = computed(() => {
  if (!props.data || props.data.length === 0) return 1
  return Math.max(...props.data.map(d => d.value))
})
</script>
