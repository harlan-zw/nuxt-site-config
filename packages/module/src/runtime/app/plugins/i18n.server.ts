import { defineNuxtPlugin } from 'nuxt/app'
import { parseURL } from 'ufo'
import { computed, toValue } from 'vue'
import { updateSiteConfig } from '../composables/updateSiteConfig'
import { useSiteConfig } from '../composables/useSiteConfig'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:i18n',
  // @ts-expect-error untyped
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n
    if (!i18n)
      return
    const siteConfig = useSiteConfig()
    const currentUrl = siteConfig.url
    // @ts-expect-error untyped
    const i18nBaseUrl = toValue(i18n.baseUrl)
    // set baseURL to currentUrl if it's not set
    if (!i18nBaseUrl && currentUrl) {
      // @ts-expect-error untyped
      i18n.baseUrl.value = currentUrl
    }
    // set site config url if not set (and base url set)
    else if (i18nBaseUrl && (!currentUrl || currentUrl.includes('localhost'))) {
      // update site config
      updateSiteConfig({
        _priority: -1,
        _context: '@nuxtjs/i18n',
        url: i18nBaseUrl,
      })
    }
    // if both set check for conflict
    else if (i18nBaseUrl && currentUrl && !currentUrl.includes('localhost')) {
      const i18nURL = parseURL(i18nBaseUrl, 'https://')
      const siteConfigURL = parseURL(currentUrl, 'https://')
      // if host matches ignore
      if (i18nURL.host !== siteConfigURL.host) {
        if (siteConfig.env === 'production') {
          console.error(`[Nuxt Site Config] Your I18n baseUrl \`${i18nURL.host}\` doesn't match your site url ${siteConfigURL.host}. This will cause production SEO issues. Either provide a matching baseUrl or remove the site url config.`)
        }
      }
    }

    updateSiteConfig({
      _priority: -1,
      _context: '@nuxtjs/i18n',
      url: i18nBaseUrl || undefined,
      // @ts-expect-error untyped
      defaultLocale: i18n.defaultLocale,
      // @ts-expect-error untyped
      currentLocale: i18n.locale,
      // @ts-expect-error untyped
      description: computed(() => i18n.te('nuxtSiteConfig.description') ? i18n.t('nuxtSiteConfig.description') : undefined),
      // @ts-expect-error untyped
      name: computed(() => i18n.te('nuxtSiteConfig.name') ? i18n.t('nuxtSiteConfig.name') : undefined),
    })
  },
})
