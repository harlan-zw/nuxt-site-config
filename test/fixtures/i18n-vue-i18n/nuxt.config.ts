import { resolve } from 'node:path'
import NuxtSiteConfig from '../../../packages/module/src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    NuxtSiteConfig,
  ],

  site: {
    url: 'https://nuxtseo.com',
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
    restructureDir: false,
    defaultLocale: 'en',
    strategy: 'prefix',
    vueI18n: './i18n.config.ts',
    locales: [
      { code: 'en', language: 'en-US' },
      { code: 'es', language: 'es-ES' },
      { code: 'fr', language: 'fr-FR' },
    ],
  },

  compatibilityDate: '2025-01-29',
})
