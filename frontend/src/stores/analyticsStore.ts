import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAnalyticsStore = defineStore('analytics', () => {
  const refreshToken = ref(0)
  const lastReason = ref<string | null>(null)

  const invalidateAnalytics = (reason: string = 'data-changed') => {
    lastReason.value = reason
    refreshToken.value += 1
  }

  return {
    refreshToken,
    lastReason,
    invalidateAnalytics,
  }
})
