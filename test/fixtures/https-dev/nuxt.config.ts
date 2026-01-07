import { resolve } from 'node:path'
import NuxtSiteConfig from '../../../packages/module/src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSiteConfig,
  ],

  alias: {
    'site-config-stack': resolve(__dirname, '../../../packages/site-config/src'),
  },

  // devServer config for manual testing (pnpm nuxi dev)
  // Tests use x-forwarded-host headers instead
  devServer: process.env.TEST
    ? {}
    : {
        host: 'local.u7buy.com',
        https: {
          key: resolve(__dirname, './https/server.key'),
          cert: resolve(__dirname, './https/server.crt'),
        },
      },

  site: {
    debug: true,
  },

  compatibilityDate: '2025-01-29',
})
