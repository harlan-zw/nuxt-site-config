import { resolve } from 'pathe'

export default defineNuxtConfig({
  extends: ['nuxtseo-layer-devtools'],

  devtools: {
    enabled: false,
  },

  nitro: {
    output: {
      publicDir: resolve(__dirname, '../packages/module/dist/client'),
    },
  },

  app: {
    baseURL: '/__nuxt-site-config',
  },

  compatibilityDate: '2025-03-13',
})
