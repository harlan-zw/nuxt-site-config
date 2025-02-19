import { resolve } from 'node:path'
import NuxtSiteConfig from '../../../packages/module/src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSiteConfig,
  ],

  alias: {
    'site-config-stack': resolve(__dirname, '../../../packages/site-config/src'),
  },

  nitro: {
    prerender: {
      failOnError: false,
      ignore: ['/'],
    },
  },

  compatibilityDate: '2025-01-29',
})
