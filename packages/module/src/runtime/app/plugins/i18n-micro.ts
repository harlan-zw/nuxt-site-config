import { defineNuxtPlugin, useNuxtApp, useRequestEvent, useRuntimeConfig } from '#app'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:i18n',
  // @ts-expect-error untyped
  dependsOn: ['i18n-plugin-loader'],
  setup(nuxtApp) {
    const { $getLocale, $getLocales, $ts } = nuxtApp
    const runtimeConfig = useRuntimeConfig()
    // @ts-expect-error untyped
    const locale = $getLocale()
    // @ts-expect-error untyped
    const locales = $getLocales()
    // @ts-expect-error untyped
    const defaultLocale = runtimeConfig.public.i18nConfig?.defaultLocale
    // @ts-expect-error untyped
    const localeDefinition = locales.find(l => l.code === locale) || locales.find(l => l.code === defaultLocale)
    const stack = import.meta.server ? useRequestEvent()?.context.siteConfig : useNuxtApp().$nuxtSiteConfig
    stack!.push({
      _priority: import.meta.server ? -2 : -1,
      _context: 'nuxt-i18n-micro',
      currentLocale: localeDefinition.language || localeDefinition.iso || locale,
      // @ts-expect-error untyped
      description: $ts('nuxtSiteConfig.description', {}, ''),
      // @ts-expect-error untyped
      name: $ts('nuxtSiteConfig.name', {}, ''),
    })
  },
})
