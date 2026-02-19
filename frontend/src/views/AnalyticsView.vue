<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">{{ $t('analytics.title') }}</h1>
      <p class="text-gray-600 mt-2">{{ $t('analytics.description') }}</p>
    </div>

    <!-- Main Stats Panel -->
    <StatsPanel />

    <!-- Trends Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Orders Trend -->
      <TrendChart
        :title="$t('analytics.ordersTrend')"
        :data="ordersTrendData"
        :is-loading="isLoadingTrend"
      />

      <!-- Role Statistics -->
      <TrendChart
        :title="$t('analytics.usersByRole')"
        :data="roleStatsData"
        :is-loading="isLoadingRoleStats"
      />
    </div>

    <!-- Refresh Button -->
    <div class="flex justify-end">
      <Button @click="refreshData" :loading="isRefreshing">
        {{ $t('analytics.refreshData') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import StatsPanel from '@/components/analytics/StatsPanel.vue'
import TrendChart from '@/components/analytics/TrendChart.vue'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()
const isLoadingTrend = ref(false)
const isLoadingRoleStats = ref(false)
const isRefreshing = ref(false)
const ordersTrendData = ref<any[]>([])
const roleStatsData = ref<any[]>([])

const loadTrendData = async () => {
  isLoadingTrend.value = true
  try {
    // TODO: Fetch orders trend
    // const response = await analyticsService.ordersTrend()
    // ordersTrendData.value = response.data
  } finally {
    isLoadingTrend.value = false
  }
}

const loadRoleStats = async () => {
  isLoadingRoleStats.value = true
  try {
    // TODO: Fetch role statistics
    // const response = await analyticsService.roleStats()
    // roleStatsData.value = response.data
  } finally {
    isLoadingRoleStats.value = false
  }
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([loadTrendData(), loadRoleStats()])
  } finally {
    isRefreshing.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>
