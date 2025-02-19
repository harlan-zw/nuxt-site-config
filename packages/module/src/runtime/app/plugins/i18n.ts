import { useNuxtApp, useRequestEvent } from '#app'
import { defineNuxtPlugin } from 'nuxt/app'
import { parseURL } from 'ufo'
import { computed, toValue, watch } from 'vue'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:i18n',
  // @ts-expect-error untyped
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n
    if (!i18n)
      return
    const stack = import.meta.server ? useRequestEvent()?.context.siteConfig : useNuxtApp().$nuxtSiteConfig
    // @ts-expect-error untyped
    const i18nBaseUrl = toValue(i18n.baseUrl)
    if (i18nBaseUrl) {
      const siteConfig = stack!.get({ resolveRefs: true })
      const currentUrl = siteConfig.url
      if (currentUrl && !currentUrl.includes('localhost')) {
        const i18nURL = parseURL(i18nBaseUrl, 'https://')
        const siteConfigURL = parseURL(currentUrl, 'https://')
        // if host matches ignore
        if (i18nURL.host !== siteConfigURL.host) {
          if (siteConfig.env === 'production') {
            console.error(`[Nuxt Site Config] Your I18n baseUrl \`${i18nURL.host}\` doesn't match your site url ${siteConfigURL.host}. This will cause production SEO issues. Either provide a matching baseUrl or remove the site url config.`)
          }
        }
      }
    }

    let siteConfigEntry: (() => void) | undefined
    watch(i18n.locale, () => {
      // remove last entry
      if (siteConfigEntry) {
        siteConfigEntry()
      }
      siteConfigEntry = stack!.push({
        _priority: import.meta.server ? -2 : -1,
        _context: '@nuxtjs/i18n',
        // @ts-expect-error untyped
        url: i18n.baseUrl,
        // @ts-expect-error untyped
        defaultLocale: i18n.defaultLocale,
        // @ts-expect-error untyped
        currentLocale: i18n.locale,
        // @ts-expect-error untyped
        description: computed(() => i18n.te('nuxtSiteConfig.description') ? i18n.t('nuxtSiteConfig.description') : undefined),
        // @ts-expect-error untyped
        name: computed(() => i18n.te('nuxtSiteConfig.name') ? i18n.t('nuxtSiteConfig.name') : undefined),
      })
    }, {
      immediate: true,
    })
  },
})
