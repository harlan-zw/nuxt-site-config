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
  i18n: {
    baseUrl: 'https://nuxtseo.com',
    defaultLocale: 'en',
    strategy: 'prefix',
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en',
      },
      {
        code: 'es',
        language: 'es-ES',
        file: 'es',
      },
      {
        code: 'fr',
        language: 'fr-FR',
        file: 'fr',
      },
    ],
  },
})
