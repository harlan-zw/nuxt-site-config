import { parseURL } from 'ufo'
import { computed, useSiteConfig, defineNuxtPlugin, updateSiteConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:i18n',
  enforce: 1, // needs to come after i18n
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n
    if (!i18n)
      return
    const currentUrl = useSiteConfig().url
    let i18nBaseUrl: false | string = false
    try {
      const url = parseURL(i18n.baseUrl.value)
      if (import.meta.dev && url.host) {
        if (url.host.includes('localhost'))
          console.warn(`[Nuxt Site Config] You have set an i18n baseUrl to \`${url.host}\`. This will not work in production. Please set a proper baseUrl in your i18n config.`)
        else if (!currentUrl.includes(url.host))
          console.warn(`[Nuxt Site Config] Your i18n baseUrl \`${url}\` doesn't match your site url. This can lead to unexpected behavior. Please set a matching baseUrl in your i18n config.`)
        else
          i18nBaseUrl = url.host
      }
    }
    catch {}
    updateSiteConfig({
      _context: '@nuxtjs/i18n',
      url: i18nBaseUrl || undefined,
      currentLocale: i18n.locale,
      description: computed(() => i18n.te('nuxtSiteConfig.description') ? i18n.t('nuxtSiteConfig.description') : undefined),
      name: computed(() => i18n.te('nuxtSiteConfig.name') ? i18n.t('nuxtSiteConfig.name') : undefined),
    })
  },
})
