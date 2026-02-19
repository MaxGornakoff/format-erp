<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">{{ $t('messages.loadingStatistics') }}</p>
    </div>

    <!-- Error State -->
    <Alert
      v-else-if="error"
      type="error"
      :title="$t('common.error')"
      :message="error"
    />

    <!-- Stats Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <!-- Total Orders -->
      <StatCard
        :title="$t('analytics.totalOrders')"
        :value="stats?.total_orders || 0"
        icon="📊"
        color="blue"
      />

      <!-- New Orders -->
      <StatCard
        :title="$t('analytics.newOrders')"
        :value="stats?.new_orders || 0"
        icon="📝"
        color="blue"
      />

      <!-- In Progress -->
      <StatCard
        :title="$t('analytics.inProgress')"
        :value="stats?.in_progress_orders || 0"
        icon="⏳"
        color="yellow"
      />

      <!-- Completed -->
      <StatCard
        :title="$t('analytics.completed')"
        :value="stats?.completed_orders || 0"
        icon="✅"
        color="green"
      />
    </div>

    <!-- Top Workers -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('analytics.topWorkers') }}</h2>
      <div v-if="topWorkers && topWorkers.length > 0" class="space-y-3">
        <div v-for="(worker, idx) in topWorkers" :key="idx" class="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0">
          <div>
            <p class="font-medium text-gray-900">{{ worker.name }}</p>
            <p class="text-sm text-gray-500">{{ worker.email }}</p>
          </div>
          <Badge variant="success">
            {{ worker.completed_count }} {{ $t('analytics.completedCount') }}
          </Badge>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-4">
        {{ $t('analytics.noWorkerData') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import StatCard from './StatCard.vue'
import Badge from '@/components/ui/Badge.vue'
import Alert from '@/components/ui/Alert.vue'

interface Stats {
  total_orders: number
  new_orders: number
  in_progress_orders: number
  completed_orders: number
  cancelled_orders: number
}

interface Worker {
  name: string
  email: string
  completed_count: number
}

const { t } = useI18n()
const isLoading = ref(false)
const error = ref('')
const stats = ref<Stats | null>(null)
const topWorkers = ref<Worker[]>([])

const loadStatistics = async () => {
  isLoading.value = true
  try {
    // TODO: Fetch dashboard data
    // const response = await analyticsService.dashboard()
    error.value = ''
    // stats.value = response.stats
    // topWorkers.value = response.topWorkers
  } catch (err: any) {
    error.value = err.message || t('messages.failedToLoadStatistics')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

