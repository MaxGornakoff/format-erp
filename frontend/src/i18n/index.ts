import { createI18n } from 'vue-i18n'
import { en } from '../locales/en'
import { ru } from '../locales/ru'

export type MessageSchema = typeof en

export const i18n = createI18n<{ message: MessageSchema }, 'en' | 'ru'>({
  legacy: false,
  locale: localStorage.getItem('language') || 'ru',
  fallbackLocale: 'ru',
  messages: {
    en,
    ru
  }
})

export function setLanguage(locale: 'en' | 'ru') {
  if (i18n.global.locale) {
    i18n.global.locale.value = locale
    localStorage.setItem('language', locale)
  }
}

export function getLanguage(): 'en' | 'ru' {
  return (i18n.global.locale?.value as 'en' | 'ru') || 'en'
}
