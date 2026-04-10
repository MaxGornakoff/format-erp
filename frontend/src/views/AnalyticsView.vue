<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">{{ $t('analytics.title') }}</h1>
      
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
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import analyticsService from '@/services/analyticsService'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import StatsPanel from '@/components/analytics/StatsPanel.vue'
import TrendChart from '@/components/analytics/TrendChart.vue'
import Button from '@/components/ui/Button.vue'

interface ChartPoint {
  label: string
  value: number
}

const { t } = useI18n()
const analyticsStore = useAnalyticsStore()
const isLoadingTrend = ref(false)
const isLoadingRoleStats = ref(false)
const isRefreshing = ref(false)
const ordersTrendData = ref<ChartPoint[]>([])
const roleStatsData = ref<ChartPoint[]>([])

const loadTrendData = async () => {
  isLoadingTrend.value = true
  try {
    const response = await analyticsService.ordersTrend()
    ordersTrendData.value = response.data.map((item) => ({
      label: item.date,
      value: item.count,
    }))
  } catch (err) {
    console.error('Failed to load trend data:', err)
    ordersTrendData.value = []
  } finally {
    isLoadingTrend.value = false
  }
}

const loadRoleStats = async () => {
  isLoadingRoleStats.value = true
  try {
    const response = await analyticsService.roleStats()
    roleStatsData.value = [
      { label: t('users.roles.admin'), value: response.admins },
      { label: t('users.roles.manager'), value: response.managers },
      { label: t('users.roles.worker'), value: response.workers },
    ]
  } catch (err) {
    console.error('Failed to load role stats:', err)
    roleStatsData.value = []
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

watch(
  () => analyticsStore.refreshToken,
  () => {
    refreshData()
  }
)

onMounted(() => {
  refreshData()
})
</script>
