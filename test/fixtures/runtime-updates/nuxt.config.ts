import { resolve } from 'node:path'
import NuxtSiteConfig from '../../../packages/module/src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSiteConfig,
    './modules/update-site-config',
  ],

  alias: {
    'site-config-stack': resolve(__dirname, '../../../packages/site-config/src'),
  },

  // Nitro deep freezes runtime config, so this nested identity reaches the server frozen.
  site: {
    url: 'https://example.com',
    name: 'Example',
    identity: {
      type: 'Person',
      name: 'Harlan',
    },
  },

  compatibilityDate: '2025-01-29',
})
