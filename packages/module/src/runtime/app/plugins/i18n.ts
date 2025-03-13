import { useNuxtApp, useRequestEvent } from '#app'
// @ts-expect-error untyped
import { i18nPluginDeps } from '#build/nuxt-site-config/i18n-plugin-deps.mjs'
import { defineNuxtPlugin } from 'nuxt/app'
import { parseURL } from 'ufo'
import { computed, toValue, watch } from 'vue'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:i18n',
  dependsOn: i18nPluginDeps,
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
    // @ts-expect-error untyped
    watch(i18n.locale, () => {
      // remove last entry
      if (siteConfigEntry) {
        siteConfigEntry()
      }
      const defaultLocale = computed(() => {
        // @ts-expect-error untyped
        const locale = toValue(i18n.locales).find(l => l.code === i18n.defaultLocale)
        // @ts-expect-error untyped
        return locale?.language || locale?.iso || i18n.defaultLocale
      })
      siteConfigEntry = stack!.push({
        _priority: import.meta.server ? -2 : -1,
        _context: '@nuxtjs/i18n',
        url: computed(() => {
          // @ts-expect-error untyped
          const url = toValue(i18n.baseUrl)
          // explicit undefined result as i18n will provide a '' baseUrl
          return url || undefined
        }),
        defaultLocale,
        currentLocale: computed(() => {
          // @ts-expect-error untyped
          const properties = toValue(i18n.localeProperties)
          if (properties.language) {
            return properties.language
          }
          return defaultLocale.value
        }),
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
