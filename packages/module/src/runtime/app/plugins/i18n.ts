import { defineNuxtPlugin } from '#app'
// @ts-expect-error untyped
import { i18nPluginDeps } from '#build/nuxt-site-config/i18n-plugin-deps.mjs'
import { SiteConfigPriority } from 'site-config-stack'
import { parseURL } from 'ufo'
import { computed, toValue, watch } from 'vue'
import { getSiteConfigStack } from './i18n-shared'

function resolveDefaultLocale(i18n: any): string | undefined {
  const locale = toValue(i18n.locales).find((l: any) => l.code === i18n.defaultLocale)
  return locale?.language || locale?.iso || i18n.defaultLocale
}

function resolveI18nUrl(i18n: any): string | undefined {
  return toValue(i18n.baseUrl) || undefined
}

function resolveCurrentLocale(i18n: any): string | undefined {
  const properties = toValue(i18n.localeProperties)
  if (properties.language)
    return properties.language
  return resolveDefaultLocale(i18n)
}

function resolveDescription(i18n: any): string | undefined {
  return i18n.te('nuxtSiteConfig.description') ? i18n.t('nuxtSiteConfig.description') : undefined
}

function resolveName(i18n: any): string | undefined {
  return i18n.te('nuxtSiteConfig.name') ? i18n.t('nuxtSiteConfig.name') : undefined
}

export default defineNuxtPlugin({
  name: 'nuxt-site-config:i18n',
  dependsOn: i18nPluginDeps,
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n
    if (!i18n)
      return
    const stack = getSiteConfigStack()
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

    // On SSR, the locale is fixed for the request. Push plain values instead of
    // computed refs to avoid retaining Vue effect scopes on the H3 event context.
    // Computed refs capture closures over the i18n instance (which references nuxtApp),
    // preventing GC of the entire nuxtApp and its payload after rendering.
    if (import.meta.server) {
      stack!.push({
        _priority: SiteConfigPriority.i18n,
        _context: '@nuxtjs/i18n',
        url: resolveI18nUrl(i18n),
        defaultLocale: resolveDefaultLocale(i18n),
        currentLocale: resolveCurrentLocale(i18n),
        description: resolveDescription(i18n),
        name: resolveName(i18n),
      })
      return
    }

    // On client: use computed + watch for reactive locale changes
    const defaultLocale = computed(() => resolveDefaultLocale(i18n))
    const i18nUrl = computed(() => resolveI18nUrl(i18n))
    const currentLocale = computed(() => resolveCurrentLocale(i18n))
    const description = computed(() => resolveDescription(i18n))
    const name = computed(() => resolveName(i18n))

    let siteConfigEntry: (() => void) | undefined
    watch((i18n as any).locale, () => {
      if (siteConfigEntry)
        siteConfigEntry()
      siteConfigEntry = stack!.push({
        _priority: SiteConfigPriority.build,
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
