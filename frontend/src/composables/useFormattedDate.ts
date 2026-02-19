import { useI18n } from 'vue-i18n'

export const useFormattedDate = () => {
  const { locale } = useI18n()

  /**
   * Format date to locale string with timezone offset (GMT+3)
   * @param dateString - ISO date string like "2026-02-15T10:00:00Z"
   * @param format - 'short' for "15 фев", 'full' for "15 февраля 2026, 13:00"
   * @returns Formatted date string
   */
  const formatDate = (dateString: string, format: 'short' | 'full' = 'short'): string => {
    if (!dateString) return ''

    try {
      const date = new Date(dateString)
      
      // Apply GMT+3 timezone offset (3 hours = 10800000 milliseconds)
      const gmtPlus3 = new Date(date.getTime() + 3 * 60 * 60 * 1000)

      if (format === 'short') {
        // Format: "15 фев" or "Feb 15"
        return formatShortDate(gmtPlus3)
      } else {
        // Format: "15 февраля 2026, 13:00" or "February 15, 2026, 1:00 PM"
        return formatFullDate(gmtPlus3)
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  /**
   * Format date as short format (e.g., "15 фев" or "Feb 15")
   */
  const formatShortDate = (date: Date): string => {
    const months = {
      ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }

    const day = date.getDate()
    const month = months[locale.value as keyof typeof months][date.getMonth()]

    if (locale.value === 'ru') {
      return `${day} ${month}`
    } else {
      return `${month} ${day}`
    }
  }

  /**
   * Format date as full format with time
   */
  const formatFullDate = (date: Date): string => {
    const monthsRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']

    const day = date.getDate()
    const month = locale.value === 'ru' 
      ? monthsRu[date.getMonth()] 
      : monthsEn[date.getMonth()]
    const year = date.getFullYear()
    
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    if (locale.value === 'ru') {
      return `${day} ${month} ${year}, ${hours}:${minutes}`
    } else {
      return `${month} ${day}, ${year}, ${hours}:${minutes}`
    }
  }

  /**
   * Format date as table cell (short format for better table display)
   * Returns just the date without time for compact display
   */
  const formatTableDate = (dateString: string): string => {
    return formatDate(dateString, 'short')
  }

  return {
    formatDate,
    formatShortDate: () => formatShortDate,
    formatFullDate: () => formatFullDate,
    formatTableDate
  }
}
