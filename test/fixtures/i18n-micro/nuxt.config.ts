import { resolve } from 'node:path'
import NuxtSiteConfig from '../../../packages/module/src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSiteConfig,
    'nuxt-i18n-micro',
  ],
  site: {
    url: 'https://nuxtseo.com',
  },

  alias: {
    'site-config-stack': resolve(__dirname, '../../../packages/site-config/src'),
  },

  compatibilityDate: '2024-07-22',
  nitro: {
    prerender: {
      failOnError: false,
      ignore: ['/'],
    },
  },
  // @ts-expect-error untyped
  i18n: {
    baseUrl: 'https://nuxtseo.com',
    detectBrowserLanguage: false,
    defaultLocale: 'en',
    strategy: 'prefix',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
      },
      {
        code: 'es',
        iso: 'es-ES',
      },
      {
        code: 'fr',
        iso: 'fr-FR',
      },
    ],
    meta: true,
  },
})
