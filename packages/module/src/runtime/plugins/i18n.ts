import { computed, defineNuxtPlugin, updateSiteConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:i18n',
  // @ts-expect-error todo fix upstream
  enforce: 1, // needs to come after i18n
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n
    if (!i18n)
      return
    updateSiteConfig({
      _context: '@nuxtjs/i18n',
      url: i18n.baseUrl.value,
      currentLocale: i18n.locale,
      description: computed(() => i18n.t('nuxtSiteConfig.description')),
      name: computed(() => i18n.t('nuxtSiteConfig.name')),
    })
  },
})
