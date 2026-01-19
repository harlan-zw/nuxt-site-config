import { defineNuxtPlugin, useNuxtApp, useRequestEvent } from '#app'
// @ts-expect-error untyped
import { i18nPluginDeps } from '#build/nuxt-site-config/i18n-plugin-deps.mjs'
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
    const i18nBaseUrl = toValue((i18n as any).baseUrl)
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

    // create computed values once (not inside watch to avoid accumulating Vue effects)
    const defaultLocale = computed(() => {
      const locale = toValue((i18n as any).locales).find((l: any) => l.code === (i18n as any).defaultLocale)
      return locale?.language || locale?.iso || (i18n as any).defaultLocale
    })
    const i18nUrl = computed(() => {
      const url = toValue((i18n as any).baseUrl)
      return url || undefined
    })
    const currentLocale = computed(() => {
      const properties = toValue((i18n as any).localeProperties)
      if (properties.language)
        return properties.language
      return defaultLocale.value
    })
    const description = computed(() => (i18n as any).te('nuxtSiteConfig.description') ? (i18n as any).t('nuxtSiteConfig.description') : undefined)
    const name = computed(() => (i18n as any).te('nuxtSiteConfig.name') ? (i18n as any).t('nuxtSiteConfig.name') : undefined)

    // on server: push once, no need for watch (locale won't change during SSR)
    if (import.meta.server) {
      stack!.push({
        _priority: -2,
        _context: '@nuxtjs/i18n',
        url: i18nUrl,
        defaultLocale,
        currentLocale,
        description,
        name,
      })
      return
    }

    // on client: use watch for locale changes
    let siteConfigEntry: (() => void) | undefined
    watch((i18n as any).locale, () => {
      if (siteConfigEntry)
        siteConfigEntry()
      siteConfigEntry = stack!.push({
        _priority: -1,
        _context: '@nuxtjs/i18n',
        url: i18nUrl,
        defaultLocale,
        currentLocale,
        description,
        name,
      })
    }, {
      immediate: true,
    })
  },
})
