import { resolve } from 'node:path'
import { createResolver } from '@nuxt/kit'
import NuxtSiteConfig from '../../../packages/module/src/module'

const resolver = createResolver(import.meta.url)

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

  i18n: {
    baseUrl: 'i18n.baseurl.com',
    defaultLocale: 'en',
    strategy: 'prefix',
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: resolver.resolve('locales/en.ts'),
      },
      {
        code: 'es',
        language: 'es-ES',
        file: resolver.resolve('locales/es.ts'),
      },
      {
        code: 'fr',
        language: 'fr-FR',
        file: resolver.resolve('locales/fr.ts'),
      },
    ],
  },

  compatibilityDate: '2025-01-29',
})
