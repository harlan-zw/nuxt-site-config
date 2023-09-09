import type { Ref } from 'vue'
import { defineNuxtPlugin, ref, updateSiteConfig, useSiteConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:i18n',
  enforce: 1, // needs to come after i18n
  setup(nuxtApp) {
    const i18n = (nuxtApp.$i18n || { locale: ref(useSiteConfig().defaultLocale) }) as { locale: Ref<string> }
    updateSiteConfig({
      _context: '@nuxtjs/i18n',
      currentLocale: i18n.locale,
    })
  },
})
