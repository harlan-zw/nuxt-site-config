import { resolve } from 'node:path'
import NuxtSiteConfig from '../../../packages/module/src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSiteConfig,
    '@nuxtjs/i18n',
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
        iso: 'en-US',
        file: 'en',
      },
      {
        code: 'es',
        iso: 'es-ES',
        file: 'es',
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr',
      },
    ],
  },
})
