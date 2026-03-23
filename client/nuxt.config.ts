import { resolve } from 'pathe'

export default defineNuxtConfig({
  extends: ['nuxtseo-layer-devtools'],

  nitro: {
    output: {
      publicDir: resolve(__dirname, '../packages/module/dist/client'),
    },
  },

  app: {
    baseURL: '/__nuxt-site-config',
  },
})
