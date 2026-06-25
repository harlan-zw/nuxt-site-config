import { resolve } from 'node:path'
import NuxtSiteConfig from '../../../packages/module/src/module'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    NuxtSiteConfig,
  ],

  alias: {
    'site-config-stack': resolve(__dirname, '../../../packages/site-config/src'),
  },

  site: {
    name: 'SPA Site',
    url: 'https://spa.example.com',
  },

  compatibilityDate: '2025-01-29',
})
