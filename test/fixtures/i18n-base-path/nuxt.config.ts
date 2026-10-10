import { resolve } from 'node:path'
import NuxtSiteConfig from '../../../packages/module/src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    NuxtSiteConfig,
  ],

  site: {
    url: 'https://example.com',
  },

  app: {
    baseURL: '/sub/',
  },

  alias: {
    'site-config-stack': resolve(__dirname, '../../../packages/site-config/src'),
  },

  nitro: {
    prerender: {
      failOnError: false,
      ignore: ['/'],
    },
  },

  // @ts-expect-error untyped
  i18n: {
    defaultLocale: 'en',
    detectBrowserLanguage: false,
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en-US' },
    ],
  },

  compatibilityDate: '2025-01-29',
})
